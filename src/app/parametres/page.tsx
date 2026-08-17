import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import SettingsForm from "@/components/SettingsForm";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const t = getDictionary(locale);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { displayName: true, email: true, phone: true, accountType: true, createdAt: true } });
  if (!user) redirect("/connexion");
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const accountTypeLabel = user.accountType === "PROFESSIONAL"
    ? (locale === "fr" ? "Professionnel" : "Professional")
    : (locale === "fr" ? "Particulier" : "Individual");

  return <main className="accountPage">
    <SiteHeader />
    <section className="accountHero"><div className="accountAvatar">{user.displayName.slice(0,1).toUpperCase()}</div><div><span className="eyebrow">{t.account.space}</span><h1>{t.settings.title}</h1><p>{t.settings.intro}</p></div></section>
    <div className="accountLayout">
      <aside className="accountMenu"><a href="/compte">👤 {t.nav.profile}</a><a href="/mes-annonces">📦 {t.nav.listings}</a><a href="/offres">💶 {t.nav.offers}</a><a href="/favoris">♡ {t.nav.favorites}</a><a href="/messages">💬 {t.nav.messages}</a><a className="active" href="/parametres">⚙️ {t.nav.settings}</a><LogoutButton locale={locale} /></aside>
      <section className="accountContent">
        <article className="profileCard"><div className="profileCardHead"><div><span className="eyebrow">{t.settings.account}</span><h2>{t.settings.accountInfo}</h2></div></div><dl className="profileDetails"><div><dt>{t.account.email}</dt><dd>{user.email}</dd></div><div><dt>{t.account.phone}</dt><dd>{user.phone ?? t.common.noPhone}</dd></div><div><dt>{t.account.accountType}</dt><dd>{accountTypeLabel}</dd></div><div><dt>{t.account.memberSince}</dt><dd>{new Intl.DateTimeFormat(dateLocale,{month:"long",year:"numeric"}).format(user.createdAt)}</dd></div></dl></article>
        <article className="profileCard"><div className="profileCardHead"><div><span className="eyebrow">{t.settings.security}</span><h2>{t.settings.changePassword}</h2><p>{t.settings.passwordHelp}</p></div></div><SettingsForm locale={locale} /></article>
        <article className="profileCard"><div className="profileCardHead"><div><span className="eyebrow">{t.settings.comingSoon}</span><h2>{t.settings.otherSettings}</h2></div></div><p>{t.settings.comingText}</p></article>
      </section>
    </div>
  </main>;
}
