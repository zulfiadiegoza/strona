"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  email: string;
}

export default function DashboardHeader({ email }: DashboardHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold neon-text tracking-tight">
          Baza Filmów
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-400 hidden sm:block">{email}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-white/10 text-sm text-neutral-300 hover:border-white/30 hover:text-white transition-all duration-200"
        >
          Wyloguj
        </button>
      </div>
    </header>
  );
}
