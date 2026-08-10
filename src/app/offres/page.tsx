import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OfferActions from "@/components/OfferActions";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  COUNTERED: "Contre-offre envoyée",
  WITHDRAWN: "Retirée",
  EXPIRED: "Expirée",
};

export default async function OffersPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const now = new Date();
  await prisma.offer.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
      OR: [{ buyerId: session.userId }, { sellerId: session.userId }],
    },
    data: { status: "EXPIRED", respondedAt: now },
  });

  const offers = await prisma.offer.findMany({
    where: { OR: [{ buyerId: session.userId }, { sellerId: session.userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { title: true, slug: true, price: true, currency: true, status: true, images: { orderBy: { position: "asc" }, take: 1 } } },
      buyer: { select: { id: true, displayName: true } },
      seller: { select: { id: true, displayName: true } },
      madeBy: { select: { id: true, displayName: true } },
    },
  });

  return <main className="accountPage">
    <SiteHeader />
    <section className="accountHero"><div><span className="eyebrow">Négociation</span><h1>Mes offres</h1><p>Suivez les propositions envoyées et reçues sur vos annonces.</p></div></section>
    <section className="offersPage">
      {offers.length === 0 ? <div className="emptyStateCard"><span>💶</span><h2>Aucune offre pour le moment</h2><p>Depuis une annonce, utilisez « Faire une offre » pour proposer un prix au vendeur.</p><a className="primaryButton" href="/recherche">Voir les annonces</a></div> : <div className="offersList">
        {offers.map((offer) => {
          const isPending = offer.status === "PENDING" && offer.expiresAt > now;
          const recipientId = offer.madeById === offer.buyerId ? offer.sellerId : offer.buyerId;
          const canRespond = isPending && recipientId === session.userId;
          const canWithdraw = isPending && offer.madeById === session.userId;
          const isBuyer = offer.buyerId === session.userId;
          const amount = new Intl.NumberFormat("fr-FR", { style: "currency", currency: offer.currency }).format(Number(offer.amount));
          const listingPrice = offer.listing.price ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: offer.listing.currency }).format(Number(offer.listing.price)) : null;
          return <article className="offerCard" key={offer.id}>
            <a className="offerListing" href={`/annonces/${offer.listing.slug}`}>
              <div className="offerThumb">{offer.listing.images[0] ? <img src={offer.listing.images[0].url} alt={offer.listing.title} /> : <span>📷</span>}</div>
              <div><small>{isBuyer ? "Votre offre" : "Offre reçue"}</small><h2>{offer.listing.title}</h2>{listingPrice && <span>Prix affiché : {listingPrice}</span>}</div>
            </a>
            <div className="offerDetails"><strong>{amount}</strong><span className={`offerStatus offerStatus-${offer.status.toLowerCase()}`}>{labels[offer.status] ?? offer.status}</span><p>{offer.madeById === session.userId ? "Proposée par vous" : `Proposée par ${offer.madeBy.displayName}`}</p>{offer.message && <blockquote>{offer.message}</blockquote>}<small>Expire le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(offer.expiresAt)}</small></div>
            {isPending && <OfferActions offerId={offer.id} canRespond={canRespond} canWithdraw={canWithdraw} currency={offer.currency} />}
          </article>;
        })}
      </div>}
    </section>
  </main>;
}
