import type { User } from "@supabase/supabase-js";

export interface MovieAuthorFields {
  added_by_id: string | null;
  added_by_email: string | null;
  added_by_name: string | null;
}

export function getAuthorFromUser(user: User): MovieAuthorFields {
  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    null;

  return {
    added_by_id: user.id,
    added_by_email: user.email ?? null,
    added_by_name: name,
  };
}

export function getAddedByDisplay(movie: {
  added_by_name?: string | null;
  added_by_email?: string | null;
}): string {
  return movie.added_by_name || movie.added_by_email || "Nieznany";
}
