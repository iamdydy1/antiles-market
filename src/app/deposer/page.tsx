import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreateListingForm from "@/components/CreateListingForm";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { categoryLabel, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CreateListingPage() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion?next=/deposer");

  const [territories, categories, locations] = await Promise.all([
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, currency: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, slug: true, icon: true, parentId: true, parent: { select: { name: true, slug: true } } } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, territoryId: true } }),
  ]);

  const localizedCategories = categories.map((category) => ({
    ...category,
    name: categoryLabel(locale, category.slug, category.name),
    parent: category.parent ? { ...category.parent, name: categoryLabel(locale, category.parent.slug, category.parent.name) } : null,
  }));
  const fr = locale === "fr";

  return <main className="createListingPage">
    <SiteHeader />
    <section className="createListingHeader">
      <div>
        <span className="eyebrow">{fr ? "Vendre sur Antilles Market" : "Sell on Antilles Market"}</span>
        <h1>{fr ? "Déposer une annonce" : "Post a listing"}</h1>
        <p>{fr ? "Créez votre annonce en trois étapes simples. Vos informations restent enregistrées lorsque vous passez d’une étape à l’autre." : "Create your listing in three simple steps. Your information stays saved as you move between steps."}</p>
      </div>
    </section>
    {territories.length && localizedCategories.length ? <CreateListingForm territories={territories} categories={localizedCategories} locations={locations} locale={locale} /> : <div className="setupNotice"><strong>{fr ? "Catalogue en cours d’initialisation." : "Catalog is being initialized."}</strong><p>{fr ? "Les territoires et catégories doivent être chargés avant la première annonce." : "Territories and categories must be loaded before the first listing."}</p></div>}
  </main>;
}
