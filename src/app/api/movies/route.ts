import { requireAuth } from "@/lib/auth";
import { sendMovieAddedWebhook } from "@/lib/discord-webhook";
import { isValidVersion, parseMovieVersions } from "@/lib/movie-version";
import { getAuthorFromUser } from "@/lib/movie-author";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

function hasValidMovieApiToken(request: NextRequest): boolean {
  const apiToken = process.env.MOVIE_API_TOKEN?.trim();
  if (!apiToken) return false;

  const apiKey = request.headers.get("x-api-key")?.trim();
  const authHeader = request.headers.get("authorization")?.trim();
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  return apiKey === apiToken || bearerToken === apiToken;
}

async function getPrivateMoviesClient(request: NextRequest) {
  if (hasValidMovieApiToken(request)) {
    return {
      supabase: createServiceClient(),
      error: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    supabase,
    error: null,
  };
}

function getSiteUrl(request: NextRequest): string | undefined {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return undefined;
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await getPrivateMoviesClient(request);
    if (authError) return authError;

    if (!supabase) {
      return NextResponse.json(
        { error: "Brakuje konfiguracji SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const version = searchParams.get("version")?.trim();

    if (version && !isValidVersion(version)) {
      return NextResponse.json({ error: "Nieprawidłowa wersja" }, { status: 400 });
    }

    let query = supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%`);
    }

    if (version) {
      query = query.contains("versions", [version]);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth();
  if (authError || !user) return authError;

  try {
    const body = await request.json();
    const title = body.title?.trim();
    const subtitle =
      typeof body.subtitle === "string" ? body.subtitle.trim() : "";
    const url = body.url?.trim();
    const versions = parseMovieVersions(body.versions ?? body.version);

    if (!title || !url) {
      return NextResponse.json(
        { error: "Tytuł i link są wymagane" },
        { status: 400 }
      );
    }

    if (!versions) {
      return NextResponse.json({ error: "Nieprawidłowa wersja" }, { status: 400 });
    }

    const author = getAuthorFromUser(user);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("movies")
      .insert({ title, subtitle: subtitle || null, url, versions, ...author })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const siteUrl = getSiteUrl(request);
    void sendMovieAddedWebhook(data, user, {
      listaUrl: siteUrl ? `${siteUrl}/lista` : undefined,
    });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
