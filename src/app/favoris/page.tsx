import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { categoryLabel, getLocale } from "@/lib/i18n";
import { archiveExpiredEvents } from "@/lib/listing-maintenance";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion?next=/favoris");
  await archiveExpiredEvents();
  const fr = locale === "fr";
  const dateLocale = fr ? "fr-FR" : "en-US";
  const copy = fr
    ? { eyebrow: "Votre sélection", title: "Mes favoris", intro: "Retrouvez rapidement les annonces que vous avez sauvegardées.", emptyTitle: "Aucun favori pour le moment", emptyText: "Explorez les annonces et ajoutez celles qui vous intéressent.", browse: "Découvrir les annonces", priceOnRequest: "Prix sur demande" }
    : { eyebrow: "Your selection", title: "My favorites", intro: "Quickly find the listings you have saved.", emptyTitle: "No favorites yet", emptyText: "Browse listings and save the ones you are interested in.", browse: "Browse listings", priceOnRequest: "Price on request" };

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId, listing: { status: { notIn: ["DRAFT", "ARCHIVED", "REMOVED"] } } },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          territory: { select: { name: true } },
          location: { select: { name: true } },
          category: { select: { name: true, slug: true, icon: true, parent: { select: { icon: true } } } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
  });

  return (
    <main className="accountPage">
      <SiteHeader />
      <section className="savedPageShell">
        <div className="savedPageHead"><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div><strong>{favorites.length}</strong></div>
        {favorites.length === 0 ? <div className="emptyStateCard"><span>♡</span><h2>{copy.emptyTitle}</h2><p>{copy.emptyText}</p><a className="primaryButton" href="/recherche">{copy.browse}</a></div> : (
          <div className="resultsGrid">
            {favorites.map(({ listing }) => <a className="resultCard" href={`/annonces/${listing.slug}`} key={listing.id}><div className="resultImage">{listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} /> : <span>📷</span>}</div><div className="resultBody"><small>{listing.category.icon ?? listing.category.parent?.icon} {categoryLabel(locale, listing.category.slug, listing.category.name)}</small><h2>{listing.title}</h2><strong>{listing.eventIsFree ? (fr ? "Gratuit" : "Free") : listing.price ? new Intl.NumberFormat(dateLocale, { style: "currency", currency: listing.currency }).format(Number(listing.price)) : copy.priceOnRequest}</strong><span>📍 {listing.location?.name ? `${listing.location.name}, ` : ""}{listing.territory.name}</span></div></a>)}
          </div>
        )}
      </section>
    </main>
  );
}
