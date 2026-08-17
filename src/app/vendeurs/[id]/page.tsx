import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { getLocale } from "@/lib/i18n";
import { archiveExpiredEvents } from "@/lib/listing-maintenance";
import { prisma } from "@/lib/prisma";

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  await archiveExpiredEvents();
  const seller = await prisma.user.findUnique({ where: { id }, select: { displayName: true, avatarUrl: true, accountType: true, companyName: true, createdAt: true, isBanned: true, listings: { where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, include: { territory: { select: { name: true } }, location: { select: { name: true } }, images: { orderBy: { position: "asc" }, take: 1 } } } } });
  if (!seller || seller.isBanned) notFound();
  const fr = locale === "fr";
  const dateLocale = fr ? "fr-FR" : "en-US";
  const sellerName = seller.accountType === "PROFESSIONAL" && seller.companyName ? seller.companyName : seller.displayName;
  const copy = fr
    ? { eyebrow: "Profil vendeur", memberSince: "Membre depuis", listing: "annonce active", listings: "annonces actives", priceOnRequest: "Prix sur demande", emptyTitle: "Aucune annonce active", emptyText: "Ce vendeur n’a rien en vente actuellement.", professional: "Professionnel" }
    : { eyebrow: "Seller profile", memberSince: "Member since", listing: "active listing", listings: "active listings", priceOnRequest: "Price on request", emptyTitle: "No active listings", emptyText: "This seller does not currently have anything for sale.", professional: "Professional" };

  return <main className="searchPage">
    <SiteHeader />
    <section className="searchResultsShell">
      <div className="sellerPublicHead"><div className="sellerAvatar">{seller.displayName.charAt(0).toUpperCase()}</div><div><span className="eyebrow">{copy.eyebrow}</span><h1>{sellerName}</h1>{seller.accountType === "PROFESSIONAL" && <span className="proBadge">✓ PRO · {copy.professional}</span>}<p>{copy.memberSince} {new Intl.DateTimeFormat(dateLocale, { month: "long", year: "numeric" }).format(seller.createdAt)} · {seller.listings.length} {seller.listings.length === 1 ? copy.listing : copy.listings}</p></div></div>
      {seller.listings.length ? <div className="resultsGrid">{seller.listings.map((listing) => <a className="resultCard" href={`/annonces/${listing.slug}`} key={listing.id}><div className="resultImage">{listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} /> : <span>📷</span>}</div><div className="resultBody"><h2>{listing.title}</h2><strong>{listing.eventIsFree ? (fr ? "Gratuit" : "Free") : listing.price ? new Intl.NumberFormat(dateLocale, { style: "currency", currency: listing.currency }).format(Number(listing.price)) : copy.priceOnRequest}</strong><span>📍 {listing.location?.name ? `${listing.location.name}, ` : ""}{listing.territory.name}</span></div></a>)}</div> : <div className="emptyStateCard"><span>📦</span><h2>{copy.emptyTitle}</h2><p>{copy.emptyText}</p></div>}
    </section>
  </main>;
}
