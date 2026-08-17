"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function OfferActions({ offerId, canRespond, canWithdraw, currency, locale = "fr" }: { offerId: string; canRespond: boolean; canWithdraw: boolean; currency: string; locale?: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countering, setCountering] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const fr = locale === "fr";
  const copy = fr
    ? { actionError: "Action impossible.", serverError: "Impossible de contacter le serveur.", accept: "Accepter", reject: "Refuser", counter: "Contre-offre", amount: `Montant en ${currency}`, send: "Envoyer", cancel: "Annuler", withdraw: "Retirer mon offre" }
    : { actionError: "Unable to complete this action.", serverError: "Unable to contact the server.", accept: "Accept", reject: "Reject", counter: "Counter-offer", amount: `Amount in ${currency}`, send: "Send", cancel: "Cancel", withdraw: "Withdraw my offer" };

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
        setError(data.error ?? copy.actionError);
        return;
      }
      setCountering(false);
      setAmount("");
      router.refresh();
    } catch {
      setError(copy.serverError);
    } finally {
      setLoading(false);
    }
  }

  return <div className="offerManageActions">
    {canRespond && !countering && <>
      <button type="button" className="authSubmit" disabled={loading} onClick={() => act("accept")}>{copy.accept}</button>
      <button type="button" className="secondaryButton" disabled={loading} onClick={() => act("reject")}>{copy.reject}</button>
      <button type="button" className="secondaryButton" disabled={loading} onClick={() => setCountering(true)}>{copy.counter}</button>
    </>}
    {countering && <div className="counterOfferForm"><input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={copy.amount} /><button type="button" className="authSubmit" disabled={loading || !amount} onClick={() => act("counter")}>{copy.send}</button><button type="button" className="secondaryButton" onClick={() => setCountering(false)}>{copy.cancel}</button></div>}
    {canWithdraw && <button type="button" className="secondaryButton" disabled={loading} onClick={() => act("withdraw")}>{copy.withdraw}</button>}
    {error && <small className="inlineError">{error}</small>}
  </div>;
}
