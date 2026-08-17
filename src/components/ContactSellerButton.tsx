"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function ContactSellerButton({ listingId, locale = "fr" }: { listingId: string; locale?: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fr = locale === "fr";

  async function openConversation() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId }) });
      const data = await response.json();
      if (response.status === 401) { router.push("/connexion"); return; }
      if (!response.ok) { setError(data.error ?? (fr ? "Impossible d’ouvrir la conversation." : "Unable to open the conversation.")); return; }
      router.push(`/messages/${data.conversationId}`);
    } catch { setError(fr ? "Impossible de contacter le serveur." : "Unable to contact the server."); }
    finally { setLoading(false); }
  }

  return <><button className="contactSellerButton" type="button" onClick={openConversation} disabled={loading}>{loading ? (fr ? "Ouverture…" : "Opening…") : (fr ? "💬 Contacter le vendeur" : "💬 Contact seller")}</button>{error && <small className="inlineError">{error}</small>}</>;
}
