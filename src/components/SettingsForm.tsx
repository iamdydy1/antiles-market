"use client";

import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/i18n";

export default function SettingsForm({ locale = "fr" }: { locale?: Locale }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fr = locale === "fr";
  const copy = fr
    ? {
        mismatch: "Les deux nouveaux mots de passe ne correspondent pas.",
        updateError: "Impossible de modifier le mot de passe.",
        success: "Mot de passe modifié avec succès.",
        serverError: "Impossible de contacter le serveur.",
        current: "Mot de passe actuel",
        next: "Nouveau mot de passe",
        confirm: "Confirmer le nouveau mot de passe",
        minimum: "8 caractères minimum.",
        saving: "Enregistrement…",
        submit: "Changer mon mot de passe",
      }
    : {
        mismatch: "The two new passwords do not match.",
        updateError: "Unable to change the password.",
        success: "Password changed successfully.",
        serverError: "Unable to contact the server.",
        current: "Current password",
        next: "New password",
        confirm: "Confirm new password",
        minimum: "8 characters minimum.",
        saving: "Saving…",
        submit: "Change my password",
      };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError(copy.mismatch);
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
        setError(data.error ?? copy.updateError);
        return;
      }
      event.currentTarget.reset();
      setMessage(copy.success);
    } catch {
      setError(copy.serverError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="authForm" onSubmit={submit}>
      <label>
        <span>{copy.current}</span>
        <input name="currentPassword" type="password" autoComplete="current-password" required />
      </label>
      <label>
        <span>{copy.next}</span>
        <input name="newPassword" type="password" minLength={8} maxLength={128} autoComplete="new-password" required />
        <small>{copy.minimum}</small>
      </label>
      <label>
        <span>{copy.confirm}</span>
        <input name="confirmPassword" type="password" minLength={8} maxLength={128} autoComplete="new-password" required />
      </label>
      {error && <div className="authError" role="alert">{error}</div>}
      {message && <div className="setupNotice" role="status"><strong>{message}</strong></div>}
      <button className="authSubmit" type="submit" disabled={loading}>{loading ? copy.saving : copy.submit}</button>
    </form>
  );
}
