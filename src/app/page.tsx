import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [territories, categories, recentListings] = await Promise.all([
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: 8, select: { id: true, name: true, icon: true } }),
    prisma.listing.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 6, include: { territory: { select: { name: true } }, images: { orderBy: { position: "asc" }, take: 1 } } }),
  ]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Antilles Market — Accueil"><span className="brandMark">AM</span><span>Antilles Market</span></a>
        <nav className="headerActions" aria-label="Navigation principale"><a className="ghostButton" href="/favoris">♡ Favoris</a><a className="ghostButton" href="/messages">💬 Messages</a><a className="ghostButton" href="/compte">Mon compte</a><a className="primaryButton" href="/deposer">+ Déposer une annonce</a></nav>
      </header>

      <section className="hero">
        <div className="heroOverlay" />
        <div className="heroInner">
          <div className="heroCopy"><span className="eyebrow heroEyebrow">100% pensé pour les Antilles</span><h1>La marketplace<br />des Antilles.</h1><p>Achetez, vendez et échangez près de chez vous. Véhicules, immobilier, multimédia, services et bien plus encore, réunis sur une seule plateforme.</p></div>
          <form className="searchCard" action="/recherche" method="get">
            <label><span>Que recherchez-vous ?</span><input name="q" placeholder="Voiture, appartement, téléphone…" /></label>
            <label><span>Catégorie</span><select name="category" defaultValue=""><option value="">Toutes les catégories</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.icon} {category.name}</option>)}</select></label>
            <label><span>Où ?</span><select name="territory" defaultValue=""><option value="">Toutes les îles</option>{territories.map((territory) => <option value={territory.id} key={territory.id}>{territory.name}</option>)}</select></label>
            <button className="searchButton" type="submit">Rechercher</button>
          </form>
          <div className="trustBar"><span>🌴 <b>100% Antilles</b><small>Communauté locale</small></span><span>💬 <b>Chat intégré</b><small>Discutez directement</small></span><span>🛡️ <b>Modération</b><small>Une plateforme plus sûre</small></span><span>✨ <b>Publication simple</b><small>En quelques minutes</small></span></div>
        </div>
      </section>

      <section className="sectionShell"><div className="sectionHeading"><div><span className="eyebrow">Explorer</span><h2>Catégories populaires</h2></div><a href="/recherche">Voir toutes les catégories →</a></div><div className="categoryGrid">{categories.map((category) => <a className="categoryCard" href={`/recherche?category=${category.id}`} key={category.id}><span className="categoryIcon">{category.icon ?? "•"}</span><span>{category.name}</span></a>)}</div></section>

      <section className="sectionShell"><div className="sectionHeading"><div><span className="eyebrow">Tout juste publiées</span><h2>Annonces récentes</h2></div><a href="/recherche">Voir toutes les annonces →</a></div>
        {recentListings.length ? <div className="listingGrid">{recentListings.map((listing) => <a className="listingCard" href={`/annonces/${listing.slug}`} key={listing.id}><div className="listingImage">{listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} /> : <span>📷 Aucune photo</span>}</div><div className="listingBody"><h3>{listing.title}</h3><strong>{listing.price ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: listing.currency }).format(Number(listing.price)) : "Prix sur demande"}</strong><span>📍 {listing.territory.name}</span><small>{listing.publishedAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(listing.publishedAt) : "Publié récemment"}</small></div></a>)}</div> : <div className="emptyStateCard"><span>🌴</span><h2>Les premières annonces arrivent bientôt</h2><p>Soyez parmi les premiers à publier sur Antilles Market.</p><a className="primaryButton" href="/deposer">Déposer une annonce</a></div>}
      </section>

      <section className="sellBanner"><div><span className="eyebrow">Simple et local</span><h2>Vous avez quelque chose à vendre ?</h2><p>Créez votre annonce en quelques minutes et échangez directement via la messagerie du site.</p></div><a className="lightButton" href="/deposer">Déposer une annonce</a></section>
      <footer><div className="brand"><span className="brandMark">AM</span><span>Antilles Market</span></div><p>La marketplace locale des Antilles.</p><small>© 2026 Antilles Market. Tous droits réservés.</small></footer>
    </main>
  );
}
