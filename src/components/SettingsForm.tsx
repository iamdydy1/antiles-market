"use client";

import { FormEvent, useState } from "react";

export default function SettingsForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.get("currentPassword"),
          newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Impossible de modifier le mot de passe.");
        return;
      }
      event.currentTarget.reset();
      setMessage("Mot de passe modifié avec succès.");
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="authForm" onSubmit={submit}>
      <label>
        <span>Mot de passe actuel</span>
        <input name="currentPassword" type="password" autoComplete="current-password" required />
      </label>
      <label>
        <span>Nouveau mot de passe</span>
        <input name="newPassword" type="password" minLength={8} maxLength={128} autoComplete="new-password" required />
        <small>8 caractères minimum.</small>
      </label>
      <label>
        <span>Confirmer le nouveau mot de passe</span>
        <input name="confirmPassword" type="password" minLength={8} maxLength={128} autoComplete="new-password" required />
      </label>
      {error && <div className="authError" role="alert">{error}</div>}
      {message && <div className="setupNotice" role="status"><strong>{message}</strong></div>}
      <button className="authSubmit" type="submit" disabled={loading}>{loading ? "Enregistrement…" : "Changer mon mot de passe"}</button>
    </form>
  );
}
