import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSessionUserId() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  return session?.userId ?? null;
}

export async function POST(_: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { listingId } = await params;

  const listing = await prisma.listing.findFirst({ where: { id: listingId, status: "PUBLISHED" }, select: { id: true, sellerId: true } });
  if (!listing) return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
  if (listing.sellerId === userId) return NextResponse.json({ error: "Vous ne pouvez pas ajouter votre propre annonce aux favoris." }, { status: 400 });

  await prisma.favorite.upsert({ where: { userId_listingId: { userId, listingId } }, update: {}, create: { userId, listingId } });
  return NextResponse.json({ favorited: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { listingId } = await params;
  await prisma.favorite.deleteMany({ where: { userId, listingId } });
  return NextResponse.json({ favorited: false });
}
