"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./MobileMenu.module.css";

type UserSummary = { displayName: string; email: string } | null;

export default function MobileMenu({ user, locale }: { user: UserSummary; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const fr = locale === "fr";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      window.location.assign("/");
    } finally {
      setLoggingOut(false);
    }
  }

  const initial = user?.displayName?.slice(0, 1).toUpperCase() || "?";

  return <>
    <button className={styles.menuButton} type="button" aria-label={fr ? "Ouvrir le menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(true)}>☰</button>
    <div className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
    <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`} aria-hidden={!open}>
      <div className={styles.drawerTop}>
        {user ? <div className={styles.profile}><div className={styles.avatar}>{initial}</div><div className={styles.profileText}><strong>{fr ? "Bonjour" : "Hello"}, {user.displayName}</strong><small>{user.email}</small></div></div> : <div className={styles.profile}><div className={styles.avatar}>AM</div><div className={styles.profileText}><strong>Antilles Market</strong><small>{fr ? "La marketplace des Antilles" : "The Caribbean marketplace"}</small></div></div>}
        <button className={styles.close} type="button" aria-label={fr ? "Fermer le menu" : "Close menu"} onClick={() => setOpen(false)}>×</button>
      </div>

      <div className="mobileLanguageRow"><span>{fr ? "Langue" : "Language"}</span><LanguageSwitcher locale={locale} /></div>

      {user ? <nav className={styles.menu} aria-label={fr ? "Menu du compte" : "Account menu"}>
        <a href="/compte" onClick={() => setOpen(false)}><span className={styles.icon}>👤</span>{fr ? "Mon profil" : "My profile"}</a>
        <a href="/mes-annonces" onClick={() => setOpen(false)}><span className={styles.icon}>📦</span>{fr ? "Mes annonces" : "My listings"}</a>
        <a href="/offres" onClick={() => setOpen(false)}><span className={styles.icon}>💶</span>{fr ? "Mes offres" : "My offers"}</a>
        <a href="/favoris" onClick={() => setOpen(false)}><span className={styles.icon}>♡</span>{fr ? "Mes favoris" : "My favorites"}</a>
        <a href="/messages" onClick={() => setOpen(false)}><span className={styles.icon}>💬</span>Messages</a>
        <a href="/parametres" onClick={() => setOpen(false)}><span className={styles.icon}>⚙️</span>{fr ? "Paramètres" : "Settings"}</a>
        <div className={styles.separator} />
        <button className={styles.logout} type="button" disabled={loggingOut} onClick={logout}><span className={styles.icon}>↪</span>{loggingOut ? (fr ? "Déconnexion…" : "Signing out…") : (fr ? "Se déconnecter" : "Sign out")}</button>
      </nav> : <div className={styles.guestBox}><p>{fr ? "Connectez-vous pour publier des annonces, enregistrer vos favoris et discuter avec les vendeurs." : "Sign in to post listings, save favorites and chat with sellers."}</p><a className={styles.guestPrimary} href="/connexion">{fr ? "Se connecter" : "Sign in"}</a><a className={styles.guestSecondary} href="/inscription">{fr ? "Créer un compte" : "Create an account"}</a></div>}
    </aside>
  </>;
}
