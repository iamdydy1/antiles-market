import { prisma } from "@/lib/prisma";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function numeric(value: string | undefined) { if (!value) return undefined; const n = Number(value.replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : undefined; }

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams; const q = one(raw.q)?.trim() ?? ""; const territoryId = one(raw.territory) ?? ""; const locationId = one(raw.location) ?? ""; const categoryId = one(raw.category) ?? ""; const min = numeric(one(raw.min)); const max = numeric(one(raw.max)); const sort = one(raw.sort) ?? "recent";
  const selectedCategory = categoryId ? await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, parentId: true } }) : null;
  const where = { status: "PUBLISHED" as const, ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {}), ...(territoryId ? { territoryId } : {}), ...(locationId ? { locationId } : {}), ...(categoryId ? (selectedCategory?.parentId ? { categoryId } : { category: { OR: [{ id: categoryId }, { parentId: categoryId }] } }) : {}), ...((min !== undefined || max !== undefined) ? { price: { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) } } : {}) };
  const orderBy = sort === "price_asc" ? { price: "asc" as const } : sort === "price_desc" ? { price: "desc" as const } : { publishedAt: "desc" as const };
  const [listings, territories, categories, locations] = await Promise.all([
    prisma.listing.findMany({ where, orderBy, take: 60, include: { territory: { select: { name: true } }, location: { select: { name: true } }, category: { select: { name: true, icon: true, parent: { select: { icon: true } } } }, images: { orderBy: { position: "asc" }, take: 1 } } }),
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, icon: true, parentId: true, parent: { select: { name: true } } } }),
    prisma.location.findMany({ where: territoryId ? { territoryId } : undefined, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const parents = categories.filter((c) => !c.parentId); const children = categories.filter((c) => c.parentId);
  return <main className="searchPage">
    <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><nav className="headerActions"><a className="ghostButton" href="/messages">Messages</a><a className="ghostButton" href="/compte">Mon compte</a><a className="primaryButton" href="/deposer">+ Déposer</a></nav></header>
    <section className="searchHero"><span className="eyebrow">Explorer les Antilles</span><h1>Trouvez exactement ce que vous cherchez.</h1></section>
    <form className="filtersBar" action="/recherche" method="get">
      <label><span>Recherche</span><input name="q" defaultValue={q} placeholder="Voiture, appartement, téléphone…" /></label>
      <label><span>Île</span><select name="territory" defaultValue={territoryId}><option value="">Toutes les îles</option>{territories.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      <label><span>Ville</span><select name="location" defaultValue={locationId}><option value="">Toutes les villes</option>{locations.map((l) => <option value={l.id} key={l.id}>{l.name}</option>)}</select></label>
      <label><span>Catégorie</span><select name="category" defaultValue={categoryId}><option value="">Toutes les catégories</option>{parents.map((p) => <optgroup label={`${p.icon ?? ""} ${p.name}`} key={p.id}><option value={p.id}>Tout — {p.name}</option>{children.filter((c) => c.parentId === p.id).map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</optgroup>)}</select></label>
      <label><span>Prix min.</span><input name="min" type="number" min="0" defaultValue={min ?? ""} /></label><label><span>Prix max.</span><input name="max" type="number" min="0" defaultValue={max ?? ""} /></label><label><span>Trier</span><select name="sort" defaultValue={sort}><option value="recent">Plus récentes</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option></select></label><button className="primaryButton" type="submit">Rechercher</button>
    </form>
    <section className="searchResultsShell"><div className="resultsHeading"><div><h2>{listings.length} annonce{listings.length !== 1 ? "s" : ""}</h2><p>{q ? `Résultats pour « ${q} »` : "Toutes les annonces disponibles"}</p></div><a href="/recherche">Réinitialiser les filtres</a></div>{listings.length === 0 ? <div className="emptyStateCard"><span>🔎</span><h2>Aucune annonce trouvée</h2><p>Essayez d'élargir vos critères de recherche.</p></div> : <div className="resultsGrid">{listings.map((listing) => <a className="resultCard" href={`/annonces/${listing.slug}`} key={listing.id}><div className="resultImage">{listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} /> : <span>📷</span>}</div><div className="resultBody"><small>{listing.category.icon ?? listing.category.parent?.icon} {listing.category.name}</small><h2>{listing.title}</h2><strong>{listing.price ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: listing.currency }).format(Number(listing.price)) : "Prix sur demande"}</strong><span>📍 {listing.location?.name ? `${listing.location.name}, ` : ""}{listing.territory.name}</span></div></a>)}</div>}</section>
  </main>;
}
