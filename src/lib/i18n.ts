import { cookies } from "next/headers";

export type Locale = "fr" | "en";

export const dictionaries = {
  fr: {
    nav: { favorites: "Favoris", messages: "Messages", account: "Mon compte", login: "Se connecter", deposit: "Déposer une annonce", profile: "Mon profil", listings: "Mes annonces", settings: "Paramètres", logout: "Se déconnecter", loggingOut: "Déconnexion…", register: "Créer un compte" },
    home: {
      eyebrow: "100% pensé pour les Antilles", title1: "La marketplace", title2: "des Antilles.", intro: "Achetez, vendez et échangez près de chez vous. Véhicules, immobilier, multimédia, services et bien plus encore, réunis sur une seule plateforme.",
      searchWhat: "Que recherchez-vous ?", searchPlaceholder: "Voiture, appartement, téléphone…", category: "Catégorie", allCategories: "Toutes les catégories", where: "Où ?", allIslands: "Toutes les îles", search: "Rechercher",
      local: "100% Antilles", localSub: "Communauté locale", chat: "Chat intégré", chatSub: "Discutez directement", moderation: "Modération", moderationSub: "Une plateforme plus sûre", easy: "Publication simple", easySub: "En quelques minutes",
      explore: "Explorer", popular: "Catégories populaires", allCategoriesLink: "Voir toutes les catégories →", recentEyebrow: "Tout juste publiées", recent: "Annonces récentes", allListings: "Voir toutes les annonces →", noPhoto: "📷 Aucune photo", onRequest: "Prix sur demande", recentDate: "Publié récemment",
      emptyTitle: "Les premières annonces arrivent bientôt", emptyText: "Soyez parmi les premiers à publier sur Antilles Market.", sellEyebrow: "Simple et local", sellTitle: "Vous avez quelque chose à vendre ?", sellText: "Créez votre annonce en quelques minutes et échangez directement via la messagerie du site.", footer: "La marketplace locale des Antilles." },
    create: { eyebrow: "Vendre sur Antilles Market", title: "Déposer une annonce", intro: "Quelques informations suffisent pour commencer. Vous pourrez gérer l’annonce depuis votre compte.", info: "Informations", photos: "Photos", publish: "Publication" },
    language: { fr: "Français", en: "English", label: "Langue" },
  },
  en: {
    nav: { favorites: "Favorites", messages: "Messages", account: "My account", login: "Sign in", deposit: "Post an ad", profile: "My profile", listings: "My listings", settings: "Settings", logout: "Sign out", loggingOut: "Signing out…", register: "Create an account" },
    home: {
      eyebrow: "Made for the Caribbean", title1: "The Caribbean", title2: "marketplace.", intro: "Buy, sell and trade near you. Vehicles, property, electronics, services and much more, all in one local marketplace.",
      searchWhat: "What are you looking for?", searchPlaceholder: "Car, apartment, phone…", category: "Category", allCategories: "All categories", where: "Where?", allIslands: "All islands", search: "Search",
      local: "Caribbean-wide", localSub: "Local community", chat: "Built-in chat", chatSub: "Talk directly", moderation: "Moderation", moderationSub: "A safer marketplace", easy: "Easy posting", easySub: "In just a few minutes",
      explore: "Explore", popular: "Popular categories", allCategoriesLink: "View all categories →", recentEyebrow: "Just listed", recent: "Recent listings", allListings: "View all listings →", noPhoto: "📷 No photo", onRequest: "Price on request", recentDate: "Recently posted",
      emptyTitle: "The first listings are coming soon", emptyText: "Be among the first to post on Antilles Market.", sellEyebrow: "Simple and local", sellTitle: "Have something to sell?", sellText: "Create your listing in minutes and chat directly with people through the website.", footer: "The local marketplace for the Caribbean." },
    create: { eyebrow: "Sell on Antilles Market", title: "Post a listing", intro: "A few details are enough to get started. You can manage your listing from your account.", info: "Details", photos: "Photos", publish: "Publish" },
    language: { fr: "Français", en: "English", label: "Language" },
  },
} as const;

const categoryEnglish: Record<string, string> = {
  vehicules: "Vehicles", immobilier: "Property", emploi: "Jobs", multimedia: "Electronics", "maison-jardin": "Home & Garden", "mode-beaute": "Fashion & Beauty", "loisirs-sport": "Leisure & Sports", "evenements-sorties": "Events & Going Out", services: "Services", animaux: "Pets", "materiel-professionnel": "Professional Equipment", "enfance-bebe": "Kids & Baby", autres: "Other",
  "vehicules-voitures": "Cars", "vehicules-motos-scooters": "Motorcycles & Scooters", "vehicules-utilitaires": "Commercial Vehicles", "vehicules-pieces-accessoires": "Parts & Accessories", "vehicules-bateaux": "Boats",
  "immobilier-locations": "Rentals", "immobilier-ventes-immobilieres": "Property for Sale", "immobilier-locations-saisonnieres": "Vacation Rentals", "immobilier-terrains": "Land", "immobilier-bureaux-commerces": "Offices & Retail",
  "emploi-offres-d-emploi": "Job Offers", "emploi-demandes-d-emploi": "Job Seekers",
  "multimedia-telephones": "Phones", "multimedia-informatique": "Computers", "multimedia-tv-audio": "TV & Audio", "multimedia-jeux-video": "Video Games", "multimedia-photo-video": "Photo & Video",
  "maison-jardin-meubles": "Furniture", "maison-jardin-electromenager": "Appliances", "maison-jardin-decoration": "Decor", "maison-jardin-bricolage": "DIY", "maison-jardin-jardin": "Garden",
  "mode-beaute-vetements": "Clothing", "mode-beaute-chaussures": "Shoes", "mode-beaute-accessoires": "Accessories", "mode-beaute-beaute": "Beauty",
  "loisirs-sport-sport": "Sports", "loisirs-sport-velos": "Bicycles", "loisirs-sport-musique": "Music", "loisirs-sport-livres": "Books", "loisirs-sport-billetterie": "Tickets",
  "evenements-sorties-fetes-soirees": "Parties & Nightlife", "evenements-sorties-sports-competitions": "Sports & Competitions", "evenements-sorties-concerts-spectacles": "Concerts & Shows", "evenements-sorties-culture-traditions": "Culture & Traditions", "evenements-sorties-food-evenements-culinaires": "Food & Culinary Events", "evenements-sorties-loisirs-sorties": "Activities & Outings", "evenements-sorties-famille-enfants": "Family & Kids", "evenements-sorties-evenements-professionnels": "Business Events", "evenements-sorties-billets-reservations": "Tickets & Reservations", "evenements-sorties-autres-evenements": "Other Events",
};

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get("antilles_locale")?.value === "en" ? "en" : "fr";
}

export function getDictionary(locale: Locale) { return dictionaries[locale]; }
export function categoryLabel(locale: Locale, slug: string, fallback: string) { return locale === "en" ? (categoryEnglish[slug] ?? fallback) : fallback; }
