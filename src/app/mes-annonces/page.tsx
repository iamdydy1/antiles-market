import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ListingOwnerActions from "@/components/ListingOwnerActions";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function MyListingsPage() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion?next=/mes-annonces");
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const statusLabels: Record<string, string> = locale === "fr"
    ? { DRAFT: "Brouillon", PUBLISHED: "Publiée", RESERVED: "Réservée", SOLD: "Vendue", ARCHIVED: "Archivée", REMOVED: "Retirée" }
    : { DRAFT: "Draft", PUBLISHED: "Published", RESERVED: "Reserved", SOLD: "Sold", ARCHIVED: "Archived", REMOVED: "Removed" };
  const copy = locale === "fr"
    ? { eyebrow: "Gestion vendeur", title: "Mes annonces", intro: "Suivez vos publications et leur activité.", emptyTitle: "Vous n'avez pas encore d'annonce", emptyText: "Publiez votre première annonce en quelques minutes.", post: "Déposer une annonce", priceOnRequest: "Prix sur demande", favorite: "favori", favorites: "favoris", conversation: "conversation", conversations: "conversations", view: "vue", views: "vues", open: "Voir l'annonce" }
    : { eyebrow: "Seller dashboard", title: "My listings", intro: "Track your listings and their activity.", emptyTitle: "You don't have any listings yet", emptyText: "Post your first listing in just a few minutes.", post: "Post a listing", priceOnRequest: "Price on request", favorite: "favorite", favorites: "favorites", conversation: "conversation", conversations: "conversations", view: "view", views: "views", open: "View listing" };

  const listings = await prisma.listing.findMany({
    where: { sellerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { territory: { select: { name: true } }, category: { select: { name: true, icon: true } }, images: { orderBy: { position: "asc" }, take: 1 }, _count: { select: { favorites: true, conversations: true } } },
  });

  return (
    <main className="accountPage">
      <SiteHeader />
      <section className="savedPageShell">
        <div className="savedPageHead"><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div><strong>{listings.length}</strong></div>
        {listings.length === 0 ? <div className="emptyStateCard"><span>📦</span><h2>{copy.emptyTitle}</h2><p>{copy.emptyText}</p><a className="primaryButton" href="/deposer">{copy.post}</a></div> : (
          <div className="myListingsList">
            {listings.map((listing) => <article className="myListingRow" key={listing.id}><a className="myListingImage" href={`/annonces/${listing.slug}`}>{listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} /> : <span>📷</span>}</a><div className="myListingMain"><div className="myListingTitleRow"><div><small>{listing.category.icon} {listing.category.name} · {listing.territory.name}</small><h2>{listing.title}</h2></div><span className={`statusBadge status-${listing.status.toLowerCase()}`}>{statusLabels[listing.status] ?? listing.status}</span></div><strong className="myListingPrice">{listing.price ? new Intl.NumberFormat(dateLocale, { style: "currency", currency: listing.currency }).format(Number(listing.price)) : copy.priceOnRequest}</strong><div className="myListingStats"><span>♡ {listing._count.favorites} {listing._count.favorites === 1 ? copy.favorite : copy.favorites}</span><span>💬 {listing._count.conversations} {listing._count.conversations === 1 ? copy.conversation : copy.conversations}</span><span>👁 {listing.views} {listing.views === 1 ? copy.view : copy.views}</span></div><div className="myListingActions"><a href={`/annonces/${listing.slug}`}>{copy.open}</a></div><ListingOwnerActions id={listing.id} status={listing.status} locale={locale} /></div></article>)}
          </div>
        )}
      </section>
    </main>
  );
}
