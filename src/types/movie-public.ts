import { MovieVersion } from "@/lib/movie-version";

export interface MoviePublic {
  id: string;
  title: string;
  subtitle: string | null;
  versions: MovieVersion[];
  version?: MovieVersion;
  created_at: string;
  updated_at: string;
  added_by_name: string | null;
  added_by_email: string | null;
}

export const MOVIE_PUBLIC_FIELDS =
  "id, title, subtitle, versions, created_at, updated_at, added_by_name, added_by_email" as const;
