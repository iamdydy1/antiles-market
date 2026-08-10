import { notFound } from "next/navigation";
import ContactSellerButton from "@/components/ContactSellerButton";
import { prisma } from "@/lib/prisma";

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      seller: { select: { displayName: true, createdAt: true } },
      territory: { select: { name: true } },
      category: { select: { name: true, icon: true } },
      images: { orderBy: { position: "asc" } },
    },
  });

  if (!listing || listing.status === "REMOVED") notFound();

  const price = listing.price
    ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: listing.currency, maximumFractionDigits: 2 }).format(Number(listing.price))
    : "Prix sur demande";

  return (
    <main className="listingDetailPage">
      <header className="accountTopbar">
        <a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a>
        <nav className="headerActions"><a className="ghostButton" href="/messages">Messages</a><a className="ghostButton" href="/compte">Mon compte</a><a className="primaryButton" href="/deposer">+ Déposer</a></nav>
      </header>

      <div className="listingBreadcrumb"><a href="/">Accueil</a><span>›</span><a href="#">{listing.category.name}</a><span>›</span><span>{listing.title}</span></div>

      <section className="listingDetailGrid">
        <div>
          <div className="listingGallery">
            {listing.images.length ? (
              <img src={listing.images[0].url} alt={listing.images[0].alt ?? listing.title} />
            ) : (
              <div className="galleryEmpty"><span>📷</span><strong>Aucune photo</strong><small>Le vendeur n’a pas ajouté de photo.</small></div>
            )}
          </div>

          <article className="listingDescriptionCard">
            <span className="eyebrow">Description</span>
            <h2>À propos de cette annonce</h2>
            <p>{listing.description}</p>
          </article>
        </div>

        <aside className="listingAside">
          <article className="listingInfoCard">
            <span className="listingCategory">{listing.category.icon} {listing.category.name}</span>
            <h1>{listing.title}</h1>
            <strong className="listingPrice">{price}</strong>
            <div className="listingMeta"><span>📍 {listing.territory.name}</span><span>🕒 {listing.publishedAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(listing.publishedAt) : "Brouillon"}</span></div>
            <ContactSellerButton listingId={listing.id} />
            <button className="favoriteDetailButton" type="button">♡ Ajouter aux favoris</button>
          </article>

          <article className="sellerCard">
            <div className="sellerAvatar">{listing.seller.displayName.charAt(0).toUpperCase()}</div>
            <div><small>Vendeur</small><strong>{listing.seller.displayName}</strong><span>Membre depuis {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(listing.seller.createdAt)}</span></div>
            <a href="#">Voir le profil →</a>
          </article>

          <button className="reportButton" type="button">⚑ Signaler l’annonce</button>
        </aside>
      </section>
    </main>
  );
}
