import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreateListingForm from "@/components/CreateListingForm";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CreateListingPage() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const [territories, categories, locations] = await Promise.all([
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, currency: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, slug: true, icon: true, parentId: true, parent: { select: { name: true, slug: true } } } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, territoryId: true } }),
  ]);

  const fr = locale === "fr";

  return <main className="createListingPage">
    <SiteHeader />
    <section className="createListingHeader">
      <div>
        <span className="eyebrow">{fr ? "Vendre sur Antilles Market" : "Sell on Antilles Market"}</span>
        <h1>{fr ? "Déposer une annonce" : "Post a listing"}</h1>
        <p>{fr ? "Quelques informations suffisent pour commencer. Vous pourrez gérer l’annonce depuis votre compte." : "A few details are enough to get started. You can manage the listing from your account."}</p>
      </div>
      <div className="formProgress" aria-label={fr ? "Progression" : "Progress"}>
        <span className="active">1 <small>{fr ? "Informations" : "Details"}</small></span>
        <span>2 <small>{fr ? "Photos" : "Photos"}</small></span>
        <span>3 <small>{fr ? "Publication" : "Publish"}</small></span>
      </div>
    </section>
    {territories.length && categories.length ? <CreateListingForm territories={territories} categories={categories} locations={locations} locale={locale} /> : <div className="setupNotice"><strong>{fr ? "Catalogue en cours d’initialisation." : "Catalog is being initialized."}</strong><p>{fr ? "Les territoires et catégories doivent être chargés avant la première annonce." : "Territories and categories must be loaded before the first listing."}</p></div>}
  </main>;
}
