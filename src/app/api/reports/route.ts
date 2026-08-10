import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  listingId: z.string().min(1),
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const input = schema.parse(await request.json());
    const listing = await prisma.listing.findUnique({ where: { id: input.listingId }, select: { id: true, sellerId: true } });
    if (!listing) return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    if (listing.sellerId === session.userId) return NextResponse.json({ error: "Vous ne pouvez pas signaler votre propre annonce." }, { status: 400 });

    const report = await prisma.report.create({
      data: { listingId: listing.id, authorId: session.userId, reason: input.reason, details: input.details || null },
      select: { id: true, status: true, createdAt: true },
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Signalement invalide." }, { status: 400 });
    console.error("report creation error", error);
    return NextResponse.json({ error: "Impossible d’envoyer le signalement." }, { status: 500 });
  }
}
