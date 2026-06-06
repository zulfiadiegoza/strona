"use client";

import VersionBadge from "@/components/VersionBadge";
import { formatDate } from "@/lib/format-date";
import { getAddedByDisplay } from "@/lib/movie-author";
import { MoviePublic } from "@/types/movie-public";

interface PublicMoviesTableProps {
  movies: MoviePublic[];
  loading?: boolean;
}

export default function PublicMoviesTable({
  movies,
  loading,
}: PublicMoviesTableProps) {
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
          Lista jest pusta lub brak wyników wyszukiwania
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
                Dodane przez
              </th>
              <th className="text-left px-6 py-4 font-medium text-neutral-400 hidden lg:table-cell">
                Dodano
              </th>
              <th className="text-left px-6 py-4 font-medium text-neutral-400 hidden xl:table-cell">
                Ostatnia edycja
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{movie.title}</span>
                    <VersionBadge version={movie.version ?? "CAM"} />
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-500 hidden md:table-cell">
                  {getAddedByDisplay(movie)}
                </td>
                <td className="px-6 py-4 text-neutral-500 hidden lg:table-cell">
                  {formatDate(movie.created_at)}
                </td>
                <td className="px-6 py-4 text-neutral-500 hidden xl:table-cell">
                  {formatDate(movie.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
