"use client";

import VersionBadge from "@/components/VersionBadge";
import {
  getMovieVersions,
  MOVIE_VERSIONS,
  MovieVersion,
} from "@/lib/movie-version";
import { Movie, MovieFormData } from "@/types/movie";
import { FormEvent, KeyboardEvent, useState } from "react";

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MovieFormData) => Promise<void>;
  movie?: Movie | null;
}

function splitSubtitleAliases(value?: string | null): string[] {
  return String(value ?? "")
    .split(/[,;/|\n]+/)
    .map((alias) => alias.trim())
    .filter(Boolean)
    .filter(
      (alias, index, aliases) =>
        aliases.findIndex(
          (item) => item.toLowerCase() === alias.toLowerCase()
        ) === index
    );
}

export default function MovieModal({
  isOpen,
  onClose,
  onSave,
  movie,
}: MovieModalProps) {
  const [title, setTitle] = useState(movie?.title ?? "");
  const [aliases, setAliases] = useState<string[]>(
    splitSubtitleAliases(movie?.subtitle)
  );
  const [aliasInput, setAliasInput] = useState("");
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
      const submittedAliases = [...aliases];
      splitSubtitleAliases(aliasInput).forEach((alias) => {
        const alreadyAdded = submittedAliases.some(
          (item) => item.toLowerCase() === alias.toLowerCase()
        );
        if (!alreadyAdded) submittedAliases.push(alias);
      });

      await onSave({
        title: title.trim(),
        subtitle: submittedAliases.join(", ") || null,
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

  function addAliases(value = aliasInput) {
    const nextAliases = splitSubtitleAliases(value);
    if (nextAliases.length === 0) return;

    setAliases((current) => {
      const seen = new Set(current.map((alias) => alias.toLowerCase()));
      const uniqueNextAliases = nextAliases.filter((alias) => {
        const key = alias.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return [...current, ...uniqueNextAliases];
    });
    setAliasInput("");
  }

  function removeAlias(aliasToRemove: string) {
    setAliases((current) =>
      current.filter((alias) => alias !== aliasToRemove)
    );
  }

  function handleAliasKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;

    e.preventDefault();
    addAliases();
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
              htmlFor="alias"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Inne nazwy
            </label>
            <div className="flex gap-2">
              <input
                id="alias"
                type="text"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={handleAliasKeyDown}
                className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:border-white/30 transition-colors"
                placeholder="np. AOT"
              />
              <button
                type="button"
                onClick={() => addAliases()}
                className="px-4 py-3 rounded-xl border border-white/10 text-neutral-300 hover:border-white/30 hover:text-white transition-all text-sm font-medium"
              >
                Dodaj
              </button>
            </div>

            {aliases.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {aliases.map((alias) => (
                  <span
                    key={alias}
                    className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-neutral-200"
                  >
                    <span className="truncate">{alias}</span>
                    <button
                      type="button"
                      onClick={() => removeAlias(alias)}
                      className="text-neutral-500 hover:text-white transition-colors"
                      aria-label={`Usun ${alias}`}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
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
