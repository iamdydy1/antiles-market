import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({ body: z.string().trim().min(1).max(4000) });

async function getMembership(conversationId: string, userId: string) {
  return prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { conversationId: true },
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const { id } = await params;
  if (!(await getMembership(id, session.userId))) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id, isDeleted: false },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, body: true, createdAt: true, senderId: true, sender: { select: { displayName: true } } },
  });

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: id, userId: session.userId } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ messages, currentUserId: session.userId });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  try {
    const { id } = await params;
    if (!(await getMembership(id, session.userId))) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
    const input = messageSchema.parse(await request.json());

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: { conversationId: id, senderId: session.userId, body: input.body },
        select: { id: true, body: true, createdAt: true, senderId: true, sender: { select: { displayName: true } } },
      });
      await tx.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
      await tx.conversationParticipant.update({
        where: { conversationId_userId: { conversationId: id, userId: session.userId } },
        data: { lastReadAt: new Date() },
      });
      return created;
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Message invalide." }, { status: 400 });
    console.error("message send error", error);
    return NextResponse.json({ error: "Impossible d’envoyer le message." }, { status: 500 });
  }
}
