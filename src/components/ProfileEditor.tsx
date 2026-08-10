"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileEditor({ displayName, phone }: { displayName: string; phone: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: form.get("displayName"), phone: form.get("phone") }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Impossible de modifier le profil.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return <button className="secondaryButton" type="button" onClick={() => setEditing(true)}>Modifier</button>;
  }

  return (
    <div className="profileEditPanel">
      <form className="profileEditForm" onSubmit={submit}>
        <label><span>Nom affiché</span><input name="displayName" defaultValue={displayName} minLength={2} maxLength={60} required /></label>
        <label><span>Téléphone</span><input name="phone" defaultValue={phone ?? ""} inputMode="tel" maxLength={30} placeholder="Ex. +590 690 00 00 00" /></label>
        {error && <div className="authError" role="alert">{error}</div>}
        <div className="profileEditActions"><button className="secondaryButton" type="button" onClick={() => { setEditing(false); setError(""); }} disabled={loading}>Annuler</button><button className="authSubmit" type="submit" disabled={loading}>{loading ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form>
    </div>
  );
}
