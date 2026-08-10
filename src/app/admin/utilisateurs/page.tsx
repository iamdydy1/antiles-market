import { redirect } from "next/navigation";
import AdminUserActions from "@/components/AdminUserActions";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireStaff();
  if (!actor) redirect("/");

  const raw = await searchParams;
  const q = one(raw.q)?.trim() ?? "";
  const users = await prisma.user.findMany({
    where: q ? { OR: [{ displayName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, displayName: true, email: true, role: true, isBanned: true, createdAt: true,
      _count: { select: { listings: true, reportsCreated: true, messages: true } },
    },
  });

  return (
    <main className="adminPage">
      <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><nav className="headerActions"><a className="ghostButton" href="/admin">Signalements</a><a className="ghostButton" href="/admin/utilisateurs">Utilisateurs</a><span className="adminRoleBadge">{actor.role}</span></nav></header>
      <section className="adminShell">
        <div className="adminHead"><div><span className="eyebrow">Administration</span><h1>Utilisateurs</h1><p>Recherchez, modérez et gérez les rôles des comptes.</p></div></div>
        <form className="adminSearch" action="/admin/utilisateurs" method="get"><input name="q" defaultValue={q} placeholder="Nom ou e-mail…" /><button className="primaryButton" type="submit">Rechercher</button>{q && <a href="/admin/utilisateurs">Réinitialiser</a>}</form>
        <div className="adminUsersList">
          {users.map((user) => (
            <article className="adminUserCard" key={user.id}>
              <div className="adminUserIdentity"><div className="sellerAvatar">{user.displayName.charAt(0).toUpperCase()}</div><div><strong>{user.displayName}</strong><span>{user.email}</span><small>Membre depuis {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(user.createdAt)}</small></div></div>
              <div className="adminUserMeta"><span className={`statusBadge ${user.isBanned ? "status-rejected" : "status-resolved"}`}>{user.isBanned ? "BANNI" : "ACTIF"}</span><span className="statusBadge">{user.role}</span><small>{user._count.listings} annonces · {user._count.messages} messages · {user._count.reportsCreated} signalements</small></div>
              {user.id === actor.id ? <div className="adminUserActions"><small>Votre compte</small></div> : <AdminUserActions userId={user.id} role={user.role} isBanned={user.isBanned} actorRole={actor.role} />}
            </article>
          ))}
          {users.length === 0 && <div className="emptyStateCard"><span>👥</span><h2>Aucun utilisateur trouvé</h2><p>Essayez un autre nom ou e-mail.</p></div>}
        </div>
      </section>
    </main>
  );
}
