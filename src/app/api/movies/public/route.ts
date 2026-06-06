import { isValidVersion } from "@/lib/movie-version";
import { createAnonClient } from "@/lib/supabase/anon";
import { MOVIE_PUBLIC_FIELDS } from "@/types/movie-public";
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
      .from("movies_public_list")
      .select(MOVIE_PUBLIC_FIELDS)
      .order("updated_at", { ascending: false });

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
