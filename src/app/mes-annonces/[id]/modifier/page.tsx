import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EditListingForm from "@/components/EditListingForm";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const { id } = await params;
  const [listing, territories, categories] = await Promise.all([
    prisma.listing.findFirst({
      where: { id, sellerId: session.userId },
      select: { id: true, title: true, description: true, price: true, categoryId: true, territoryId: true },
    }),
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, currency: true } }),
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, icon: true } }),
  ]);

  if (!listing) notFound();

  return (
    <main className="createListingPage">
      <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><a className="ghostButton" href="/mes-annonces">Mes annonces</a></header>
      <section className="createListingHeader"><div><span className="eyebrow">Gestion vendeur</span><h1>Modifier mon annonce</h1><p>Mettez à jour les informations de votre annonce.</p></div></section>
      <EditListingForm
        listing={{ ...listing, price: listing.price ? String(listing.price) : "0" }}
        territories={territories}
        categories={categories}
      />
    </main>
  );
}
