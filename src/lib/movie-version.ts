export const MOVIE_VERSIONS = ["CAM", "ENG", "PL_NAPISY", "POLSKI"] as const;
export type MovieVersion = (typeof MOVIE_VERSIONS)[number];
export const DEFAULT_MOVIE_VERSIONS: MovieVersion[] = ["CAM"];

export const VERSION_LABELS: Record<MovieVersion, string> = {
  CAM: "CAM",
  ENG: "ENG",
  PL_NAPISY: "PL NAPISY",
  POLSKI: "POLSKI",
};

export const VERSION_STYLES: Record<MovieVersion, string> = {
  CAM: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.35)]",
  ENG: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
  PL_NAPISY:
    "bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.35)]",
  POLSKI:
    "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.35)]",
};

export function isValidVersion(value: string): value is MovieVersion {
  return MOVIE_VERSIONS.includes(value as MovieVersion);
}

function uniqueVersions(versions: MovieVersion[]): MovieVersion[] {
  return versions.filter((version, index) => versions.indexOf(version) === index);
}

export function parseMovieVersions(value: unknown): MovieVersion[] | null {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : value == null
        ? []
        : [value];

  const versions = rawValues
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (versions.length === 0) return [...DEFAULT_MOVIE_VERSIONS];
  if (!versions.every(isValidVersion)) return null;

  return uniqueVersions(versions as MovieVersion[]);
}

export function getMovieVersions(movie: {
  versions?: readonly string[] | null;
  version?: string | null;
}): MovieVersion[] {
  if (Array.isArray(movie.versions) && movie.versions.length > 0) {
    return parseMovieVersions(movie.versions) ?? [...DEFAULT_MOVIE_VERSIONS];
  }

  return parseMovieVersions(movie.version) ?? [...DEFAULT_MOVIE_VERSIONS];
}

export function getVersionLabel(version: string): string {
  if (isValidVersion(version)) return VERSION_LABELS[version];
  return version;
}

export function getVersionStyle(version: string): string {
  if (isValidVersion(version)) return VERSION_STYLES[version];
  return "bg-neutral-500/20 text-neutral-300 border-neutral-500/40";
}
