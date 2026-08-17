import SiteHeader from "@/components/SiteHeader";
import { categoryLabel, getDictionary, getLocale } from "@/lib/i18n";
import { archiveExpiredEvents } from "@/lib/listing-maintenance";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  await archiveExpiredEvents();
  const t = getDictionary(locale);
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const [territories, categories, recentListings] = await Promise.all([
    prisma.territory.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true, icon: true } }),
    prisma.listing.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 6, include: { territory: { select: { name: true } }, images: { orderBy: { position: "asc" }, take: 1 } } }),
  ]);

  return <main>
    <SiteHeader />
    <section className="hero"><div className="heroOverlay" /><div className="heroInner"><div className="heroCopy"><span className="eyebrow heroEyebrow">{t.home.eyebrow}</span><h1>{t.home.title1}<br />{t.home.title2}</h1><p>{t.home.intro}</p></div>
      <form className="searchCard" action="/recherche" method="get"><label><span>{t.home.searchWhat}</span><input name="q" placeholder={t.home.searchPlaceholder}/></label><label><span>{t.home.category}</span><select name="category" defaultValue=""><option value="">{t.home.allCategories}</option>{categories.map(c=><option value={c.id} key={c.id}>{c.icon} {categoryLabel(locale,c.slug,c.name)}</option>)}</select></label><label><span>{t.home.where}</span><select name="territory" defaultValue=""><option value="">{t.home.allIslands}</option>{territories.map(ti=><option value={ti.id} key={ti.id}>{ti.name}</option>)}</select></label><button className="searchButton" type="submit">{t.home.search}</button></form>
      <div className="trustBar"><span>🌴 <b>{t.home.local}</b><small>{t.home.localSub}</small></span><span>💬 <b>{t.home.chat}</b><small>{t.home.chatSub}</small></span><span>🛡️ <b>{t.home.moderation}</b><small>{t.home.moderationSub}</small></span><span>✨ <b>{t.home.easy}</b><small>{t.home.easySub}</small></span></div></div></section>
    <section className="sectionShell"><div className="sectionHeading"><div><span className="eyebrow">{t.home.explore}</span><h2>{t.home.popular}</h2></div><a href="/recherche">{t.home.allCategoriesLink}</a></div><div className="categoryGrid">{categories.map(c=><a className="categoryCard" href={`/recherche?category=${c.id}`} key={c.id}><span className="categoryIcon">{c.icon??"•"}</span><span>{categoryLabel(locale,c.slug,c.name)}</span></a>)}</div></section>
    <section className="sectionShell"><div className="sectionHeading"><div><span className="eyebrow">{t.home.recentEyebrow}</span><h2>{t.home.recent}</h2></div><a href="/recherche">{t.home.allListings}</a></div>{recentListings.length?<div className="listingGrid">{recentListings.map(l=><a className="listingCard" href={`/annonces/${l.slug}`} key={l.id}><div className="listingImage">{l.images[0]?<img src={l.images[0].url} alt={l.title}/>:<span>{t.home.noPhoto}</span>}</div><div className="listingBody"><h3>{l.title}</h3><strong>{l.price?new Intl.NumberFormat(dateLocale,{style:"currency",currency:l.currency}).format(Number(l.price)):t.home.onRequest}</strong><span>📍 {l.territory.name}</span><small>{l.publishedAt?new Intl.DateTimeFormat(dateLocale,{dateStyle:"medium"}).format(l.publishedAt):t.home.recentDate}</small></div></a>)}</div>:<div className="emptyStateCard"><span>🌴</span><h2>{t.home.emptyTitle}</h2><p>{t.home.emptyText}</p><a className="primaryButton" href="/deposer">{t.nav.deposit}</a></div>}</section>
    <section className="sellBanner"><div><span className="eyebrow">{t.home.sellEyebrow}</span><h2>{t.home.sellTitle}</h2><p>{t.home.sellText}</p></div><a className="lightButton" href="/deposer">{t.nav.deposit}</a></section>
    <footer><div className="brand"><span className="brandMark">AM</span><span>Antilles Market</span></div><p>{t.home.footer}</p><small>© 2026 Antilles Market. {locale==="fr"?"Tous droits réservés.":"All rights reserved."}</small></footer>
  </main>;
}
