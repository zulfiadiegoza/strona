"use client";

import VersionBadge from "@/components/VersionBadge";
import {
  getMovieVersions,
  MOVIE_VERSIONS,
  MovieVersion,
} from "@/lib/movie-version";
import { Movie, MovieFormData } from "@/types/movie";
import { FormEvent, useState } from "react";

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MovieFormData) => Promise<void>;
  movie?: Movie | null;
}

export default function MovieModal({
  isOpen,
  onClose,
  onSave,
  movie,
}: MovieModalProps) {
  const [title, setTitle] = useState(movie?.title ?? "");
  const [subtitle, setSubtitle] = useState(movie?.subtitle ?? "");
  const [url, setUrl] = useState(movie?.url ?? "");
  const [versions, setVersions] = useState<MovieVersion[]>(
    getMovieVersions(movie ?? {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!movie;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (versions.length === 0) {
      setError("Wybierz przynajmniej jedna wersje");
      return;
    }

    setLoading(true);

    try {
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        url: url.trim(),
        versions,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }

  function toggleVersion(version: MovieVersion) {
    setVersions((current) =>
      current.includes(version)
        ? current.filter((item) => item !== version)
        : [...current, version]
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg neon-border rounded-2xl bg-neutral-950 p-6 animate-modal-in neon-glow">
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? "Edytuj film" : "Dodaj film"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Tytuł filmu
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:border-white/30 transition-colors"
              placeholder="np. Inception"
            />
          </div>

          <div>
            <label
              htmlFor="subtitle"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Podtytul / inne nazwy
            </label>
            <input
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:border-white/30 transition-colors"
              placeholder="np. Attack on Titan, AOT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Wersja
            </label>
            <div className="flex flex-wrap gap-2">
              {MOVIE_VERSIONS.map((v) => (
                <label
                  key={v}
                  className="cursor-pointer rounded-lg transition-all"
                >
                  <input
                    type="checkbox"
                    checked={versions.includes(v)}
                    onChange={() => toggleVersion(v)}
                    className="sr-only"
                  />
                  <span
                    className={`block rounded-lg transition-all ${
                      versions.includes(v)
                        ? "ring-2 ring-white/50 scale-105"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <VersionBadge version={v} size="md" />
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Link do filmu
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:border-white/30 transition-colors"
              placeholder="https://..."
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-neutral-300 hover:border-white/30 hover:text-white transition-all"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-semibold neon-glow-hover transition-all disabled:opacity-50"
            >
              {loading ? "Zapisywanie..." : isEditing ? "Zapisz" : "Dodaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
