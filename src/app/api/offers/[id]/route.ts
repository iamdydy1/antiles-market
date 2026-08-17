import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  action: z.enum(["accept", "reject", "counter", "withdraw"]),
  amount: z.union([z.string(), z.number()]).optional(),
  message: z.string().trim().max(500).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  try {
    const { id } = await params;
    const input = actionSchema.parse(await request.json());
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { listing: { select: { id: true, status: true } } },
    });
    if (!offer) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });

    if (offer.status === "PENDING" && offer.expiresAt <= new Date()) {
      await prisma.offer.update({ where: { id }, data: { status: "EXPIRED", respondedAt: new Date() } });
      return NextResponse.json({ error: "Cette offre a expiré." }, { status: 410 });
    }
    if (offer.status !== "PENDING") return NextResponse.json({ error: "Cette offre n’est plus en attente." }, { status: 409 });

    const recipientId = offer.madeById === offer.buyerId ? offer.sellerId : offer.buyerId;
    if (input.action === "withdraw") {
      if (session.userId !== offer.madeById) return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });
      await prisma.offer.update({ where: { id }, data: { status: "WITHDRAWN", respondedAt: new Date() } });
      return NextResponse.json({ ok: true, status: "WITHDRAWN" });
    }
    if (session.userId !== recipientId) return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });

    if (input.action === "reject") {
      await prisma.offer.update({ where: { id }, data: { status: "REJECTED", respondedAt: new Date() } });
      return NextResponse.json({ ok: true, status: "REJECTED" });
    }

    if (input.action === "accept") {
      await prisma.$transaction([
        prisma.offer.update({ where: { id }, data: { status: "ACCEPTED", respondedAt: new Date() } }),
        prisma.listing.update({ where: { id: offer.listingId }, data: { status: "RESERVED" } }),
        prisma.offer.updateMany({ where: { listingId: offer.listingId, id: { not: id }, status: "PENDING" }, data: { status: "REJECTED", respondedAt: new Date() } }),
      ]);
      return NextResponse.json({ ok: true, status: "ACCEPTED" });
    }

    const amount = Number(String(input.amount ?? "").replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999) {
      return NextResponse.json({ error: "Montant de contre-offre invalide." }, { status: 400 });
    }

    const counter = await prisma.$transaction(async (tx) => {
      await tx.offer.update({ where: { id }, data: { status: "COUNTERED", respondedAt: new Date() } });
      return tx.offer.create({
        data: {
          listingId: offer.listingId,
          buyerId: offer.buyerId,
          sellerId: offer.sellerId,
          madeById: session.userId,
          amount,
          currency: offer.currency,
          message: input.message || null,
          parentOfferId: offer.id,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
        select: { id: true, status: true, expiresAt: true },
      });
    });

    return NextResponse.json({ ok: true, status: "COUNTERED", counterOffer: counter });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Action invalide." }, { status: 400 });
    console.error("offer action error", error);
    return NextResponse.json({ error: "Impossible de traiter cette offre." }, { status: 500 });
  }
}
