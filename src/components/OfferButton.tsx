"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function OfferButton({ listingId, currency, disabled = false }: { listingId: string; currency: string; disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, amount: form.get("amount"), message: form.get("message") }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push("/connexion");
        return;
      }
      if (!response.ok) {
        setError(data.error ?? "Impossible d’envoyer l’offre.");
        return;
      }
      setSuccess("Offre envoyée. Le vendeur dispose de 48 heures pour répondre.");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="offerBox">
    <button className="secondaryButton offerToggle" type="button" disabled={disabled} onClick={() => setOpen((value) => !value)}>
      💶 Faire une offre
    </button>
    {open && <form className="offerForm" onSubmit={submit}>
      <label><span>Votre offre</span><div className="offerAmount"><input name="amount" type="number" min="0.01" step="0.01" required /><b>{currency}</b></div></label>
      <label><span>Message facultatif</span><textarea name="message" maxLength={500} rows={3} placeholder="Ex. Je peux venir la récupérer demain." /></label>
      <small>Votre offre expire automatiquement après 48 heures si elle reste sans réponse.</small>
      <div className="offerActions"><button type="button" className="secondaryButton" onClick={() => setOpen(false)}>Annuler</button><button type="submit" className="authSubmit" disabled={loading}>{loading ? "Envoi…" : "Envoyer l’offre"}</button></div>
    </form>}
    {error && <small className="inlineError">{error}</small>}
    {success && <small className="inlineSuccess">{success}</small>}
  </div>;
}
