"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function FavoriteButton({ listingId, initialFavorited, locale = "fr" }: { listingId: string; initialFavorited: boolean; locale?: Locale }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const fr = locale === "fr";

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/favorites/${listingId}`, { method: favorited ? "DELETE" : "POST" });
      if (response.status === 401) {
        router.push(`/connexion?next=${encodeURIComponent(location.pathname)}`);
        return;
      }
      if (response.ok) setFavorited(!favorited);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className={`favoriteDetailButton ${favorited ? "active" : ""}`} type="button" onClick={toggle} disabled={loading}>
      {favorited ? (fr ? "♥ Dans mes favoris" : "♥ Saved to favorites") : (fr ? "♡ Ajouter aux favoris" : "♡ Add to favorites")}
    </button>
  );
}
