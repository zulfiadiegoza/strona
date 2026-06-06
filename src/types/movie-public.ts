import { MovieVersion } from "@/lib/movie-version";

export interface MoviePublic {
  id: string;
  title: string;
  version: MovieVersion;
  created_at: string;
  updated_at: string;
}

export const MOVIE_PUBLIC_FIELDS =
  "id, title, version, created_at, updated_at" as const;
