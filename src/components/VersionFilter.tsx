"use client";

import {
  MOVIE_VERSIONS,
  MovieVersion,
  VERSION_LABELS,
  VERSION_STYLES,
} from "@/lib/movie-version";

interface VersionFilterProps {
  value: MovieVersion | null;
  onChange: (value: MovieVersion | null) => void;
}

export default function VersionFilter({ value, onChange }: VersionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
          value === null
            ? "bg-white text-black border-white neon-glow"
            : "border-white/10 text-neutral-400 hover:border-white/30 hover:text-white"
        }`}
      >
        Wszystkie
      </button>
      {MOVIE_VERSIONS.map((version) => (
        <button
          key={version}
          onClick={() => onChange(version)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all uppercase ${
            value === version
              ? VERSION_STYLES[version]
              : "border-white/10 text-neutral-400 hover:border-white/20"
          }`}
        >
          {VERSION_LABELS[version]}
        </button>
      ))}
    </div>
  );
}
