"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";
type Locale = "fr" | "en";

export default function AuthForm({ mode, locale = "fr" }: { mode: Mode; locale?: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState<"PRIVATE" | "PROFESSIONAL">("PRIVATE");
  const en = locale === "en";
  const labels = useMemo(() => ({
    displayName: en ? "Display name" : "Nom affiché",
    email: en ? "Email address" : "Adresse e-mail",
    password: en ? "Password" : "Mot de passe",
    private: en ? "Individual" : "Particulier",
    professional: en ? "Professional" : "Professionnel",
    accountType: en ? "Account type" : "Type de compte",
    companyName: en ? "Company name" : "Nom de l’entreprise",
    businessId: en ? "Business / registration ID" : "SIRET / SIREN / identifiant professionnel",
    proPhone: en ? "Professional phone" : "Téléphone professionnel",
    wait: en ? "Please wait…" : "Veuillez patienter…",
    register: en ? "Create my account" : "Créer mon compte",
    login: en ? "Sign in" : "Se connecter",
    minPassword: en ? "8 characters minimum." : "8 caractères minimum.",
    genericError: en ? "Something went wrong." : "Une erreur est survenue.",
    serverError: en ? "Unable to contact the server." : "Impossible de contacter le serveur.",
  }), [en]);

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
          accountType,
          companyName: accountType === "PROFESSIONAL" ? form.get("companyName") : "",
          businessId: accountType === "PROFESSIONAL" ? form.get("businessId") : "",
          professionalPhone: accountType === "PROFESSIONAL" ? form.get("professionalPhone") : "",
        }
      : { email: form.get("email"), password: form.get("password") };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? labels.genericError);
        return;
      }
      router.push("/compte");
      router.refresh();
    } catch {
      setError(labels.serverError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="authForm" onSubmit={submit}>
      {mode === "register" && <>
        <fieldset className="accountTypePicker">
          <legend>{labels.accountType}</legend>
          <div className="accountTypeOptions">
            <label className={accountType === "PRIVATE" ? "selected" : ""}>
              <input type="radio" name="accountType" value="PRIVATE" checked={accountType === "PRIVATE"} onChange={() => setAccountType("PRIVATE")} />
              <strong>👤 {labels.private}</strong>
            </label>
            <label className={accountType === "PROFESSIONAL" ? "selected" : ""}>
              <input type="radio" name="accountType" value="PROFESSIONAL" checked={accountType === "PROFESSIONAL"} onChange={() => setAccountType("PROFESSIONAL")} />
              <strong>🏢 {labels.professional}</strong>
            </label>
          </div>
        </fieldset>
        <label><span>{labels.displayName}</span><input name="displayName" type="text" minLength={2} maxLength={60} placeholder="Ex. Wendy S." required autoComplete="name" /></label>
        {accountType === "PROFESSIONAL" && <div className="professionalFields">
          <label><span>{labels.companyName} *</span><input name="companyName" type="text" maxLength={120} required /></label>
          <label><span>{labels.businessId}</span><input name="businessId" type="text" maxLength={80} /></label>
          <label><span>{labels.proPhone}</span><input name="professionalPhone" type="tel" maxLength={30} autoComplete="tel" /></label>
        </div>}
      </>}

      <label><span>{labels.email}</span><input name="email" type="email" placeholder="vous@exemple.com" required autoComplete="email" /></label>
      <label><span>{labels.password}</span><input name="password" type="password" minLength={mode === "register" ? 8 : 1} placeholder="••••••••" required autoComplete={mode === "register" ? "new-password" : "current-password"} />{mode === "register" && <small>{labels.minPassword}</small>}</label>
      {error && <div className="authError" role="alert">{error}</div>}
      <button className="authSubmit" type="submit" disabled={loading}>{loading ? labels.wait : mode === "register" ? labels.register : labels.login}</button>
    </form>
  );
}
