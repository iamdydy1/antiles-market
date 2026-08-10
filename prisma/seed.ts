import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const territories = [
  ["Guadeloupe", "guadeloupe", "GP", "EUR"],
  ["Martinique", "martinique", "MQ", "EUR"],
  ["Saint-Martin", "saint-martin", "MF", "EUR"],
  ["Saint-Barthélemy", "saint-barthelemy", "BL", "EUR"],
  ["Marie-Galante", "marie-galante", "GP", "EUR"],
  ["Les Saintes", "les-saintes", "GP", "EUR"],
  ["La Désirade", "la-desirade", "GP", "EUR"],
  ["Haïti", "haiti", "HT", "HTG"],
  ["République dominicaine", "republique-dominicaine", "DO", "DOP"],
  ["Porto Rico", "porto-rico", "PR", "USD"],
  ["Cuba", "cuba", "CU", "CUP"],
  ["Jamaïque", "jamaique", "JM", "JMD"],
  ["Dominique", "dominique", "DM", "XCD"],
  ["Sainte-Lucie", "sainte-lucie", "LC", "XCD"],
  ["Barbade", "barbade", "BB", "BBD"],
  ["Grenade", "grenade", "GD", "XCD"],
  ["Antigua-et-Barbuda", "antigua-et-barbuda", "AG", "XCD"],
  ["Saint-Kitts-et-Nevis", "saint-kitts-et-nevis", "KN", "XCD"],
  ["Trinité-et-Tobago", "trinite-et-tobago", "TT", "TTD"],
  ["Aruba", "aruba", "AW", "AWG"],
  ["Curaçao", "curacao", "CW", "ANG"],
  ["Bonaire", "bonaire", "BQ", "USD"],
  ["Sint Maarten", "sint-maarten", "SX", "ANG"],
] as const;

const categories = [
  ["Véhicules", "vehicules", "🚗", 10],
  ["Immobilier", "immobilier", "🏠", 20],
  ["Emploi", "emploi", "💼", 30],
  ["Multimédia", "multimedia", "📱", 40],
  ["Maison & Jardin", "maison-jardin", "🛋️", 50],
  ["Mode & Beauté", "mode-beaute", "👕", 60],
  ["Loisirs & Sport", "loisirs-sport", "⚽", 70],
  ["Services", "services", "🔧", 80],
  ["Animaux", "animaux", "🐾", 90],
  ["Matériel professionnel", "materiel-professionnel", "🧰", 100],
  ["Enfance & Bébé", "enfance-bebe", "🧸", 110],
  ["Autres", "autres", "📦", 120],
] as const;

async function main() {
  for (const [name, slug, countryCode, currency] of territories) {
    await prisma.territory.upsert({
      where: { slug },
      update: { name, countryCode, currency, isActive: true },
      create: { name, slug, countryCode, currency },
    });
  }

  for (const [name, slug, icon, sortOrder] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, icon, sortOrder, isActive: true },
      create: { name, slug, icon, sortOrder },
    });
  }

  console.log(`Seed complete: ${territories.length} territories and ${categories.length} categories.`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
