import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

async function getOwnedListing(id: string) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return { error: NextResponse.json({ error: "Connexion requise." }, { status: 401 }) } as const;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, sellerId: true, _count: { select: { images: true } } },
  });
  if (!listing || listing.sellerId !== session.userId) return { error: NextResponse.json({ error: "Annonce introuvable." }, { status: 404 }) } as const;
  return { listing } as const;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const owned = await getOwnedListing(id);
    if ("error" in owned) return owned.error;
    const { listing } = owned;

    const formData = await request.formData();
    const files = formData.getAll("photos").filter((value): value is File => value instanceof File);
    if (!files.length) return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
    if (listing._count.images + files.length > 8) return NextResponse.json({ error: "8 photos maximum par annonce." }, { status: 400 });

    const uploadDir = process.env.UPLOAD_DIR ?? "/app/uploads";
    await mkdir(uploadDir, { recursive: true });
    const created = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension = ALLOWED_TYPES.get(file.type);
      if (!extension) return NextResponse.json({ error: "Format accepté : JPG, PNG ou WebP." }, { status: 400 });
      if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Chaque photo doit faire moins de 10 Mo." }, { status: 400 });

      const filename = `${crypto.randomUUID()}.${extension}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), bytes, { flag: "wx" });

      const image = await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: `/api/uploads/${filename}`,
          alt: "Photo de l’annonce",
          position: listing._count.images + index,
        },
        select: { id: true, url: true, position: true },
      });
      created.push(image);
    }

    return NextResponse.json({ images: created }, { status: 201 });
  } catch (error) {
    console.error("image upload error", error);
    return NextResponse.json({ error: "Impossible d’enregistrer les photos." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const owned = await getOwnedListing(id);
    if ("error" in owned) return owned.error;
    const body = await request.json() as { imageIds?: unknown };
    if (!Array.isArray(body.imageIds) || body.imageIds.some((value) => typeof value !== "string")) {
      return NextResponse.json({ error: "Ordre des photos invalide." }, { status: 400 });
    }

    const existing = await prisma.listingImage.findMany({ where: { listingId: id }, orderBy: { position: "asc" }, select: { id: true } });
    const existingIds = new Set(existing.map((image) => image.id));
    const requestedIds = body.imageIds as string[];
    if (requestedIds.length !== existing.length || new Set(requestedIds).size !== requestedIds.length || requestedIds.some((imageId) => !existingIds.has(imageId))) {
      return NextResponse.json({ error: "La liste des photos ne correspond pas à l’annonce." }, { status: 400 });
    }

    await prisma.$transaction(requestedIds.map((imageId, position) => prisma.listingImage.update({ where: { id: imageId }, data: { position } })));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("image reorder error", error);
    return NextResponse.json({ error: "Impossible de réorganiser les photos." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const owned = await getOwnedListing(id);
    if ("error" in owned) return owned.error;
    const body = await request.json() as { imageId?: unknown };
    if (typeof body.imageId !== "string") return NextResponse.json({ error: "Photo invalide." }, { status: 400 });

    const image = await prisma.listingImage.findFirst({ where: { id: body.imageId, listingId: id }, select: { id: true, url: true } });
    if (!image) return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });

    await prisma.listingImage.delete({ where: { id: image.id } });
    const remaining = await prisma.listingImage.findMany({ where: { listingId: id }, orderBy: { position: "asc" }, select: { id: true } });
    if (remaining.length) await prisma.$transaction(remaining.map((item, position) => prisma.listingImage.update({ where: { id: item.id }, data: { position } })));

    const prefix = "/api/uploads/";
    if (image.url.startsWith(prefix)) {
      const filename = path.basename(image.url.slice(prefix.length));
      const uploadDir = process.env.UPLOAD_DIR ?? "/app/uploads";
      try { await unlink(path.join(uploadDir, filename)); } catch (error) { console.warn("unable to remove image file", filename, error); }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("image delete error", error);
    return NextResponse.json({ error: "Impossible de supprimer la photo." }, { status: 500 });
  }
}
