"use client";

import DashboardHeader from "@/components/DashboardHeader";
import MovieModal from "@/components/MovieModal";
import MoviesTable from "@/components/MoviesTable";
import SearchBar from "@/components/SearchBar";
import VersionFilter from "@/components/VersionFilter";
import { MovieVersion } from "@/lib/movie-version";
import { Movie, MovieFormData } from "@/types/movie";
import { useCallback, useEffect, useState } from "react";

interface DashboardProps {
  email: string;
}

export default function Dashboard({ email }: DashboardProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [versionFilter, setVersionFilter] = useState<MovieVersion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Movie | null>(null);
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
        const res = await fetch(`/api/movies${qs ? `?${qs}` : ""}`);
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

  async function handleSave(data: MovieFormData) {
    if (editingMovie) {
      const res = await fetch(`/api/movies/${editingMovie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Nie udało się zaktualizować filmu");
      }
    } else {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Nie udało się dodać filmu");
      }
    }
    await fetchMovies(search, versionFilter);
    setEditingMovie(null);
  }

  async function handleDelete(movie: Movie) {
    const res = await fetch(`/api/movies/${movie.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Nie udało się usunąć filmu");
      return;
    }
    setDeleteConfirm(null);
    await fetchMovies(search, versionFilter);
  }

  function openAddModal() {
    setEditingMovie(null);
    setModalOpen(true);
  }

  function openEditModal(movie: Movie) {
    setEditingMovie(movie);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <DashboardHeader email={email} />

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <SearchBar value={search} onChange={setSearch} />
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm neon-glow neon-glow-hover transition-all whitespace-nowrap"
          >
            + Dodaj film
          </button>
        </div>

        <div className="mb-6">
          <VersionFilter value={versionFilter} onChange={setVersionFilter} />
        </div>

        {fetchError && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {fetchError}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-neutral-500 text-sm">
            {loading ? "..." : `${movies.length} filmów`}
          </p>
          <p className="text-neutral-600 text-xs hidden sm:block">
            API: GET /api/movies
          </p>
        </div>

        <MoviesTable
          movies={movies}
          onEdit={openEditModal}
          onDelete={(movie) => setDeleteConfirm(movie)}
          loading={loading}
        />
      </div>

      <MovieModal
        key={modalOpen ? (editingMovie?.id ?? "new") : "closed"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMovie(null);
        }}
        onSave={handleSave}
        movie={editingMovie}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm neon-border rounded-2xl bg-neutral-950 p-6 animate-modal-in">
            <h3 className="text-lg font-bold mb-2">Usuń film</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Czy na pewno chcesz usunąć &quot;{deleteConfirm.title}&quot;?
              Tej operacji nie można cofnąć.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:border-white/30 transition-all text-sm"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
