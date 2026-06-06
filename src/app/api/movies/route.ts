import { requireAuth } from "@/lib/auth";
import { isValidVersion } from "@/lib/movie-version";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const version = searchParams.get("version")?.trim();

    if (version && !isValidVersion(version)) {
      return NextResponse.json({ error: "Nieprawidłowa wersja" }, { status: 400 });
    }

    const supabase = createAnonClient();
    let query = supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (version) {
      query = query.eq("version", version);
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
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const title = body.title?.trim();
    const url = body.url?.trim();
    const version = body.version?.trim() || "CAM";

    if (!title || !url) {
      return NextResponse.json(
        { error: "Tytuł i link są wymagane" },
        { status: 400 }
      );
    }

    if (!isValidVersion(version)) {
      return NextResponse.json({ error: "Nieprawidłowa wersja" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("movies")
      .insert({ title, url, version })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
