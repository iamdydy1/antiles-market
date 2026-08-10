import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import ProfileEditor from "@/components/ProfileEditor";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const t = getDictionary(locale);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, displayName: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { listings: true, favorites: true, messages: true } } },
  });
  if (!user) redirect("/connexion");
  const initial = user.displayName.slice(0, 1).toUpperCase();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  return <main className="accountPage">
    <SiteHeader />
    <section className="accountHero"><div className="accountAvatar">{initial}</div><div><span className="eyebrow">{t.account.space}</span><h1>{t.account.hello}, {user.displayName}</h1><p>{user.email}</p></div></section>
    <div className="accountLayout">
      <aside className="accountMenu">
        <a className="active" href="/compte">👤 {t.nav.profile}</a><a href="/mes-annonces">📦 {t.nav.listings}</a><a href="/offres">💶 {t.nav.offers}</a><a href="/favoris">♡ {t.nav.favorites}</a><a href="/messages">💬 {t.nav.messages}</a><a href="/parametres">⚙️ {t.nav.settings}</a><LogoutButton />
      </aside>
      <section className="accountContent">
        <div className="accountStats"><a href="/mes-annonces"><strong>{user._count.listings}</strong><span>{t.account.published}</span></a><a href="/favoris"><strong>{user._count.favorites}</strong><span>{t.nav.favorites}</span></a><a href="/messages"><strong>{user._count.messages}</strong><span>{t.account.sentMessages}</span></a></div>
        <article className="profileCard"><div className="profileCardHead"><div><span className="eyebrow">{t.account.personalInfo}</span><h2>{t.nav.profile}</h2></div><ProfileEditor displayName={user.displayName} phone={user.phone} /></div>
          <dl className="profileDetails"><div><dt>{t.account.displayName}</dt><dd>{user.displayName}</dd></div><div><dt>{t.account.email}</dt><dd>{user.email}</dd></div><div><dt>{t.account.phone}</dt><dd>{user.phone ?? t.common.noPhone}</dd></div><div><dt>{t.account.accountType}</dt><dd>{user.role === "USER" ? t.common.privateAccount : user.role}</dd></div><div><dt>{t.account.memberSince}</dt><dd>{new Intl.DateTimeFormat(dateLocale, { month: "long", year: "numeric" }).format(user.createdAt)}</dd></div></dl>
        </article>
      </section>
    </div>
  </main>;
}
