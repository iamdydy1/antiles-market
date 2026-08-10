import { cookies } from "next/headers";

export type Locale = "fr" | "en";

export const dictionaries = {
  fr: {
    nav: { favorites: "Favoris", messages: "Messages", account: "Mon compte", login: "Se connecter", deposit: "Déposer une annonce", profile: "Mon profil", listings: "Mes annonces", offers: "Mes offres", settings: "Paramètres", logout: "Se déconnecter", loggingOut: "Déconnexion…", register: "Créer un compte" },
    common: { home: "Accueil", seller: "Vendeur", memberSince: "Membre depuis", noPhoto: "Aucune photo", noPhone: "Non renseigné", privateAccount: "Particulier", available: "Disponible", reserved: "Réservée", sold: "Vendue", archived: "Archivée", draft: "Brouillon", priceOnRequest: "Prix sur demande" },
    home: {
      eyebrow: "100% pensé pour les Antilles", title1: "La marketplace", title2: "des Antilles.", intro: "Achetez, vendez et échangez près de chez vous. Véhicules, immobilier, multimédia, services et bien plus encore, réunis sur une seule plateforme.",
      searchWhat: "Que recherchez-vous ?", searchPlaceholder: "Voiture, appartement, téléphone…", category: "Catégorie", allCategories: "Toutes les catégories", where: "Où ?", allIslands: "Toutes les îles", search: "Rechercher",
      local: "100% Antilles", localSub: "Communauté locale", chat: "Chat intégré", chatSub: "Discutez directement", moderation: "Modération", moderationSub: "Une plateforme plus sûre", easy: "Publication simple", easySub: "En quelques minutes",
      explore: "Explorer", popular: "Catégories populaires", allCategoriesLink: "Voir toutes les catégories →", recentEyebrow: "Tout juste publiées", recent: "Annonces récentes", allListings: "Voir toutes les annonces →", noPhoto: "📷 Aucune photo", onRequest: "Prix sur demande", recentDate: "Publié récemment",
      emptyTitle: "Les premières annonces arrivent bientôt", emptyText: "Soyez parmi les premiers à publier sur Antilles Market.", sellEyebrow: "Simple et local", sellTitle: "Vous avez quelque chose à vendre ?", sellText: "Créez votre annonce en quelques minutes et échangez directement via la messagerie du site.", footer: "La marketplace locale des Antilles." },
    account: { space: "Mon espace", hello: "Bonjour", published: "Annonces publiées", sentMessages: "Messages envoyés", personalInfo: "Informations personnelles", displayName: "Nom affiché", email: "E-mail", phone: "Téléphone", accountType: "Type de compte", memberSince: "Membre depuis" },
    settings: { title: "Paramètres", intro: "Gérez la sécurité et les informations importantes de votre compte.", account: "Compte", accountInfo: "Informations du compte", security: "Sécurité", changePassword: "Changer mon mot de passe", passwordHelp: "Utilisez votre mot de passe actuel pour confirmer la modification.", comingSoon: "À venir", otherSettings: "Autres paramètres", comingText: "Modification de l’e-mail, préférences de notifications et suppression du compte seront ajoutées après les tests de la V1." },
    listing: { description: "Description", about: "À propos de cette annonce", noPhoto: "Le vendeur n’a pas ajouté de photo.", contact: "Contacter le vendeur", open: "Ouverture…", viewProfile: "Voir le profil →", makeOffer: "Faire une offre" },
    offers: { negotiation: "Négociation", title: "Mes offres", intro: "Suivez les propositions envoyées et reçues sur vos annonces.", emptyTitle: "Aucune offre pour le moment", emptyText: "Depuis une annonce, utilisez « Faire une offre » pour proposer un prix au vendeur.", browse: "Voir les annonces", yourOffer: "Votre offre", received: "Offre reçue", displayedPrice: "Prix affiché", proposedByYou: "Proposée par vous", proposedBy: "Proposée par", expires: "Expire le", statuses: { PENDING: "En attente", ACCEPTED: "Acceptée", REJECTED: "Refusée", COUNTERED: "Contre-offre envoyée", WITHDRAWN: "Retirée", EXPIRED: "Expirée" } },
    create: { eyebrow: "Vendre sur Antilles Market", title: "Déposer une annonce", intro: "Quelques informations suffisent pour commencer. Vous pourrez gérer l’annonce depuis votre compte.", info: "Informations", photos: "Photos", publish: "Publication" },
    language: { fr: "Français", en: "English", label: "Langue" },
  },
  en: {
    nav: { favorites: "Favorites", messages: "Messages", account: "My account", login: "Sign in", deposit: "Post a listing", profile: "My profile", listings: "My listings", offers: "My offers", settings: "Settings", logout: "Sign out", loggingOut: "Signing out…", register: "Create an account" },
    common: { home: "Home", seller: "Seller", memberSince: "Member since", noPhoto: "No photo", noPhone: "Not provided", privateAccount: "Individual", available: "Available", reserved: "Reserved", sold: "Sold", archived: "Archived", draft: "Draft", priceOnRequest: "Price on request" },
    home: {
      eyebrow: "Made for the Caribbean", title1: "The Caribbean", title2: "marketplace.", intro: "Buy, sell and trade near you. Vehicles, property, electronics, services and much more, all in one local marketplace.",
      searchWhat: "What are you looking for?", searchPlaceholder: "Car, apartment, phone…", category: "Category", allCategories: "All categories", where: "Where?", allIslands: "All islands", search: "Search",
      local: "Caribbean-wide", localSub: "Local community", chat: "Built-in chat", chatSub: "Talk directly", moderation: "Moderation", moderationSub: "A safer marketplace", easy: "Easy posting", easySub: "In just a few minutes",
      explore: "Explore", popular: "Popular categories", allCategoriesLink: "View all categories →", recentEyebrow: "Just listed", recent: "Recent listings", allListings: "View all listings →", noPhoto: "📷 No photo", onRequest: "Price on request", recentDate: "Recently posted",
      emptyTitle: "The first listings are coming soon", emptyText: "Be among the first to post on Antilles Market.", sellEyebrow: "Simple and local", sellTitle: "Have something to sell?", sellText: "Create your listing in minutes and chat directly with people through the website.", footer: "The local marketplace for the Caribbean." },
    account: { space: "My space", hello: "Hello", published: "Published listings", sentMessages: "Messages sent", personalInfo: "Personal information", displayName: "Display name", email: "Email", phone: "Phone", accountType: "Account type", memberSince: "Member since" },
    settings: { title: "Settings", intro: "Manage your account security and important account information.", account: "Account", accountInfo: "Account information", security: "Security", changePassword: "Change my password", passwordHelp: "Use your current password to confirm the change.", comingSoon: "Coming soon", otherSettings: "Other settings", comingText: "Email changes, notification preferences and account deletion will be added after V1 testing." },
    listing: { description: "Description", about: "About this listing", noPhoto: "The seller has not added any photos.", contact: "Contact seller", open: "Opening…", viewProfile: "View profile →", makeOffer: "Make an offer" },
    offers: { negotiation: "Negotiation", title: "My offers", intro: "Track offers sent and received on your listings.", emptyTitle: "No offers yet", emptyText: "From a listing, use “Make an offer” to suggest a price to the seller.", browse: "Browse listings", yourOffer: "Your offer", received: "Offer received", displayedPrice: "Listed price", proposedByYou: "Proposed by you", proposedBy: "Proposed by", expires: "Expires", statuses: { PENDING: "Pending", ACCEPTED: "Accepted", REJECTED: "Rejected", COUNTERED: "Counter-offer sent", WITHDRAWN: "Withdrawn", EXPIRED: "Expired" } },
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
