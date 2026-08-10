import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ContactSellerButton from "@/components/ContactSellerButton";
import FavoriteButton from "@/components/FavoriteButton";
import ReportListingButton from "@/components/ReportListingButton";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const cookieStore = await cookies(); const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const listing = await prisma.listing.findUnique({ where: { slug }, include: { seller: { select: { id: true, displayName: true, createdAt: true } }, territory: { select: { name: true } }, location: { select: { name: true } }, category: { select: { id: true, name: true, icon: true, parent: { select: { icon: true } } } }, images: { orderBy: { position: "asc" } }, favorites: session ? { where: { userId: session.userId }, select: { userId: true } } : false } });
  if (!listing || listing.status === "REMOVED") notFound();
  const price = listing.price ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: listing.currency, maximumFractionDigits: 2 }).format(Number(listing.price)) : "Prix sur demande"; const isFavorite = Array.isArray(listing.favorites) && listing.favorites.length > 0;
  return <main className="listingDetailPage">
    <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><nav className="headerActions"><a className="ghostButton" href="/messages">Messages</a><a className="ghostButton" href="/compte">Mon compte</a><a className="primaryButton" href="/deposer">+ Déposer</a></nav></header>
    <div className="listingBreadcrumb"><a href="/">Accueil</a><span>›</span><a href={`/recherche?category=${listing.category.id}`}>{listing.category.name}</a><span>›</span><span>{listing.title}</span></div>
    <section className="listingDetailGrid"><div>
      <div className="listingGallery">{listing.images.length ? <><img src={listing.images[0].url} alt={listing.images[0].alt ?? listing.title} />{listing.images.length > 1 && <div className="listingThumbs">{listing.images.slice(1).map((image, index) => <a href={image.url} target="_blank" rel="noreferrer" key={image.id}><img src={image.url} alt={image.alt ?? `${listing.title} photo ${index + 2}`} /></a>)}</div>}</> : <div className="galleryEmpty"><span>📷</span><strong>Aucune photo</strong><small>Le vendeur n’a pas ajouté de photo.</small></div>}</div>
      <article className="listingDescriptionCard"><span className="eyebrow">Description</span><h2>À propos de cette annonce</h2><p>{listing.description}</p></article>
    </div><aside className="listingAside"><article className="listingInfoCard"><span className="listingCategory">{listing.category.icon ?? listing.category.parent?.icon} {listing.category.name}</span><h1>{listing.title}</h1><strong className="listingPrice">{price}</strong><div className="listingMeta"><span>📍 {listing.location?.name ? `${listing.location.name}, ` : ""}{listing.territory.name}</span><span>🕒 {listing.publishedAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(listing.publishedAt) : "Brouillon"}</span><span>🏷️ {listing.status === "RESERVED" ? "Réservée" : listing.status === "SOLD" ? "Vendue" : listing.status === "ARCHIVED" ? "Archivée" : "Disponible"}</span></div><ContactSellerButton listingId={listing.id} /><FavoriteButton listingId={listing.id} initialFavorite={isFavorite} /></article>
      <article className="sellerCard"><div className="sellerAvatar">{listing.seller.displayName.charAt(0).toUpperCase()}</div><div><small>Vendeur</small><strong>{listing.seller.displayName}</strong><span>Membre depuis {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(listing.seller.createdAt)}</span></div><a href={`/vendeurs/${listing.seller.id}`}>Voir le profil →</a></article><ReportListingButton listingId={listing.id} /></aside></section>
  </main>;
}
