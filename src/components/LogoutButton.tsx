"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export default function LogoutButton({ locale = "fr" }: { locale?: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fr = locale === "fr";

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="accountLogout" type="button" onClick={logout} disabled={loading}>
      {loading ? (fr ? "Déconnexion…" : "Signing out…") : (fr ? "Se déconnecter" : "Sign out")}
    </button>
  );
}
