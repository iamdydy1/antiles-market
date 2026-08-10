import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createListingSchema = z.object({ title: z.string().trim().min(5).max(120), description: z.string().trim().min(20).max(5000), price: z.union([z.string(), z.number()]).transform((value) => String(value).trim()), territoryId: z.string().min(1), locationId: z.string().optional(), categoryId: z.string().min(1) });
function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70); }

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies(); const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value); if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, isBanned: true } }); if (!user || user.isBanned) return NextResponse.json({ error: "Compte indisponible." }, { status: 403 });
    const input = createListingSchema.parse(await request.json()); const numericPrice = Number(input.price.replace(",", ".")); if (!Number.isFinite(numericPrice) || numericPrice < 0 || numericPrice > 999999999) return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
    const [territory, category, location] = await Promise.all([
      prisma.territory.findFirst({ where: { id: input.territoryId, isActive: true }, select: { id: true, currency: true } }),
      prisma.category.findFirst({ where: { id: input.categoryId, isActive: true }, select: { id: true } }),
      input.locationId ? prisma.location.findFirst({ where: { id: input.locationId, territoryId: input.territoryId }, select: { id: true } }) : Promise.resolve(null),
    ]);
    if (!territory || !category || (input.locationId && !location)) return NextResponse.json({ error: "Île, ville ou catégorie invalide." }, { status: 400 });
    const listing = await prisma.listing.create({ data: { title: input.title, slug: `${slugify(input.title)}-${crypto.randomUUID().slice(0, 8)}`, description: input.description, price: numericPrice, currency: territory.currency, status: "PUBLISHED", publishedAt: new Date(), sellerId: user.id, territoryId: territory.id, locationId: location?.id, categoryId: category.id }, select: { id: true, slug: true, title: true, status: true } });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: "Vérifiez les informations de votre annonce." }, { status: 400 }); console.error("listing creation error", error); return NextResponse.json({ error: "Impossible de publier l’annonce." }, { status: 500 }); }
}
