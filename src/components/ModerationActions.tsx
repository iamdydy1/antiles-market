"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModerationActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "RESOLVE" | "REJECT" | "REMOVE_LISTING") {
    if (action === "REMOVE_LISTING" && !window.confirm("Retirer cette annonce de la plateforme ?")) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? "Action impossible.");
      else router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return <div className="moderationActions"><button disabled={loading} onClick={() => act("RESOLVE")}>Résoudre</button><button disabled={loading} onClick={() => act("REJECT")}>Rejeter</button><button className="dangerAction" disabled={loading} onClick={() => act("REMOVE_LISTING")}>Retirer l’annonce</button>{error && <small className="inlineError">{error}</small>}</div>;
}
