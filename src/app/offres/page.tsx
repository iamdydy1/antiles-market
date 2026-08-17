import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OfferActions from "@/components/OfferActions";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const t = getDictionary(locale);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");
  const now = new Date();
  await prisma.offer.updateMany({ where: { status: "PENDING", expiresAt: { lt: now }, OR: [{ buyerId: session.userId }, { sellerId: session.userId }] }, data: { status: "EXPIRED", respondedAt: now } });
  const offers = await prisma.offer.findMany({ where: { OR: [{ buyerId: session.userId }, { sellerId: session.userId }] }, orderBy: { createdAt: "desc" }, include: { listing: { select: { title: true, slug: true, price: true, currency: true, status: true, images: { orderBy: { position: "asc" }, take: 1 } } }, buyer: { select: { id: true, displayName: true } }, seller: { select: { id: true, displayName: true } }, madeBy: { select: { id: true, displayName: true } } } });
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  return <main className="accountPage"><SiteHeader /><section className="accountHero"><div><span className="eyebrow">{t.offers.negotiation}</span><h1>{t.offers.title}</h1><p>{t.offers.intro}</p></div></section><section className="offersPage">{offers.length===0?<div className="emptyStateCard"><span>💶</span><h2>{t.offers.emptyTitle}</h2><p>{t.offers.emptyText}</p><a className="primaryButton" href="/recherche">{t.offers.browse}</a></div>:<div className="offersList">{offers.map(offer=>{const isPending=offer.status==="PENDING"&&offer.expiresAt>now;const recipientId=offer.madeById===offer.buyerId?offer.sellerId:offer.buyerId;const canRespond=isPending&&recipientId===session.userId;const canWithdraw=isPending&&offer.madeById===session.userId;const isBuyer=offer.buyerId===session.userId;const amount=new Intl.NumberFormat(dateLocale,{style:"currency",currency:offer.currency}).format(Number(offer.amount));const listingPrice=offer.listing.price?new Intl.NumberFormat(dateLocale,{style:"currency",currency:offer.listing.currency}).format(Number(offer.listing.price)):null;const statusLabel=t.offers.statuses[offer.status as keyof typeof t.offers.statuses]??offer.status;return <article className="offerCard" key={offer.id}><a className="offerListing" href={`/annonces/${offer.listing.slug}`}><div className="offerThumb">{offer.listing.images[0]?<img src={offer.listing.images[0].url} alt={offer.listing.title}/>:<span>📷</span>}</div><div><small>{isBuyer?t.offers.yourOffer:t.offers.received}</small><h2>{offer.listing.title}</h2>{listingPrice&&<span>{t.offers.displayedPrice}: {listingPrice}</span>}</div></a><div className="offerDetails"><strong>{amount}</strong><span className={`offerStatus offerStatus-${offer.status.toLowerCase()}`}>{statusLabel}</span><p>{offer.madeById===session.userId?t.offers.proposedByYou:`${t.offers.proposedBy} ${offer.madeBy.displayName}`}</p>{offer.message&&<blockquote>{offer.message}</blockquote>}<small>{t.offers.expires} {new Intl.DateTimeFormat(dateLocale,{dateStyle:"medium",timeStyle:"short"}).format(offer.expiresAt)}</small></div>{isPending&&<OfferActions offerId={offer.id} canRespond={canRespond} canWithdraw={canWithdraw} currency={offer.currency} locale={locale}/>}</article>})}</div>}</section></main>;
}
