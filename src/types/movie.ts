import { MovieVersion } from "@/lib/movie-version";

export interface Movie {
  id: string;
  title: string;
  url: string;
  version: MovieVersion;
  created_at: string;
  updated_at: string;
}

export interface MovieFormData {
  title: string;
  url: string;
  version: MovieVersion;
}
