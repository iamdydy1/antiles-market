import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  listingId: z.string().min(1),
  amount: z.union([z.string(), z.number()]),
  message: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  try {
    const input = schema.parse(await request.json());
    const amount = Number(String(input.amount).replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999) {
      return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: input.listingId },
      select: { id: true, sellerId: true, currency: true, status: true },
    });
    if (!listing || ["REMOVED", "ARCHIVED", "SOLD"].includes(listing.status)) {
      return NextResponse.json({ error: "Cette annonce n’accepte plus d’offres." }, { status: 404 });
    }
    if (listing.sellerId === session.userId) {
      return NextResponse.json({ error: "Vous ne pouvez pas faire une offre sur votre propre annonce." }, { status: 400 });
    }

    const now = new Date();
    await prisma.offer.updateMany({
      where: { buyerId: session.userId, listingId: listing.id, status: "PENDING", expiresAt: { lt: now } },
      data: { status: "EXPIRED", respondedAt: now },
    });

    const existing = await prisma.offer.findFirst({
      where: { buyerId: session.userId, listingId: listing.id, status: "PENDING", expiresAt: { gt: now } },
      select: { id: true },
    });
    if (existing) return NextResponse.json({ error: "Vous avez déjà une offre en attente sur cette annonce." }, { status: 409 });

    const offer = await prisma.offer.create({
      data: {
        listingId: listing.id,
        buyerId: session.userId,
        sellerId: listing.sellerId,
        madeById: session.userId,
        amount,
        currency: listing.currency,
        message: input.message || null,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
      select: { id: true, status: true, expiresAt: true },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Offre invalide." }, { status: 400 });
    console.error("offer create error", error);
    return NextResponse.json({ error: "Impossible d’envoyer l’offre." }, { status: 500 });
  }
}
