"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Locale = "fr" | "en";
type AccountType = "PRIVATE" | "PROFESSIONAL";

export default function ProfileEditor({ displayName, phone, accountType: initialAccountType, companyName, businessId, professionalPhone, locale = "fr" }: { displayName: string; phone: string | null; accountType: AccountType; companyName: string | null; businessId: string | null; professionalPhone: string | null; locale?: Locale }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);
  const en = locale === "en";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          phone: form.get("phone"),
          accountType,
          companyName: accountType === "PROFESSIONAL" ? form.get("companyName") : "",
          businessId: accountType === "PROFESSIONAL" ? form.get("businessId") : "",
          professionalPhone: accountType === "PROFESSIONAL" ? form.get("professionalPhone") : "",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? (en ? "Unable to update the profile." : "Impossible de modifier le profil."));
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError(en ? "Unable to contact the server." : "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) return <button className="secondaryButton" type="button" onClick={() => setEditing(true)}>{en ? "Edit" : "Modifier"}</button>;

  return (
    <div className="profileEditPanel">
      <form className="profileEditForm" onSubmit={submit}>
        <label><span>{en ? "Display name" : "Nom affiché"}</span><input name="displayName" defaultValue={displayName} minLength={2} maxLength={60} required /></label>
        <label><span>{en ? "Phone" : "Téléphone"}</span><input name="phone" defaultValue={phone ?? ""} inputMode="tel" maxLength={30} placeholder="Ex. +590 690 00 00 00" /></label>
        <fieldset className="accountTypePicker"><legend>{en ? "Account type" : "Type de compte"}</legend><div className="accountTypeOptions">
          <label className={accountType === "PRIVATE" ? "selected" : ""}><input type="radio" checked={accountType === "PRIVATE"} onChange={() => setAccountType("PRIVATE")} /><strong>👤 {en ? "Individual" : "Particulier"}</strong></label>
          <label className={accountType === "PROFESSIONAL" ? "selected" : ""}><input type="radio" checked={accountType === "PROFESSIONAL"} onChange={() => setAccountType("PROFESSIONAL")} /><strong>🏢 {en ? "Professional" : "Professionnel"}</strong></label>
        </div></fieldset>
        {accountType === "PROFESSIONAL" && <div className="professionalFields">
          <label><span>{en ? "Company name" : "Nom de l’entreprise"} *</span><input name="companyName" defaultValue={companyName ?? ""} maxLength={120} required /></label>
          <label><span>{en ? "Business / registration ID" : "SIRET / SIREN / identifiant professionnel"}</span><input name="businessId" defaultValue={businessId ?? ""} maxLength={80} /></label>
          <label><span>{en ? "Professional phone" : "Téléphone professionnel"}</span><input name="professionalPhone" defaultValue={professionalPhone ?? ""} maxLength={30} inputMode="tel" /></label>
        </div>}
        {error && <div className="authError" role="alert">{error}</div>}
        <div className="profileEditActions"><button className="secondaryButton" type="button" onClick={() => { setEditing(false); setError(""); setAccountType(initialAccountType); }} disabled={loading}>{en ? "Cancel" : "Annuler"}</button><button className="authSubmit" type="submit" disabled={loading}>{loading ? (en ? "Saving…" : "Enregistrement…") : (en ? "Save" : "Enregistrer")}</button></div>
      </form>
    </div>
  );
}
