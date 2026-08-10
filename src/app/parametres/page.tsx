import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import SettingsForm from "@/components/SettingsForm";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { displayName: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!user) redirect("/connexion");

  return (
    <main className="accountPage">
      <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><a className="primaryButton" href="/deposer">+ Déposer une annonce</a></header>
      <section className="accountHero"><div className="accountAvatar">{user.displayName.slice(0, 1).toUpperCase()}</div><div><span className="eyebrow">Mon espace</span><h1>Paramètres</h1><p>Gérez la sécurité et les informations importantes de votre compte.</p></div></section>
      <div className="accountLayout">
        <aside className="accountMenu">
          <a href="/compte">👤 Mon profil</a>
          <a href="/mes-annonces">📦 Mes annonces</a>
          <a href="/favoris">♡ Mes favoris</a>
          <a href="/messages">💬 Messages</a>
          <a className="active" href="/parametres">⚙️ Paramètres</a>
          <LogoutButton />
        </aside>
        <section className="accountContent">
          <article className="profileCard">
            <div className="profileCardHead"><div><span className="eyebrow">Compte</span><h2>Informations du compte</h2></div></div>
            <dl className="profileDetails">
              <div><dt>E-mail</dt><dd>{user.email}</dd></div>
              <div><dt>Téléphone</dt><dd>{user.phone ?? "Non renseigné"}</dd></div>
              <div><dt>Type de compte</dt><dd>{user.role === "USER" ? "Particulier" : user.role}</dd></div>
              <div><dt>Membre depuis</dt><dd>{new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(user.createdAt)}</dd></div>
            </dl>
          </article>
          <article className="profileCard">
            <div className="profileCardHead"><div><span className="eyebrow">Sécurité</span><h2>Changer mon mot de passe</h2><p>Utilisez votre mot de passe actuel pour confirmer la modification.</p></div></div>
            <SettingsForm />
          </article>
          <article className="profileCard">
            <div className="profileCardHead"><div><span className="eyebrow">À venir</span><h2>Autres paramètres</h2></div></div>
            <p>Modification de l’e-mail, préférences de notifications et suppression du compte seront ajoutées après les tests de la V1.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
