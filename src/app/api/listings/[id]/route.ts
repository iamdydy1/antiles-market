import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().trim().min(5).max(120).optional(),
  description: z.string().trim().min(20).max(5000).optional(),
  price: z.union([z.string(), z.number()]).optional(),
  categoryId: z.string().min(1).optional(),
  territoryId: z.string().min(1).optional(),
  status: z.enum(["PUBLISHED", "RESERVED", "SOLD", "ARCHIVED"]).optional(),
});

async function getSessionUser() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  return session?.userId ?? null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUser();
    if (!userId) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id }, select: { sellerId: true } });
    if (!listing) return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    if (listing.sellerId !== userId) return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });

    const input = updateSchema.parse(await request.json());
    const data: Record<string, unknown> = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;
    if (input.categoryId !== undefined) {
      const category = await prisma.category.findFirst({ where: { id: input.categoryId, isActive: true }, select: { id: true } });
      if (!category) return NextResponse.json({ error: "Catégorie invalide." }, { status: 400 });
      data.categoryId = category.id;
    }
    if (input.territoryId !== undefined) {
      const territory = await prisma.territory.findFirst({ where: { id: input.territoryId, isActive: true }, select: { id: true, currency: true } });
      if (!territory) return NextResponse.json({ error: "Territoire invalide." }, { status: 400 });
      data.territoryId = territory.id;
      data.currency = territory.currency;
    }
    if (input.price !== undefined) {
      const numericPrice = Number(String(input.price).replace(",", "."));
      if (!Number.isFinite(numericPrice) || numericPrice < 0 || numericPrice > 999999999) {
        return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
      }
      data.price = numericPrice;
    }

    const updated = await prisma.listing.update({ where: { id }, data, select: { id: true, slug: true, status: true, title: true } });
    return NextResponse.json({ listing: updated });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    console.error("listing update error", error);
    return NextResponse.json({ error: "Impossible de modifier l’annonce." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, select: { sellerId: true } });
  if (!listing) return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
  if (listing.sellerId !== userId) return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });

  await prisma.listing.update({ where: { id }, data: { status: "REMOVED" } });
  return NextResponse.json({ ok: true });
}
