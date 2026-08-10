const territories = [
  "Guadeloupe",
  "Martinique",
  "Saint-Martin",
  "Saint-Barthélemy",
  "Marie-Galante",
  "Les Saintes",
  "La Désirade",
];

const categories = [
  ["🚗", "Véhicules"],
  ["🏠", "Immobilier"],
  ["💼", "Emploi"],
  ["📱", "Multimédia"],
  ["🛋️", "Maison"],
  ["👕", "Mode"],
  ["🔧", "Services"],
  ["⚽", "Loisirs"],
];

const demoListings = [
  { title: "Renault Clio", price: "8 900 €", location: "Les Abymes · Guadeloupe" },
  { title: "Appartement T2 vue mer", price: "890 € / mois", location: "Fort-de-France · Martinique" },
  { title: "iPhone récent", price: "650 €", location: "Marigot · Saint-Martin" },
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Antilles Market — Accueil">
          <span className="brandMark">AM</span>
          <span>Antilles Market</span>
        </a>
        <nav className="headerActions" aria-label="Navigation principale">
          <a className="ghostButton" href="#">♡ Favoris</a>
          <a className="ghostButton" href="#">💬 Messages</a>
          <a className="ghostButton" href="/connexion">Se connecter</a>
          <a className="primaryButton" href="/deposer">+ Déposer une annonce</a>
        </nav>
      </header>

      <section className="hero">
        <div className="heroOverlay" />
        <div className="heroInner">
          <div className="heroCopy">
            <span className="eyebrow heroEyebrow">100% pensé pour les Antilles</span>
            <h1>La marketplace<br />des Antilles.</h1>
            <p>
              Achetez, vendez et échangez près de chez vous. Véhicules, immobilier,
              multimédia, services et bien plus encore, réunis sur une seule plateforme.
            </p>
          </div>

          <form className="searchCard">
            <label>
              <span>Que recherchez-vous ?</span>
              <input name="q" placeholder="Voiture, appartement, téléphone…" />
            </label>
            <label>
              <span>Catégorie</span>
              <select name="category" defaultValue="">
                <option value="">Toutes les catégories</option>
                {categories.map(([, category]) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              <span>Où ?</span>
              <select name="territory" defaultValue="">
                <option value="">Toutes les îles</option>
                {territories.map((territory) => <option key={territory}>{territory}</option>)}
              </select>
            </label>
            <button className="searchButton" type="submit">Rechercher</button>
          </form>

          <div className="trustBar">
            <span>🌴 <b>100% Antilles</b><small>Communauté locale</small></span>
            <span>💬 <b>Chat intégré</b><small>Discutez directement</small></span>
            <span>🛡️ <b>Modération</b><small>Une plateforme plus sûre</small></span>
            <span>✨ <b>Publication simple</b><small>En quelques minutes</small></span>
          </div>
        </div>
      </section>

      <section className="sectionShell">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">Explorer</span>
            <h2>Catégories populaires</h2>
          </div>
          <a href="#">Voir toutes les catégories →</a>
        </div>
        <div className="categoryGrid">
          {categories.map(([icon, label]) => (
            <a className="categoryCard" href="#" key={label}>
              <span className="categoryIcon">{icon}</span>
              <span>{label}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="sectionShell">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">Tout juste publiées</span>
            <h2>Annonces récentes</h2>
          </div>
          <a href="#">Voir toutes les annonces →</a>
        </div>
        <div className="listingGrid">
          {demoListings.map((listing, index) => (
            <article className="listingCard" key={listing.title}>
              <div className={`listingImage listingImage${index + 1}`}>
                <span>Photo de l’annonce</span>
                <button aria-label={`Ajouter ${listing.title} aux favoris`}>♡</button>
              </div>
              <div className="listingBody">
                <h3>{listing.title}</h3>
                <strong>{listing.price}</strong>
                <span>📍 {listing.location}</span>
                <small>Il y a quelques minutes</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sellBanner">
        <div>
          <span className="eyebrow">Simple et local</span>
          <h2>Vous avez quelque chose à vendre ?</h2>
          <p>Créez votre annonce en quelques minutes et échangez directement via la messagerie du site.</p>
        </div>
        <a className="lightButton" href="/deposer">Déposer une annonce</a>
      </section>

      <footer>
        <div className="brand"><span className="brandMark">AM</span><span>Antilles Market</span></div>
        <p>La marketplace locale des Antilles.</p>
        <small>© 2026 Antilles Market. Tous droits réservés.</small>
      </footer>
    </main>
  );
}
