"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactSellerButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openConversation() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push("/connexion");
        return;
      }
      if (!response.ok) {
        setError(data.error ?? "Impossible d’ouvrir la conversation.");
        return;
      }
      router.push(`/messages/${data.conversationId}`);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="contactSellerButton" type="button" onClick={openConversation} disabled={loading}>
        {loading ? "Ouverture…" : "💬 Contacter le vendeur"}
      </button>
      {error && <small className="inlineError">{error}</small>}
    </>
  );
}
