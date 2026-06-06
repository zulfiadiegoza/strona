"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Szukaj po tytule..."
        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:border-white/30 transition-colors text-sm"
      />
    </div>
  );
}
