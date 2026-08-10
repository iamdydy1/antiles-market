"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./MobileMenu.module.css";

type UserSummary = { displayName: string; email: string } | null;

export default function MobileMenu({ user }: { user: UserSummary }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const initial = user?.displayName?.slice(0, 1).toUpperCase() || "?";

  return <>
    <button className={styles.menuButton} type="button" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen(true)}>☰</button>
    <div className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
    <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`} aria-hidden={!open}>
      <div className={styles.drawerTop}>
        {user ? <div className={styles.profile}><div className={styles.avatar}>{initial}</div><div className={styles.profileText}><strong>Bonjour, {user.displayName}</strong><small>{user.email}</small></div></div> : <div className={styles.profile}><div className={styles.avatar}>AM</div><div className={styles.profileText}><strong>Antilles Market</strong><small>La marketplace des Antilles</small></div></div>}
        <button className={styles.close} type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)}>×</button>
      </div>

      {user ? <nav className={styles.menu} aria-label="Menu du compte">
        <a href="/compte" onClick={() => setOpen(false)}><span className={styles.icon}>👤</span>Mon profil</a>
        <a href="/mes-annonces" onClick={() => setOpen(false)}><span className={styles.icon}>📦</span>Mes annonces</a>
        <a href="/favoris" onClick={() => setOpen(false)}><span className={styles.icon}>♡</span>Mes favoris</a>
        <a href="/messages" onClick={() => setOpen(false)}><span className={styles.icon}>💬</span>Messages</a>
        <a href="/parametres" onClick={() => setOpen(false)}><span className={styles.icon}>⚙️</span>Paramètres</a>
        <div className={styles.separator} />
        <button className={styles.logout} type="button" disabled={loggingOut} onClick={logout}><span className={styles.icon}>↪</span>{loggingOut ? "Déconnexion…" : "Se déconnecter"}</button>
      </nav> : <div className={styles.guestBox}><p>Connectez-vous pour publier des annonces, enregistrer vos favoris et discuter avec les vendeurs.</p><a className={styles.guestPrimary} href="/connexion">Se connecter</a><a className={styles.guestSecondary} href="/inscription">Créer un compte</a></div>}
    </aside>
  </>;
}
