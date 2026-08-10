import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ListingOwnerActions from "@/components/ListingOwnerActions";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publiée",
  RESERVED: "Réservée",
  SOLD: "Vendue",
  ARCHIVED: "Archivée",
  REMOVED: "Retirée",
};

export default async function MyListingsPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion?next=/mes-annonces");

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { territory: { select: { name: true } }, category: { select: { name: true, icon: true } }, images: { orderBy: { position: "asc" }, take: 1 }, _count: { select: { favorites: true, conversations: true } } },
  });

  return (
    <main className="accountPage">
      <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><a className="primaryButton" href="/deposer">+ Déposer une annonce</a></header>
      <section className="savedPageShell">
        <div className="savedPageHead"><div><span className="eyebrow">Gestion vendeur</span><h1>Mes annonces</h1><p>Suivez vos publications et leur activité.</p></div><strong>{listings.length}</strong></div>
        {listings.length === 0 ? <div className="emptyStateCard"><span>📦</span><h2>Vous n'avez pas encore d'annonce</h2><p>Publiez votre première annonce en quelques minutes.</p><a className="primaryButton" href="/deposer">Déposer une annonce</a></div> : (
          <div className="myListingsList">
            {listings.map((listing) => <article className="myListingRow" key={listing.id}><a className="myListingImage" href={`/annonces/${listing.slug}`}>{listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} /> : <span>📷</span>}</a><div className="myListingMain"><div className="myListingTitleRow"><div><small>{listing.category.icon} {listing.category.name} · {listing.territory.name}</small><h2>{listing.title}</h2></div><span className={`statusBadge status-${listing.status.toLowerCase()}`}>{statusLabels[listing.status] ?? listing.status}</span></div><strong className="myListingPrice">{listing.price ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: listing.currency }).format(Number(listing.price)) : "Prix sur demande"}</strong><div className="myListingStats"><span>♡ {listing._count.favorites} favori{listing._count.favorites !== 1 ? "s" : ""}</span><span>💬 {listing._count.conversations} conversation{listing._count.conversations !== 1 ? "s" : ""}</span><span>👁 {listing.views} vue{listing.views !== 1 ? "s" : ""}</span></div><div className="myListingActions"><a href={`/annonces/${listing.slug}`}>Voir l'annonce</a></div><ListingOwnerActions id={listing.id} status={listing.status} /></div></article>)}
          </div>
        )}
      </section>
    </main>
  );
}
