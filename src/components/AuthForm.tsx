"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = mode === "register"
      ? {
          displayName: form.get("displayName"),
          email: form.get("email"),
          password: form.get("password"),
        }
      : {
          email: form.get("email"),
          password: form.get("password"),
        };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      router.push("/compte");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="authForm" onSubmit={submit}>
      {mode === "register" && (
        <label>
          <span>Nom affiché</span>
          <input name="displayName" type="text" minLength={2} maxLength={60} placeholder="Ex. Wendy S." required autoComplete="name" />
        </label>
      )}

      <label>
        <span>Adresse e-mail</span>
        <input name="email" type="email" placeholder="vous@exemple.com" required autoComplete="email" />
      </label>

      <label>
        <span>Mot de passe</span>
        <input name="password" type="password" minLength={mode === "register" ? 8 : 1} placeholder="••••••••" required autoComplete={mode === "register" ? "new-password" : "current-password"} />
        {mode === "register" && <small>8 caractères minimum.</small>}
      </label>

      {error && <div className="authError" role="alert">{error}</div>}

      <button className="authSubmit" type="submit" disabled={loading}>
        {loading ? "Veuillez patienter…" : mode === "register" ? "Créer mon compte" : "Se connecter"}
      </button>
    </form>
  );
}
