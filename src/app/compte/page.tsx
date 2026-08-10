import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { listings: true, favorites: true, messages: true } },
    },
  });

  if (!user) redirect("/connexion");

  const initial = user.displayName.slice(0, 1).toUpperCase();

  return (
    <main className="accountPage">
      <header className="accountTopbar">
        <a className="brand" href="/">
          <span className="brandMark">AM</span>
          <span>Antilles Market</span>
        </a>
        <a className="primaryButton" href="/deposer">+ Déposer une annonce</a>
      </header>

      <section className="accountHero">
        <div className="accountAvatar">{initial}</div>
        <div>
          <span className="eyebrow">Mon espace</span>
          <h1>Bonjour, {user.displayName}</h1>
          <p>{user.email}</p>
        </div>
      </section>

      <div className="accountLayout">
        <aside className="accountMenu">
          <a className="active" href="/compte">👤 Mon profil</a>
          <a href="#">📦 Mes annonces</a>
          <a href="#">♡ Mes favoris</a>
          <a href="#">💬 Messages</a>
          <a href="#">⚙️ Paramètres</a>
          <LogoutButton />
        </aside>

        <section className="accountContent">
          <div className="accountStats">
            <article><strong>{user._count.listings}</strong><span>Annonces publiées</span></article>
            <article><strong>{user._count.favorites}</strong><span>Favoris</span></article>
            <article><strong>{user._count.messages}</strong><span>Messages envoyés</span></article>
          </div>

          <article className="profileCard">
            <div className="profileCardHead">
              <div>
                <span className="eyebrow">Informations personnelles</span>
                <h2>Mon profil</h2>
              </div>
              <button className="secondaryButton" type="button">Modifier</button>
            </div>
            <dl className="profileDetails">
              <div><dt>Nom affiché</dt><dd>{user.displayName}</dd></div>
              <div><dt>E-mail</dt><dd>{user.email}</dd></div>
              <div><dt>Téléphone</dt><dd>{user.phone ?? "Non renseigné"}</dd></div>
              <div><dt>Type de compte</dt><dd>{user.role === "USER" ? "Particulier" : user.role}</dd></div>
              <div><dt>Membre depuis</dt><dd>{new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(user.createdAt)}</dd></div>
            </dl>
          </article>
        </section>
      </div>
    </main>
  );
}
