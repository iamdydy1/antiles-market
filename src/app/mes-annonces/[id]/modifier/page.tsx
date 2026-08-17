import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EditListingForm from "@/components/EditListingForm";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { categoryLabel, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const { id } = await params;
  const [listing, territories, categories] = await Promise.all([
    prisma.listing.findFirst({
      where: { id, sellerId: session.userId },
      select: { id: true, title: true, description: true, price: true, categoryId: true, territoryId: true, vehicleMileage: true },
    }),
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, currency: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, slug: true, icon: true, parentId: true, parent: { select: { slug: true } } } }),
  ]);

  if (!listing) notFound();
  const localizedCategories = categories.map((category) => ({ ...category, name: categoryLabel(locale, category.slug, category.name) }));
  const fr = locale === "fr";

  return <main className="createListingPage">
    <SiteHeader />
    <section className="createListingHeader"><div><span className="eyebrow">{fr ? "Gestion vendeur" : "Seller management"}</span><h1>{fr ? "Modifier mon annonce" : "Edit my listing"}</h1><p>{fr ? "Mettez à jour les informations de votre annonce." : "Update your listing details."}</p></div></section>
    <EditListingForm listing={{ ...listing, price: listing.price ? String(listing.price) : "0" }} territories={territories} categories={localizedCategories} locale={locale} />
  </main>;
}
