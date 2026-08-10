import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/connexion");

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
      <header className="accountTopbar">
        <a className="brand" href="/"><span className="brandMark">AM</span><span>Antilles Market</span></a>
        <nav className="headerActions"><a className="ghostButton" href="/compte">Mon compte</a><a className="primaryButton" href="/deposer">+ Déposer</a></nav>
      </header>

      <section className="messagesShell">
        <div className="messagesHeader"><span className="eyebrow">Messagerie</span><h1>Vos conversations</h1><p>Discutez directement avec les acheteurs et vendeurs.</p></div>
        <div className="conversationList">
          {conversations.length === 0 && <div className="emptyConversationList"><span>💬</span><strong>Aucune conversation pour le moment</strong><p>Quand vous contacterez un vendeur, la conversation apparaîtra ici.</p></div>}
          {conversations.map((conversation) => {
            const other = conversation.participants.find((participant) => participant.userId !== session.userId)?.user;
            const last = conversation.messages[0];
            return (
              <a className="conversationCard" href={`/messages/${conversation.id}`} key={conversation.id}>
                <div className="conversationThumb">{conversation.listing.images[0] ? <img src={conversation.listing.images[0].url} alt="" /> : "📦"}</div>
                <div className="conversationMain"><div><strong>{other?.displayName ?? "Utilisateur"}</strong><span>{conversation.listing.title}</span></div><p>{last ? `${last.senderId === session.userId ? "Vous : " : ""}${last.body}` : "Nouvelle conversation"}</p></div>
                <time>{last ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(last.createdAt) : ""}</time>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
