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
        <a className="brand" href="#" aria-label="Antilles Market — Accueil">
          <span className="brandMark">AM</span>
          <span>Antilles Market</span>
        </a>
        <nav className="headerActions" aria-label="Navigation principale">
          <button className="ghostButton">Messages</button>
          <button className="ghostButton">Se connecter</button>
          <button className="primaryButton">+ Déposer une annonce</button>
        </nav>
      </header>

      <section className="hero">
        <div className="heroCopy">
          <span className="eyebrow">100% pensé pour les Antilles</span>
          <h1>Achetez et vendez près de chez vous.</h1>
          <p>
            Véhicules, immobilier, emploi, multimédia, services et bien plus encore,
            réunis sur une seule plateforme pour nos îles.
          </p>
        </div>

        <form className="searchCard">
          <label>
            <span>Que recherchez-vous ?</span>
            <input name="q" placeholder="Voiture, appartement, téléphone…" />
          </label>
          <label>
            <span>Où ?</span>
            <select name="territory" defaultValue="">
              <option value="">Toutes les îles</option>
              {territories.map((territory) => (
                <option key={territory}>{territory}</option>
              ))}
            </select>
          </label>
          <button className="searchButton" type="submit">Rechercher</button>
        </form>
      </section>

      <section className="sectionShell">
        <div className="sectionHeading">
          <div>
            <span className="eyebrow">Explorer</span>
            <h2>Les catégories populaires</h2>
          </div>
          <a href="#">Toutes les catégories →</a>
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
          {demoListings.map((listing) => (
            <article className="listingCard" key={listing.title}>
              <div className="listingImage" aria-hidden="true">
                <span>Photo</span>
                <button aria-label={`Ajouter ${listing.title} aux favoris`}>♡</button>
              </div>
              <div className="listingBody">
                <h3>{listing.title}</h3>
                <strong>{listing.price}</strong>
                <span>{listing.location}</span>
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
        <button className="lightButton">Déposer une annonce</button>
      </section>

      <footer>
        <div className="brand"><span className="brandMark">AM</span><span>Antilles Market</span></div>
        <p>La marketplace locale des Antilles.</p>
        <small>© 2026 Antilles Market. Tous droits réservés.</small>
      </footer>
    </main>
  );
}
