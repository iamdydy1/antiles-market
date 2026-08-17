"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { displayName: string };
};

export default function ChatWindow({ conversationId, currentUserId, initialMessages, locale }: { conversationId: string; currentUserId: string; initialMessages: Message[]; locale: Locale }) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const copy = locale === "fr"
    ? { start: "Démarrez la conversation", startText: "Posez une question au vendeur à propos de cette annonce.", you: "Vous", placeholder: "Écrivez votre message…", send: "Envoyer" }
    : { start: "Start the conversation", startText: "Ask the seller a question about this listing.", you: "You", placeholder: "Write your message…", send: "Send" };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    let cancelled = false;
    async function refreshMessages() {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setMessages(data.messages);
      } catch (error) {
        console.debug("message refresh skipped", error);
      }
    }
    const timer = window.setInterval(refreshMessages, 3500);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [conversationId]);

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
        {messages.length === 0 && <div className="emptyChat"><span>💬</span><strong>{copy.start}</strong><p>{copy.startText}</p></div>}
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return <div className={`chatBubbleRow ${mine ? "mine" : "theirs"}`} key={message.id}><div className="chatBubble"><small>{mine ? copy.you : message.sender.displayName}</small><p>{message.body}</p><time>{new Intl.DateTimeFormat(dateLocale, { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time></div></div>;
        })}
        <div ref={endRef} />
      </div>
      <form className="chatComposer" onSubmit={send}>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder={copy.placeholder} rows={2} />
        <button type="submit" disabled={sending || !body.trim()}>{sending ? "…" : copy.send}</button>
      </form>
    </section>
  );
}
