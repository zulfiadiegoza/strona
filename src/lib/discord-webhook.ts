import { getMovieVersions, getVersionLabel } from "@/lib/movie-version";
import { getAddedByDisplay } from "@/lib/movie-author";
import type { Movie } from "@/types/movie";
import type { User } from "@supabase/supabase-js";

interface WebhookOptions {
  listaUrl?: string;
}

function formatWebhookDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function sendMovieAddedWebhook(
  movie: Movie,
  user: User,
  options?: WebhookOptions
): Promise<void> {
  const webhookUrl = process.env.DISCORD_MOVIES_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const addedBy = getAddedByDisplay({
    added_by_name: movie.added_by_name,
    added_by_email: movie.added_by_email ?? user.email,
  });
  const versions = getMovieVersions(movie).map(getVersionLabel).join(", ");

  const embed: Record<string, unknown> = {
    title: "🎬 Dodano nowy film",
    color: 0xffffff,
    fields: [
      { name: "Tytuł", value: movie.title, inline: false },
      ...(movie.subtitle
        ? [{ name: "Inne nazwy", value: movie.subtitle, inline: false }]
        : []),
      { name: "Wersje", value: versions, inline: true },
      { name: "Dodał", value: addedBy, inline: true },
      {
        name: "Data",
        value: formatWebhookDate(movie.created_at),
        inline: true,
      },
    ],
    timestamp: movie.created_at,
  };

  if (options?.listaUrl) {
    embed.url = options.listaUrl;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      console.error("Discord webhook failed:", response.status);
    }
  } catch {
    console.error("Discord webhook request failed");
  }
}
