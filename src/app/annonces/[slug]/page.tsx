import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ContactSellerButton from "@/components/ContactSellerButton";
import FavoriteButton from "@/components/FavoriteButton";
import OfferButton from "@/components/OfferButton";
import ReportListingButton from "@/components/ReportListingButton";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { categoryLabel, getDictionary, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, cookieStore, locale] = await Promise.all([params, cookies(), getLocale()]);
  const t = getDictionary(locale);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      seller: { select: { id: true, displayName: true, createdAt: true } },
      territory: { select: { name: true } },
      location: { select: { name: true } },
      category: { select: { id: true, name: true, slug: true, icon: true, parent: { select: { icon: true } } } },
      images: { orderBy: { position: "asc" } },
      favorites: session ? { where: { userId: session.userId }, select: { userId: true } } : false,
    },
  });
  if (!listing || listing.status === "REMOVED") notFound();

  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const price = listing.price ? new Intl.NumberFormat(dateLocale, { style: "currency", currency: listing.currency, maximumFractionDigits: 2 }).format(Number(listing.price)) : t.common.priceOnRequest;
  const isFavorite = Array.isArray(listing.favorites) && listing.favorites.length > 0;
  const isOwner = session?.userId === listing.seller.id;
  const canOffer = !isOwner && !["SOLD", "ARCHIVED", "REMOVED"].includes(listing.status);
  const statusLabel = listing.status === "RESERVED" ? t.common.reserved : listing.status === "SOLD" ? t.common.sold : listing.status === "ARCHIVED" ? t.common.archived : t.common.available;

  return <main className="listingDetailPage">
    <SiteHeader />
    <div className="listingBreadcrumb"><a href="/">{t.common.home}</a><span>›</span><a href={`/recherche?category=${listing.category.id}`}>{categoryLabel(locale, listing.category.slug, listing.category.name)}</a><span>›</span><span>{listing.title}</span></div>
    <section className="listingDetailGrid"><div>
      <div className="listingGallery">{listing.images.length ? <><img src={listing.images[0].url} alt={listing.images[0].alt ?? listing.title} />{listing.images.length > 1 && <div className="listingThumbs">{listing.images.slice(1).map((image, index) => <a href={image.url} target="_blank" rel="noreferrer" key={image.id}><img src={image.url} alt={image.alt ?? `${listing.title} photo ${index + 2}`} /></a>)}</div>}</> : <div className="galleryEmpty"><span>📷</span><strong>{t.common.noPhoto}</strong><small>{t.listing.noPhoto}</small></div>}</div>
      <article className="listingDescriptionCard"><span className="eyebrow">{t.listing.description}</span><h2>{t.listing.about}</h2><p>{listing.description}</p></article>
    </div><aside className="listingAside"><article className="listingInfoCard"><span className="listingCategory">{listing.category.icon ?? listing.category.parent?.icon} {categoryLabel(locale, listing.category.slug, listing.category.name)}</span><h1>{listing.title}</h1><strong className="listingPrice">{price}</strong><div className="listingMeta"><span>📍 {listing.location?.name ? `${listing.location.name}, ` : ""}{listing.territory.name}</span><span>🕒 {listing.publishedAt ? new Intl.DateTimeFormat(dateLocale, { dateStyle: "medium" }).format(listing.publishedAt) : t.common.draft}</span><span>🏷️ {statusLabel}</span></div>{!isOwner && <ContactSellerButton listingId={listing.id} />}{canOffer && <OfferButton listingId={listing.id} currency={listing.currency} />}{isOwner && <a className="secondaryButton" href="/offres">💶 {locale === "fr" ? "Voir les offres reçues" : "View received offers"}</a>}<FavoriteButton listingId={listing.id} initialFavorited={isFavorite} /></article>
      <article className="sellerCard"><div className="sellerAvatar">{listing.seller.displayName.charAt(0).toUpperCase()}</div><div><small>{t.common.seller}</small><strong>{listing.seller.displayName}</strong><span>{t.common.memberSince} {new Intl.DateTimeFormat(dateLocale, { month: "long", year: "numeric" }).format(listing.seller.createdAt)}</span></div><a href={`/vendeurs/${listing.seller.id}`}>{t.listing.viewProfile}</a></article>{!isOwner && <ReportListingButton listingId={listing.id} />}</aside></section>
  </main>;
}
