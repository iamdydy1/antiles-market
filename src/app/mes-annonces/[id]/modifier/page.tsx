import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EditListingForm from "@/components/EditListingForm";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { categoryLabel, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

function dateTimeInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 16) : "";
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const { id } = await params;
  const [listing, territories, categories, locations] = await Promise.all([
    prisma.listing.findFirst({
      where: { id, sellerId: session.userId },
      select: {
        id: true, title: true, description: true, price: true, categoryId: true, territoryId: true, locationId: true, vehicleMileage: true,
        eventStartAt: true, eventEndAt: true, eventVenue: true, eventOrganizer: true, eventUrl: true, eventCapacity: true, eventIsFree: true,
      },
    }),
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, currency: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, slug: true, icon: true, parentId: true, parent: { select: { slug: true } } } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, territoryId: true } }),
  ]);

  if (!listing) notFound();
  const localizedCategories = categories.map((category) => ({ ...category, name: categoryLabel(locale, category.slug, category.name) }));
  const fr = locale === "fr";

  return <main className="createListingPage">
    <SiteHeader />
    <section className="createListingHeader"><div><span className="eyebrow">{fr ? "Gestion vendeur" : "Seller management"}</span><h1>{fr ? "Modifier mon annonce" : "Edit my listing"}</h1><p>{fr ? "Mettez à jour toutes les informations importantes de votre annonce." : "Update all the important details of your listing."}</p></div></section>
    <EditListingForm
      listing={{
        ...listing,
        price: listing.price ? String(listing.price) : "0",
        eventStartAt: dateTimeInput(listing.eventStartAt),
        eventEndAt: dateTimeInput(listing.eventEndAt),
      }}
      territories={territories}
      categories={localizedCategories}
      locations={locations}
      locale={locale}
    />
  </main>;
}
