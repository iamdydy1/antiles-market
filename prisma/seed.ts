import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const territories = [
  ["Guadeloupe", "guadeloupe", "GP", "EUR"], ["Martinique", "martinique", "MQ", "EUR"], ["Saint-Martin", "saint-martin", "MF", "EUR"], ["Saint-Barthélemy", "saint-barthelemy", "BL", "EUR"], ["Marie-Galante", "marie-galante", "GP", "EUR"], ["Les Saintes", "les-saintes", "GP", "EUR"], ["La Désirade", "la-desirade", "GP", "EUR"], ["Haïti", "haiti", "HT", "HTG"], ["République dominicaine", "republique-dominicaine", "DO", "DOP"], ["Porto Rico", "porto-rico", "PR", "USD"], ["Cuba", "cuba", "CU", "CUP"], ["Jamaïque", "jamaique", "JM", "JMD"], ["Dominique", "dominique", "DM", "XCD"], ["Sainte-Lucie", "sainte-lucie", "LC", "XCD"], ["Barbade", "barbade", "BB", "BBD"], ["Grenade", "grenade", "GD", "XCD"], ["Antigua-et-Barbuda", "antigua-et-barbuda", "AG", "XCD"], ["Saint-Kitts-et-Nevis", "saint-kitts-et-nevis", "KN", "XCD"], ["Trinité-et-Tobago", "trinite-et-tobago", "TT", "TTD"], ["Aruba", "aruba", "AW", "AWG"], ["Curaçao", "curacao", "CW", "ANG"], ["Bonaire", "bonaire", "BQ", "USD"], ["Sint Maarten", "sint-maarten", "SX", "ANG"],
] as const;

const categories = [
  ["Véhicules", "vehicules", "🚗", 10], ["Immobilier", "immobilier", "🏠", 20], ["Emploi", "emploi", "💼", 30], ["Multimédia", "multimedia", "📱", 40], ["Maison & Jardin", "maison-jardin", "🛋️", 50], ["Mode & Beauté", "mode-beaute", "👕", 60], ["Loisirs & Sport", "loisirs-sport", "⚽", 70], ["Services", "services", "🔧", 80], ["Animaux", "animaux", "🐾", 90], ["Matériel professionnel", "materiel-professionnel", "🧰", 100], ["Enfance & Bébé", "enfance-bebe", "🧸", 110], ["Autres", "autres", "📦", 120],
] as const;

const subcategories: Record<string, string[]> = {
  vehicules: ["Voitures", "Motos & scooters", "Utilitaires", "Pièces & accessoires", "Bateaux"],
  immobilier: ["Locations", "Ventes immobilières", "Locations saisonnières", "Terrains", "Bureaux & commerces"],
  emploi: ["Offres d'emploi", "Demandes d'emploi"],
  multimedia: ["Téléphones", "Informatique", "TV & audio", "Jeux vidéo", "Photo & vidéo"],
  "maison-jardin": ["Meubles", "Électroménager", "Décoration", "Bricolage", "Jardin"],
  "mode-beaute": ["Vêtements", "Chaussures", "Accessoires", "Beauté"],
  "loisirs-sport": ["Sport", "Vélos", "Musique", "Livres", "Billetterie"],
  services: ["Dépannage", "Transport", "Cours & formation", "Événementiel", "Autres services"],
  animaux: ["Chiens", "Chats", "Autres animaux", "Accessoires animaux"],
  "materiel-professionnel": ["BTP", "Restauration", "Agriculture", "Commerce", "Outillage professionnel"],
  "enfance-bebe": ["Vêtements enfant", "Puériculture", "Jouets", "Mobilier enfant"],
};

const locations: Record<string, string[]> = {
  guadeloupe: ["Les Abymes", "Baie-Mahault", "Pointe-à-Pitre", "Le Gosier", "Sainte-Anne", "Saint-François", "Petit-Bourg", "Basse-Terre", "Lamentin", "Morne-à-l'Eau", "Le Moule", "Capesterre-Belle-Eau", "Deshaies", "Bouillante"],
  martinique: ["Fort-de-France", "Le Lamentin", "Schoelcher", "Le Robert", "Le François", "Ducos", "Rivière-Salée", "Sainte-Marie", "La Trinité", "Le Marin", "Sainte-Luce", "Les Trois-Îlets"],
  "saint-martin": ["Marigot", "Grand-Case", "Cul-de-Sac", "Quartier-d'Orléans", "Baie-Nettlé", "Concordia"],
  "saint-barthelemy": ["Gustavia", "Saint-Jean", "Lorient", "Colombier", "Flamands"],
  "marie-galante": ["Grand-Bourg", "Capesterre-de-Marie-Galante", "Saint-Louis"],
  "les-saintes": ["Terre-de-Haut", "Terre-de-Bas"],
  "la-desirade": ["Beauséjour", "Baie-Mahault"],
  haiti: ["Port-au-Prince", "Pétion-Ville", "Delmas", "Carrefour", "Cap-Haïtien", "Les Cayes", "Jacmel", "Gonaïves"],
  "republique-dominicaine": ["Saint-Domingue", "Santiago", "Punta Cana", "La Romana", "Puerto Plata", "San Pedro de Macorís"],
  "porto-rico": ["San Juan", "Bayamón", "Carolina", "Ponce", "Caguas", "Mayagüez"],
  cuba: ["La Havane", "Santiago de Cuba", "Camagüey", "Holguín", "Santa Clara", "Varadero"],
  jamaique: ["Kingston", "Montego Bay", "Spanish Town", "Portmore", "Ocho Rios", "Negril"],
  dominique: ["Roseau", "Portsmouth", "Marigot", "Canefield"],
  "sainte-lucie": ["Castries", "Gros Islet", "Vieux Fort", "Soufrière"],
  barbade: ["Bridgetown", "Speightstown", "Oistins", "Holetown"],
  grenade: ["Saint George's", "Gouyave", "Grenville", "Sauteurs"],
  "antigua-et-barbuda": ["Saint John's", "All Saints", "Liberta", "English Harbour"],
  "saint-kitts-et-nevis": ["Basseterre", "Charlestown", "Sandy Point Town"],
  "trinite-et-tobago": ["Port-d'Espagne", "San Fernando", "Chaguanas", "Arima", "Scarborough"],
  aruba: ["Oranjestad", "Noord", "San Nicolas", "Santa Cruz"],
  curacao: ["Willemstad", "Bandabou", "Jan Thiel"],
  bonaire: ["Kralendijk", "Rincon"],
  "sint-maarten": ["Philipsburg", "Simpson Bay", "Cole Bay", "Dutch Quarter"],
};

function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

async function main() {
  const territoryMap = new Map<string, string>();
  for (const [name, slug, countryCode, currency] of territories) {
    const territory = await prisma.territory.upsert({ where: { slug }, update: { name, countryCode, currency, isActive: true }, create: { name, slug, countryCode, currency } });
    territoryMap.set(slug, territory.id);
  }

  const categoryMap = new Map<string, string>();
  for (const [name, slug, icon, sortOrder] of categories) {
    const category = await prisma.category.upsert({ where: { slug }, update: { name, icon, sortOrder, isActive: true }, create: { name, slug, icon, sortOrder } });
    categoryMap.set(slug, category.id);
  }

  for (const [parentSlug, children] of Object.entries(subcategories)) {
    const parentId = categoryMap.get(parentSlug);
    if (!parentId) continue;
    for (const [index, name] of children.entries()) {
      const slug = `${parentSlug}-${slugify(name)}`;
      await prisma.category.upsert({ where: { slug }, update: { name, parentId, sortOrder: index + 1, isActive: true }, create: { name, slug, parentId, sortOrder: index + 1 } });
    }
  }

  let locationCount = 0;
  for (const [territorySlug, names] of Object.entries(locations)) {
    const territoryId = territoryMap.get(territorySlug);
    if (!territoryId) continue;
    for (const name of names) {
      await prisma.location.upsert({ where: { territoryId_slug: { territoryId, slug: slugify(name) } }, update: { name }, create: { name, slug: slugify(name), territoryId } });
      locationCount++;
    }
  }
  console.log(`Seed complete: ${territories.length} territories, categories/subcategories and ${locationCount} locations.`);
}

main().then(async () => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
