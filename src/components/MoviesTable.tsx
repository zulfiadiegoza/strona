"use client";

import VersionBadge from "@/components/VersionBadge";
import { formatDate } from "@/lib/format-date";
import { getAddedByDisplay } from "@/lib/movie-author";
import { getMovieVersions } from "@/lib/movie-version";
import { Movie } from "@/types/movie";

interface MoviesTableProps {
  movies: Movie[];
  onEdit: (movie: Movie) => void;
  onDelete: (movie: Movie) => void;
  loading?: boolean;
}

export default function MoviesTable({
  movies,
  onEdit,
  onDelete,
  loading,
}: MoviesTableProps) {
  if (loading) {
    return (
      <div className="neon-border rounded-2xl p-12 text-center text-neutral-400">
        Ładowanie filmów...
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="neon-border rounded-2xl p-12 text-center">
        <p className="text-neutral-400">Brak filmów w bazie</p>
        <p className="text-neutral-500 text-sm mt-1">
          Dodaj pierwszy film, klikając przycisk powyżej
        </p>
      </div>
    );
  }

  return (
    <div className="neon-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="text-left px-6 py-4 font-medium text-neutral-400">
                Tytuł
              </th>
              <th className="text-left px-6 py-4 font-medium text-neutral-400 hidden md:table-cell">
                Link
              </th>
              <th className="text-left px-6 py-4 font-medium text-neutral-400 hidden md:table-cell">
                Dodane przez
              </th>
              <th className="text-left px-6 py-4 font-medium text-neutral-400 hidden lg:table-cell">
                Utworzono
              </th>
              <th className="text-right px-6 py-4 font-medium text-neutral-400">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr
                key={movie.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4 font-medium">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{movie.title}</span>
                      {getMovieVersions(movie).map((version) => (
                        <VersionBadge key={version} version={version} />
                      ))}
                    </div>
                    {movie.subtitle && (
                      <p className="text-xs font-normal text-neutral-500">
                        {movie.subtitle}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <a
                    href={movie.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors truncate block max-w-xs"
                  >
                    {movie.url}
                  </a>
                </td>
                <td className="px-6 py-4 text-neutral-500 hidden md:table-cell">
                  {getAddedByDisplay(movie)}
                </td>
                <td className="px-6 py-4 text-neutral-500 hidden lg:table-cell">
                  {formatDate(movie.created_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(movie)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:border-white/30 hover:text-white transition-all text-xs"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => onDelete(movie)}
                      className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:border-red-500/40 hover:text-red-300 transition-all text-xs"
                    >
                      Usuń
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
