import {
  getVersionLabel,
  getVersionStyle,
  MovieVersion,
} from "@/lib/movie-version";

interface VersionBadgeProps {
  version: MovieVersion | string;
  size?: "sm" | "md";
}

export default function VersionBadge({ version, size = "sm" }: VersionBadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold tracking-wide uppercase whitespace-nowrap ${sizeClass} ${getVersionStyle(version)}`}
    >
      {getVersionLabel(version)}
    </span>
  );
}
