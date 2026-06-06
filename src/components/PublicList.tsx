"use client";

import PublicMoviesTable from "@/components/PublicMoviesTable";
import SearchBar from "@/components/SearchBar";
import VersionFilter from "@/components/VersionFilter";
import { MovieVersion } from "@/lib/movie-version";
import { MoviePublic } from "@/types/movie-public";
import { useCallback, useEffect, useState } from "react";

export default function PublicList() {
  const [movies, setMovies] = useState<MoviePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [versionFilter, setVersionFilter] = useState<MovieVersion | null>(null);
  const [fetchError, setFetchError] = useState("");

  const fetchMovies = useCallback(
    async (searchQuery?: string, version?: MovieVersion | null) => {
      setLoading(true);
      setFetchError("");
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (version) params.set("version", version);
        const qs = params.toString();
        const res = await fetch(`/api/movies/public${qs ? `?${qs}` : ""}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Nie udało się pobrać filmów");
        }
        setMovies(data);
      } catch (err) {
        setMovies([]);
        setFetchError(
          err instanceof Error ? err.message : "Nie udało się pobrać filmów"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies(search, versionFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, versionFilter, fetchMovies]);

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold neon-text tracking-tight">
            Baza Filmów
          </h1>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="mb-6">
          <VersionFilter value={versionFilter} onChange={setVersionFilter} />
        </div>

        {fetchError && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {fetchError}
          </div>
        )}

        <div className="mb-4">
          <p className="text-neutral-500 text-sm">
            {loading ? "..." : `${movies.length} filmów`}
          </p>
        </div>

        <PublicMoviesTable movies={movies} loading={loading} />
      </div>
    </div>
  );
}
