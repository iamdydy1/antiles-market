import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const { id } = await params;
  const conversation = await prisma.conversation.findFirst({
    where: { id, participants: { some: { userId: session.userId } } },
    include: {
      listing: { select: { title: true, slug: true, price: true, currency: true, images: { take: 1, orderBy: { position: "asc" } } } },
      participants: { include: { user: { select: { id: true, displayName: true } } } },
      messages: { where: { isDeleted: false }, orderBy: { createdAt: "asc" }, take: 200, select: { id: true, body: true, createdAt: true, senderId: true, sender: { select: { displayName: true } } } },
    },
  });

  if (!conversation) notFound();
  const other = conversation.participants.find((participant) => participant.userId !== session.userId)?.user;
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: id, userId: session.userId } },
    data: { lastReadAt: new Date() },
  });

  const messages = conversation.messages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString() }));
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const price = conversation.listing.price ? new Intl.NumberFormat(dateLocale, { style: "currency", currency: conversation.listing.currency }).format(Number(conversation.listing.price)) : (locale === "fr" ? "Prix sur demande" : "Price on request");
  const copy = locale === "fr"
    ? { listing: "Annonce", viewListing: "Voir l’annonce →", conversationWith: "Conversation avec", user: "Utilisateur" }
    : { listing: "Listing", viewListing: "View listing →", conversationWith: "Conversation with", user: "User" };

  return (
    <main className="messagesPage">
      <SiteHeader />
      <section className="conversationShell">
        <aside className="chatListingCard">
          <div className="chatListingImage">{conversation.listing.images[0] ? <img src={conversation.listing.images[0].url} alt="" /> : "📦"}</div>
          <span className="eyebrow">{copy.listing}</span>
          <h2>{conversation.listing.title}</h2>
          <strong>{price}</strong>
          <a href={`/annonces/${conversation.listing.slug}`}>{copy.viewListing}</a>
        </aside>
        <div className="conversationMainPanel">
          <header className="chatHeader"><div className="sellerAvatar">{other?.displayName.charAt(0).toUpperCase() ?? "?"}</div><div><small>{copy.conversationWith}</small><strong>{other?.displayName ?? copy.user}</strong></div></header>
          <ChatWindow conversationId={conversation.id} currentUserId={session.userId} initialMessages={messages} locale={locale} />
        </div>
      </section>
    </main>
  );
}
