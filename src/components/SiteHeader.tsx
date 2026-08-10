import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MobileMenu from "./MobileMenu";
import styles from "./MobileMenu.module.css";

export default async function SiteHeader() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const user = session ? await prisma.user.findUnique({ where: { id: session.userId }, select: { displayName: true, email: true } }) : null;

  return <header className={styles.header}>
    <div className={styles.left}>
      <MobileMenu user={user} />
      <a className={styles.brand} href="/" aria-label="Antilles Market — Accueil"><span className={styles.brandMark}>AM</span><span>Antilles Market</span></a>
    </div>
    <nav className={styles.desktopNav} aria-label="Navigation principale">
      <a href="/favoris">♡ Favoris</a>
      <a href="/messages">💬 Messages</a>
      <a href={user ? "/compte" : "/connexion"}>{user ? "Mon compte" : "Se connecter"}</a>
      <a className={styles.deposit} href="/deposer">+ Déposer une annonce</a>
    </nav>
  </header>;
}
