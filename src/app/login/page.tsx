"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [login, setlogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: login,
      password,
    });

    if (authError) {
      setError("Nieprawidłowy login lub hasło");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl neon-border neon-glow mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold neon-text tracking-tight">
            Baza Filmów
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">
            Panel administracyjny
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="neon-border rounded-2xl p-8 bg-neutral-950/80 backdrop-blur-sm"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="login"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                login
              </label>
              <input
                id="login"
                type="login"
                value={login}
                onChange={(e) => setlogin(e.target.value)}
                required
                autoComplete="login"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:border-white/30 transition-colors"
                placeholder="Login"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Hasło
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-neutral-500 focus:border-white/30 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold neon-glow neon-glow-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>
          </div>
        </form>

        <p className="text-center text-neutral-500 text-xs mt-6">
          Dostęp tylko dla wygenerowanych użytkowników
        </p>
      </div>
    </div>
  );
}
