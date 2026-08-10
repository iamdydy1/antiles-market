"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();

  function change(next: Locale) {
    document.cookie = `antilles_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = next;
    router.refresh();
  }

  return (
    <div className="languageSwitcher" role="group" aria-label={locale === "fr" ? "Choisir la langue" : "Choose language"}>
      <button type="button" className={locale === "fr" ? "active" : ""} onClick={() => change("fr")} aria-pressed={locale === "fr"}>FR</button>
      <span aria-hidden="true">|</span>
      <button type="button" className={locale === "en" ? "active" : ""} onClick={() => change("en")} aria-pressed={locale === "en"}>EN</button>
    </div>
  );
}
