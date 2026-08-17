import SiteHeader from "@/components/SiteHeader";
import { categoryLabel, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function numeric(value: string | undefined) { if (!value) return undefined; const n = Number(value.replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : undefined; }

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const [raw, locale] = await Promise.all([searchParams, getLocale()]);
  const fr = locale === "fr";
  const dateLocale = fr ? "fr-FR" : "en-US";
  const copy = fr
    ? {
        eyebrow: "Explorer les Antilles", title: "Trouvez exactement ce que vous cherchez.", search: "Recherche", searchPlaceholder: "Voiture, appartement, téléphone…", island: "Île", allIslands: "Toutes les îles", city: "Ville", allCities: "Toutes les villes", category: "Catégorie", allCategories: "Toutes les catégories", allInCategory: "Tout", minPrice: "Prix min.", maxPrice: "Prix max.", sort: "Trier", recent: "Plus récentes", priceAsc: "Prix croissant", priceDesc: "Prix décroissant", submit: "Rechercher", listing: "annonce", listings: "annonces", allAvailable: "Toutes les annonces disponibles", resultsFor: "Résultats pour", reset: "Réinitialiser les filtres", emptyTitle: "Aucune annonce trouvée", emptyText: "Essayez d’élargir vos critères de recherche.", priceOnRequest: "Prix sur demande"
      }
    : {
        eyebrow: "Explore the Caribbean", title: "Find exactly what you are looking for.", search: "Search", searchPlaceholder: "Car, apartment, phone…", island: "Island", allIslands: "All islands", city: "City / town", allCities: "All cities", category: "Category", allCategories: "All categories", allInCategory: "All", minPrice: "Min. price", maxPrice: "Max. price", sort: "Sort", recent: "Most recent", priceAsc: "Price: low to high", priceDesc: "Price: high to low", submit: "Search", listing: "listing", listings: "listings", allAvailable: "All available listings", resultsFor: "Results for", reset: "Reset filters", emptyTitle: "No listings found", emptyText: "Try broadening your search filters.", priceOnRequest: "Price on request"
      };

  const q = one(raw.q)?.trim() ?? "";
  const territoryId = one(raw.territory) ?? "";
  const locationId = one(raw.location) ?? "";
  const categoryId = one(raw.category) ?? "";
  const min = numeric(one(raw.min));
  const max = numeric(one(raw.max));
  const sort = one(raw.sort) ?? "recent";

  const selectedCategory = categoryId ? await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, parentId: true } }) : null;
  const where = { status: "PUBLISHED" as const, ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {}), ...(territoryId ? { territoryId } : {}), ...(locationId ? { locationId } : {}), ...(categoryId ? (selectedCategory?.parentId ? { categoryId } : { category: { OR: [{ id: categoryId }, { parentId: categoryId }] } }) : {}), ...((min !== undefined || max !== undefined) ? { price: { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) } } : {}) };
  const orderBy = sort === "price_asc" ? { price: "asc" as const } : sort === "price_desc" ? { price: "desc" as const } : { publishedAt: "desc" as const };

  const [listings, territories, categories, locations] = await Promise.all([
    prisma.listing.findMany({ where, orderBy, take: 60, include: { territory: { select: { name: true } }, location: { select: { name: true } }, category: { select: { name: true, slug: true, icon: true, parent: { select: { icon: true } } } }, images: { orderBy: { position: "asc" }, take: 1 } } }),
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, slug: true, icon: true, parentId: true, parent: { select: { name: true } } } }),
    prisma.location.findMany({ where: territoryId ? { territoryId } : undefined, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const parents = categories.filter((c) => !c.parentId);
  const children = categories.filter((c) => c.parentId);

  return <main className="searchPage">
    <SiteHeader />
    <section className="searchHero"><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1></section>
    <form className="filtersBar" action="/recherche" method="get">
      <label><span>{copy.search}</span><input name="q" defaultValue={q} placeholder={copy.searchPlaceholder} /></label>
      <label><span>{copy.island}</span><select name="territory" defaultValue={territoryId}><option value="">{copy.allIslands}</option>{territories.map((territory) => <option value={territory.id} key={territory.id}>{territory.name}</option>)}</select></label>
      <label><span>{copy.city}</span><select name="location" defaultValue={locationId}><option value="">{copy.allCities}</option>{locations.map((location) => <option value={location.id} key={location.id}>{location.name}</option>)}</select></label>
      <label><span>{copy.category}</span><select name="category" defaultValue={categoryId}><option value="">{copy.allCategories}</option>{parents.map((parent) => <optgroup label={`${parent.icon ?? ""} ${categoryLabel(locale, parent.slug, parent.name)}`} key={parent.id}><option value={parent.id}>{copy.allInCategory} — {categoryLabel(locale, parent.slug, parent.name)}</option>{children.filter((child) => child.parentId === parent.id).map((child) => <option value={child.id} key={child.id}>{categoryLabel(locale, child.slug, child.name)}</option>)}</optgroup>)}</select></label>
      <label><span>{copy.minPrice}</span><input name="min" type="number" min="0" defaultValue={min ?? ""} /></label>
      <label><span>{copy.maxPrice}</span><input name="max" type="number" min="0" defaultValue={max ?? ""} /></label>
      <label><span>{copy.sort}</span><select name="sort" defaultValue={sort}><option value="recent">{copy.recent}</option><option value="price_asc">{copy.priceAsc}</option><option value="price_desc">{copy.priceDesc}</option></select></label>
      <button className="primaryButton" type="submit">{copy.submit}</button>
    </form>
    <section className="searchResultsShell"><div className="resultsHeading"><div><h2>{listings.length} {listings.length === 1 ? copy.listing : copy.listings}</h2><p>{q ? `${copy.resultsFor} « ${q} »` : copy.allAvailable}</p></div><a href="/recherche">{copy.reset}</a></div>{listings.length === 0 ? <div className="emptyStateCard"><span>🔎</span><h2>{copy.emptyTitle}</h2><p>{copy.emptyText}</p></div> : <div className="resultsGrid">{listings.map((listing) => <a className="resultCard" href={`/annonces/${listing.slug}`} key={listing.id}><div className="resultImage">{listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} /> : <span>📷</span>}</div><div className="resultBody"><small>{listing.category.icon ?? listing.category.parent?.icon} {categoryLabel(locale, listing.category.slug, listing.category.name)}</small><h2>{listing.title}</h2><strong>{listing.price ? new Intl.NumberFormat(dateLocale, { style: "currency", currency: listing.currency }).format(Number(listing.price)) : copy.priceOnRequest}</strong><span>📍 {listing.location?.name ? `${listing.location.name}, ` : ""}{listing.territory.name}</span></div></a>)}</div>}</section>
  </main>;
}
