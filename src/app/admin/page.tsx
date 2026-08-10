import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ModerationActions from "@/components/ModerationActions";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { displayName: true, role: true } });
  if (!user || !["MODERATOR", "ADMIN"].includes(user.role)) redirect("/");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { title: true, slug: true, status: true, seller: { select: { displayName: true } } } },
      author: { select: { displayName: true, email: true } },
    },
  });

  const openCount = reports.filter((report) => report.status === "OPEN" || report.status === "REVIEWING").length;

  return (
    <main className="adminPage">
      <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><span className="adminRoleBadge">{user.role}</span></header>
      <section className="adminShell">
        <div className="adminHead"><div><span className="eyebrow">Modération</span><h1>Tableau de bord</h1><p>Bonjour {user.displayName}. Gérez les signalements et les annonces problématiques.</p></div><div className="adminKpis"><article><strong>{openCount}</strong><span>À traiter</span></article><article><strong>{reports.length}</strong><span>Signalements</span></article></div></div>

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
