import { requireAuth } from "@/lib/auth";
import { isValidVersion } from "@/lib/movie-version";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await context.params;
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
      .update({ title, url, version })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Film nie znaleziony" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await context.params;

    const supabase = await createClient();
    const { error } = await supabase.from("movies").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
