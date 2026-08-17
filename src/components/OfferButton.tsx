"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function OfferButton({ listingId, currency, locale = "fr", disabled = false }: { listingId: string; currency: string; locale?: Locale; disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fr = locale === "fr";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId, amount: form.get("amount"), message: form.get("message") }) });
      const data = await response.json();
      if (response.status === 401) { router.push("/connexion"); return; }
      if (!response.ok) { setError(data.error ?? (fr ? "Impossible d’envoyer l’offre." : "Unable to send the offer.")); return; }
      setSuccess(fr ? "Offre envoyée. Le vendeur dispose de 48 heures pour répondre." : "Offer sent. The seller has 48 hours to respond.");
      setOpen(false); router.refresh();
    } catch { setError(fr ? "Impossible de contacter le serveur." : "Unable to contact the server."); }
    finally { setLoading(false); }
  }

  return <div className="offerBox">
    <button className="secondaryButton offerToggle" type="button" disabled={disabled} onClick={() => setOpen(v => !v)}>💶 {fr ? "Faire une offre" : "Make an offer"}</button>
    {open && <form className="offerForm" onSubmit={submit}>
      <label><span>{fr ? "Votre offre" : "Your offer"}</span><div className="offerAmount"><input name="amount" type="number" min="0.01" step="0.01" required /><b>{currency}</b></div></label>
      <label><span>{fr ? "Message facultatif" : "Optional message"}</span><textarea name="message" maxLength={500} rows={3} placeholder={fr ? "Ex. Je peux venir la récupérer demain." : "E.g. I can pick it up tomorrow."} /></label>
      <small>{fr ? "Votre offre expire automatiquement après 48 heures si elle reste sans réponse." : "Your offer automatically expires after 48 hours if there is no response."}</small>
      <div className="offerActions"><button type="button" className="secondaryButton" onClick={() => setOpen(false)}>{fr ? "Annuler" : "Cancel"}</button><button type="submit" className="authSubmit" disabled={loading}>{loading ? (fr ? "Envoi…" : "Sending…") : (fr ? "Envoyer l’offre" : "Send offer")}</button></div>
    </form>}
    {error && <small className="inlineError">{error}</small>}{success && <small className="inlineSuccess">{success}</small>}
  </div>;
}
