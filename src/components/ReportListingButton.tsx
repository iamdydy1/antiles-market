"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function ReportListingButton({ listingId, locale = "fr" }: { listingId: string; locale?: Locale }) {
  const router = useRouter();
  const fr = locale === "fr";
  const reasons = fr
    ? ["Annonce suspecte", "Arnaque / fraude", "Contenu interdit", "Spam", "Prix ou description trompeuse", "Autre"]
    : ["Suspicious listing", "Scam / fraud", "Prohibited content", "Spam", "Misleading price or description", "Other"];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const copy = fr
    ? { toggle: "⚑ Signaler l’annonce", details: "Précisez le problème…", sending: "Envoi…", submit: "Envoyer le signalement", error: "Signalement impossible.", success: "Signalement envoyé. Merci.", server: "Impossible de contacter le serveur." }
    : { toggle: "⚑ Report listing", details: "Describe the problem…", sending: "Sending…", submit: "Send report", error: "Unable to submit the report.", success: "Report sent. Thank you.", server: "Unable to contact the server." };

  async function submit() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, reason, details }),
      });
      if (response.status === 401) {
        router.push(`/connexion?next=${encodeURIComponent(location.pathname)}`);
        return;
      }
      const data = await response.json();
      if (!response.ok) setMessage(data.error ?? copy.error);
      else {
        setMessage(copy.success);
        setDetails("");
      }
    } catch {
      setMessage(copy.server);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reportWidget">
      <button className="reportButton" type="button" onClick={() => setOpen((value) => !value)}>{copy.toggle}</button>
      {open && <div className="reportPanel"><select value={reason} onChange={(event) => setReason(event.target.value)}>{reasons.map((item) => <option key={item} value={item}>{item}</option>)}</select><textarea rows={4} maxLength={2000} placeholder={copy.details} value={details} onChange={(event) => setDetails(event.target.value)} /><button type="button" onClick={submit} disabled={loading}>{loading ? copy.sending : copy.submit}</button>{message && <small>{message}</small>}</div>}
    </div>
  );
}
