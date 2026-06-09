import { MovieVersion } from "@/lib/movie-version";

export interface Movie {
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  versions: MovieVersion[];
  version?: MovieVersion;
  added_by_id: string | null;
  added_by_email: string | null;
  added_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovieFormData {
  title: string;
  subtitle: string | null;
  url: string;
  versions: MovieVersion[];
}
