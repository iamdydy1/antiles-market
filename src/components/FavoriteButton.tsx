"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FavoriteButton({ listingId, initialFavorited }: { listingId: string; initialFavorited: boolean }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const response = await fetch(`/api/favorites/${listingId}`, { method: favorited ? "DELETE" : "POST" });
    if (response.status === 401) {
      router.push(`/connexion?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (response.ok) setFavorited(!favorited);
    setLoading(false);
  }

  return (
    <button className={`favoriteDetailButton ${favorited ? "active" : ""}`} type="button" onClick={toggle} disabled={loading}>
      {favorited ? "♥ Dans mes favoris" : "♡ Ajouter aux favoris"}
    </button>
  );
}
