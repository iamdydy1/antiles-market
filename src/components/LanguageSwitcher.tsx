"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();

  function change(next: Locale) {
    if (next === locale) return;
    document.cookie = `antilles_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = next;
    router.refresh();
  }

  return (
    <div className={styles.switcher} role="group" aria-label={locale === "fr" ? "Choisir la langue" : "Choose language"}>
      <button
        type="button"
        className={`${styles.option} ${locale === "fr" ? styles.active : ""}`}
        onClick={() => change("fr")}
        aria-label={locale === "fr" ? "Français sélectionné" : "Switch to French"}
        aria-pressed={locale === "fr"}
      >
        FR
      </button>
      <button
        type="button"
        className={`${styles.option} ${locale === "en" ? styles.active : ""}`}
        onClick={() => change("en")}
        aria-label={locale === "en" ? "English selected" : "Passer en anglais"}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
