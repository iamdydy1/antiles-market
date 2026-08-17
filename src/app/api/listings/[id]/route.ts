import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const httpUrl = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
});

const updateSchema = z.object({
  title: z.string().trim().min(5).max(120).optional(),
  description: z.string().trim().min(20).max(5000).optional(),
  price: z.union([z.string(), z.number()]).optional(),
  categoryId: z.string().min(1).optional(),
  territoryId: z.string().min(1).optional(),
  locationId: z.union([z.string(), z.null()]).optional(),
  vehicleMileage: z.union([z.string(), z.number(), z.null()]).optional(),
  eventStartAt: z.union([z.string(), z.null()]).optional(),
  eventEndAt: z.union([z.string(), z.null()]).optional(),
  eventVenue: z.union([z.string().trim().max(160), z.null()]).optional(),
  eventOrganizer: z.union([z.string().trim().max(120), z.null()]).optional(),
  eventUrl: z.union([httpUrl, z.literal(""), z.null()]).optional(),
  eventCapacity: z.union([z.string(), z.number(), z.null()]).optional(),
  eventIsFree: z.boolean().optional(),
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
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, categoryId: true, territoryId: true, eventStartAt: true, eventEndAt: true },
    });
    if (!listing) return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    if (listing.sellerId !== userId) return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });

    const input = updateSchema.parse(await request.json());
    const data: Record<string, unknown> = {};
    const targetCategoryId = input.categoryId ?? listing.categoryId;
    const targetTerritoryId = input.territoryId ?? listing.territoryId;

    const [category, territory] = await Promise.all([
      prisma.category.findFirst({ where: { id: targetCategoryId, isActive: true }, select: { id: true, slug: true, parent: { select: { slug: true } } } }),
      prisma.territory.findFirst({ where: { id: targetTerritoryId, isActive: true }, select: { id: true, currency: true } }),
    ]);
    if (!category) return NextResponse.json({ error: "Catégorie invalide." }, { status: 400 });
    if (!territory) return NextResponse.json({ error: "Territoire invalide." }, { status: 400 });

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;
    if (input.categoryId !== undefined) data.categoryId = category.id;
    if (input.territoryId !== undefined) {
      data.territoryId = territory.id;
      data.currency = territory.currency;
      if (input.locationId === undefined) data.locationId = null;
    }

    if (input.locationId !== undefined) {
      if (!input.locationId) data.locationId = null;
      else {
        const location = await prisma.location.findFirst({ where: { id: input.locationId, territoryId: territory.id }, select: { id: true } });
        if (!location) return NextResponse.json({ error: "Ville ou commune invalide." }, { status: 400 });
        data.locationId = location.id;
      }
    }

    const isVehicle = category.slug.startsWith("vehicules") || category.parent?.slug === "vehicules";
    if (!isVehicle && input.categoryId !== undefined) data.vehicleMileage = null;
    if (isVehicle && input.vehicleMileage !== undefined) {
      if (input.vehicleMileage === null || String(input.vehicleMileage).trim() === "") data.vehicleMileage = null;
      else {
        const mileage = Number(input.vehicleMileage);
        if (!Number.isInteger(mileage) || mileage < 0 || mileage > 5000000) return NextResponse.json({ error: "Kilométrage invalide." }, { status: 400 });
        data.vehicleMileage = mileage;
      }
    }

    const isEvent = category.slug.startsWith("evenements-sorties") || category.parent?.slug === "evenements-sorties";
    if (!isEvent && input.categoryId !== undefined) {
      data.eventStartAt = null;
      data.eventEndAt = null;
      data.eventVenue = null;
      data.eventOrganizer = null;
      data.eventUrl = null;
      data.eventCapacity = null;
      data.eventIsFree = false;
    }

    if (isEvent) {
      const startValue = input.eventStartAt === undefined ? listing.eventStartAt : input.eventStartAt ? new Date(input.eventStartAt) : null;
      const endValue = input.eventEndAt === undefined ? listing.eventEndAt : input.eventEndAt ? new Date(input.eventEndAt) : null;
      if (!startValue || !endValue || Number.isNaN(startValue.getTime()) || Number.isNaN(endValue.getTime()) || endValue <= startValue) {
        return NextResponse.json({ error: "La date de fin doit être après la date de début." }, { status: 400 });
      }
      if (input.eventStartAt !== undefined) data.eventStartAt = startValue;
      if (input.eventEndAt !== undefined) data.eventEndAt = endValue;
      if (input.eventVenue !== undefined) data.eventVenue = input.eventVenue || null;
      if (input.eventOrganizer !== undefined) data.eventOrganizer = input.eventOrganizer || null;
      if (input.eventUrl !== undefined) data.eventUrl = input.eventUrl || null;
      if (input.eventCapacity !== undefined) {
        if (input.eventCapacity === null || String(input.eventCapacity).trim() === "") data.eventCapacity = null;
        else {
          const capacity = Number(input.eventCapacity);
          if (!Number.isInteger(capacity) || capacity < 1) return NextResponse.json({ error: "Capacité invalide." }, { status: 400 });
          data.eventCapacity = capacity;
        }
      }
      if (input.eventIsFree !== undefined) data.eventIsFree = input.eventIsFree;
    }

    if (input.price !== undefined) {
      const numericPrice = Number(String(input.price).replace(",", "."));
      if (!Number.isFinite(numericPrice) || numericPrice < 0 || numericPrice > 999999999) return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
      data.price = numericPrice;
    }
    if (isEvent && input.eventIsFree) data.price = 0;

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
