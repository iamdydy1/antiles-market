import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion?next=/favoris");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          territory: { select: { name: true } },
          category: { select: { name: true, icon: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
  });

  return (
    <main className="accountPage">
      <header className="accountTopbar"><a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a><nav className="headerActions"><a className="ghostButton" href="/compte">Mon compte</a><a className="primaryButton" href="/deposer">+ Déposer</a></nav></header>
      <section className="savedPageShell">
        <div className="savedPageHead"><div><span className="eyebrow">Votre sélection</span><h1>Mes favoris</h1><p>Retrouvez rapidement les annonces que vous avez sauvegardées.</p></div><strong>{favorites.length}</strong></div>
        {favorites.length === 0 ? <div className="emptyStateCard"><span>♡</span><h2>Aucun favori pour le moment</h2><p>Explorez les annonces et ajoutez celles qui vous intéressent.</p><a className="primaryButton" href="/recherche">Découvrir les annonces</a></div> : (
          <div className="resultsGrid">
            {favorites.map(({ listing }) => <a className="resultCard" href={`/annonces/${listing.slug}`} key={listing.id}><div className="resultImage">{listing.images[0] ? <img src={listing.images[0].url} alt={listing.title} /> : <span>📷</span>}</div><div className="resultBody"><small>{listing.category.icon} {listing.category.name}</small><h2>{listing.title}</h2><strong>{listing.price ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: listing.currency }).format(Number(listing.price)) : "Prix sur demande"}</strong><span>📍 {listing.territory.name}</span></div></a>)}
          </div>
        )}
      </section>
    </main>
  );
}
