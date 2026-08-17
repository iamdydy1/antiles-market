import { redirect } from "next/navigation";
import ModerationActions from "@/components/ModerationActions";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await requireStaff();
  if (!user) redirect("/");

  const [reports, usersCount, bannedCount, publishedCount, soldCount, messagesCount, conversationsCount] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { title: true, slug: true, status: true, seller: { select: { displayName: true } } } },
        author: { select: { displayName: true, email: true } },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.message.count({ where: { isDeleted: false } }),
    prisma.conversation.count(),
  ]);

  const openCount = reports.filter((report) => report.status === "OPEN" || report.status === "REVIEWING").length;

  return (
    <main className="adminPage">
      <header className="accountTopbar">
        <a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a>
        <nav className="headerActions"><a className="ghostButton" href="/admin">Tableau de bord</a><a className="ghostButton" href="/admin/utilisateurs">Utilisateurs</a><span className="adminRoleBadge">{user.role}</span></nav>
      </header>
      <section className="adminShell">
        <div className="adminHead"><div><span className="eyebrow">Administration</span><h1>Tableau de bord</h1><p>Bonjour {user.displayName}. Vue générale de l'activité et de la modération.</p></div></div>

        <div className="adminStatsGrid">
          <article><strong>{usersCount}</strong><span>Utilisateurs</span><small>{bannedCount} banni{bannedCount !== 1 ? "s" : ""}</small></article>
          <article><strong>{publishedCount}</strong><span>Annonces publiées</span><small>{soldCount} vendue{soldCount !== 1 ? "s" : ""}</small></article>
          <article><strong>{messagesCount}</strong><span>Messages</span><small>{conversationsCount} conversations</small></article>
          <article><strong>{openCount}</strong><span>À modérer</span><small>{reports.length} signalements au total</small></article>
        </div>

        <div className="adminSectionTitle"><div><span className="eyebrow">Modération</span><h2>Signalements</h2></div><a href="/admin/utilisateurs">Gérer les utilisateurs →</a></div>
        <div className="adminReports">
          {reports.length === 0 ? <div className="emptyStateCard"><span>🛡️</span><h2>Aucun signalement</h2><p>La file de modération est vide.</p></div> : reports.map((report) => (
            <article className="adminReportCard" key={report.id}>
              <div className="adminReportMain"><div className="adminReportTop"><span className={`statusBadge status-${report.status.toLowerCase()}`}>{report.status}</span><time>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(report.createdAt)}</time></div><h2>{report.reason}</h2><p>{report.details || "Aucun détail supplémentaire."}</p><div className="adminReportMeta"><span>Signalé par <strong>{report.author.displayName}</strong> · {report.author.email}</span><span>Annonce : <a href={`/annonces/${report.listing.slug}`}>{report.listing.title}</a></span><span>Vendeur : {report.listing.seller.displayName} · Statut {report.listing.status}</span></div></div>
              {(report.status === "OPEN" || report.status === "REVIEWING") && <ModerationActions reportId={report.id} />}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
