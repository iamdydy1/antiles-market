import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const copy = locale === "fr" ? {
    eyebrow: "Messagerie",
    title: "Vos conversations",
    intro: "Discutez directement avec les acheteurs et vendeurs.",
    emptyTitle: "Aucune conversation pour le moment",
    emptyText: "Quand vous contacterez un vendeur, la conversation apparaîtra ici.",
    user: "Utilisateur",
    youPrefix: "Vous : ",
    newConversation: "Nouvelle conversation",
  } : {
    eyebrow: "Messages",
    title: "Your conversations",
    intro: "Chat directly with buyers and sellers.",
    emptyTitle: "No conversations yet",
    emptyText: "When you contact a seller, the conversation will appear here.",
    user: "User",
    youPrefix: "You: ",
    newConversation: "New conversation",
  };

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.userId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: { select: { title: true, slug: true, price: true, currency: true, images: { take: 1, orderBy: { position: "asc" } } } },
      participants: { include: { user: { select: { id: true, displayName: true } } } },
      messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true, senderId: true } },
    },
  });

  return (
    <main className="messagesPage">
      <SiteHeader />
      <section className="messagesShell">
        <div className="messagesHeader"><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div>
        <div className="conversationList">
          {conversations.length === 0 && <div className="emptyConversationList"><span>💬</span><strong>{copy.emptyTitle}</strong><p>{copy.emptyText}</p></div>}
          {conversations.map((conversation) => {
            const other = conversation.participants.find((participant) => participant.userId !== session.userId)?.user;
            const last = conversation.messages[0];
            return (
              <a className="conversationCard" href={`/messages/${conversation.id}`} key={conversation.id}>
                <div className="conversationThumb">{conversation.listing.images[0] ? <img src={conversation.listing.images[0].url} alt="" /> : "📦"}</div>
                <div className="conversationMain"><div><strong>{other?.displayName ?? copy.user}</strong><span>{conversation.listing.title}</span></div><p>{last ? `${last.senderId === session.userId ? copy.youPrefix : ""}${last.body}` : copy.newConversation}</p></div>
                <time>{last ? new Intl.DateTimeFormat(dateLocale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(last.createdAt) : ""}</time>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
