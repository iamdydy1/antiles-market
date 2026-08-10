"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { displayName: string };
};

export default function ChatWindow({ conversationId, currentUserId, initialMessages }: { conversationId: string; currentUserId: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages((current) => [...current, data.message]);
        setBody("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="chatPanel">
      <div className="chatMessages">
        {messages.length === 0 && <div className="emptyChat"><span>💬</span><strong>Démarrez la conversation</strong><p>Posez une question au vendeur à propos de cette annonce.</p></div>}
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return <div className={`chatBubbleRow ${mine ? "mine" : "theirs"}`} key={message.id}><div className="chatBubble"><small>{mine ? "Vous" : message.sender.displayName}</small><p>{message.body}</p><time>{new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time></div></div>;
        })}
        <div ref={endRef} />
      </div>
      <form className="chatComposer" onSubmit={send}>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="Écrivez votre message…" rows={2} />
        <button type="submit" disabled={sending || !body.trim()}>{sending ? "…" : "Envoyer"}</button>
      </form>
    </section>
  );
}
