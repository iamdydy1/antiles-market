"use client";

import { useState } from "react";

export default function ReportListingButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Annonce suspecte");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, reason, details }),
      });
      const data = await response.json();
      if (!response.ok) setMessage(data.error ?? "Signalement impossible.");
      else {
        setMessage("Signalement envoyé. Merci.");
        setDetails("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reportWidget">
      <button className="reportButton" type="button" onClick={() => setOpen((value) => !value)}>⚑ Signaler l’annonce</button>
      {open && <div className="reportPanel"><select value={reason} onChange={(event) => setReason(event.target.value)}><option>Annonce suspecte</option><option>Arnaque / fraude</option><option>Contenu interdit</option><option>Spam</option><option>Prix ou description trompeuse</option><option>Autre</option></select><textarea rows={4} maxLength={2000} placeholder="Précisez le problème…" value={details} onChange={(event) => setDetails(event.target.value)} /><button type="button" onClick={submit} disabled={loading}>{loading ? "Envoi…" : "Envoyer le signalement"}</button>{message && <small>{message}</small>}</div>}
    </div>
  );
}
