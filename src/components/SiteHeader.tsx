import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import styles from "./MobileMenu.module.css";

export default async function SiteHeader() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const t = getDictionary(locale);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId }, select: { displayName: true, email: true } }) : null;

  return <header className={styles.header}>
    <div className={styles.left}>
      <MobileMenu user={user} locale={locale} />
      <a className={styles.brand} href="/" aria-label={locale === "fr" ? "Antilles Market — Accueil" : "Antilles Market — Home"}><span className={styles.brandMark}>AM</span><span>Antilles Market</span></a>
    </div>
    <nav className={styles.desktopNav} aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"}>
      <LanguageSwitcher locale={locale} />
      <a href="/favoris">♡ {t.nav.favorites}</a>
      <a href="/messages">💬 {t.nav.messages}</a>
      <a href={user ? "/compte" : "/connexion"}>{user ? t.nav.account : t.nav.login}</a>
      <a className={styles.deposit} href="/deposer">+ {t.nav.deposit}</a>
    </nav>
  </header>;
}
