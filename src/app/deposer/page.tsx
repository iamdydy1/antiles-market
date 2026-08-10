import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreateListingForm from "@/components/CreateListingForm";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CreateListingPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const [territories, categories, locations] = await Promise.all([
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, currency: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, icon: true, parentId: true, parent: { select: { name: true } } } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, territoryId: true } }),
  ]);

  return (
    <main className="createListingPage">
      <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><a className="ghostButton" href="/compte">Mon compte</a></header>
      <section className="createListingHeader">
        <div><span className="eyebrow">Vendre sur Antilles Market</span><h1>Déposer une annonce</h1><p>Quelques informations suffisent pour commencer. Vous pourrez gérer l’annonce depuis votre compte.</p></div>
        <div className="formProgress" aria-label="Progression"><span className="active">1 <small>Informations</small></span><span>2 <small>Photos</small></span><span>3 <small>Publication</small></span></div>
      </section>
      {territories.length && categories.length ? <CreateListingForm territories={territories} categories={categories} locations={locations} /> : <div className="setupNotice"><strong>Catalogue en cours d’initialisation.</strong><p>Les territoires et catégories doivent être chargés avant la première annonce.</p></div>}
    </main>
  );
}
