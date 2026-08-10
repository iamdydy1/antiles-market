"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OfferActions({ offerId, canRespond, canWithdraw, currency }: { offerId: string; canRespond: boolean; canWithdraw: boolean; currency: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countering, setCountering] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  async function act(action: "accept" | "reject" | "counter" | "withdraw") {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "counter" ? { action, amount } : { action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Action impossible.");
        return;
      }
      setCountering(false);
      setAmount("");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="offerManageActions">
    {canRespond && !countering && <>
      <button type="button" className="authSubmit" disabled={loading} onClick={() => act("accept")}>Accepter</button>
      <button type="button" className="secondaryButton" disabled={loading} onClick={() => act("reject")}>Refuser</button>
      <button type="button" className="secondaryButton" disabled={loading} onClick={() => setCountering(true)}>Contre-offre</button>
    </>}
    {countering && <div className="counterOfferForm"><input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Montant en ${currency}`} /><button type="button" className="authSubmit" disabled={loading || !amount} onClick={() => act("counter")}>Envoyer</button><button type="button" className="secondaryButton" onClick={() => setCountering(false)}>Annuler</button></div>}
    {canWithdraw && <button type="button" className="secondaryButton" disabled={loading} onClick={() => act("withdraw")}>Retirer mon offre</button>}
    {error && <small className="inlineError">{error}</small>}
  </div>;
}
