import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ listingId: z.string().min(1) });

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  try {
    const { listingId } = schema.parse(await request.json());
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, sellerId: true, status: true } });
    if (!listing || listing.status === "REMOVED") return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    if (listing.sellerId === session.userId) return NextResponse.json({ error: "Vous ne pouvez pas vous contacter vous-même." }, { status: 400 });

    const existing = await prisma.conversation.findFirst({
      where: {
        listingId: listing.id,
        participants: { every: { userId: { in: [session.userId, listing.sellerId] } } },
        AND: [
          { participants: { some: { userId: session.userId } } },
          { participants: { some: { userId: listing.sellerId } } },
        ],
      },
      select: { id: true },
    });

    if (existing) return NextResponse.json({ conversationId: existing.id });

    const conversation = await prisma.conversation.create({
      data: {
        listingId: listing.id,
        participants: { create: [{ userId: session.userId }, { userId: listing.sellerId }] },
      },
      select: { id: true },
    });

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Annonce invalide." }, { status: 400 });
    console.error("conversation create error", error);
    return NextResponse.json({ error: "Impossible d’ouvrir la conversation." }, { status: 500 });
  }
}
