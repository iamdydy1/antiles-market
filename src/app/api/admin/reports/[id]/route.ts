import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  action: z.enum(["RESOLVE", "REJECT", "REMOVE_LISTING"]),
});

async function requireModerator() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, role: true } });
  if (!user || !["MODERATOR", "ADMIN"].includes(user.role)) return null;
  return user;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const moderator = await requireModerator();
    if (!moderator) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

    const { id } = await params;
    const input = schema.parse(await request.json());
    const report = await prisma.report.findUnique({ where: { id }, select: { id: true, listingId: true } });
    if (!report) return NextResponse.json({ error: "Signalement introuvable." }, { status: 404 });

    if (input.action === "REMOVE_LISTING") {
      await prisma.$transaction([
        prisma.listing.update({ where: { id: report.listingId }, data: { status: "REMOVED" } }),
        prisma.report.update({ where: { id }, data: { status: "RESOLVED", reviewerId: moderator.id, resolvedAt: new Date() } }),
      ]);
    } else {
      await prisma.report.update({
        where: { id },
        data: {
          status: input.action === "RESOLVE" ? "RESOLVED" : "REJECTED",
          reviewerId: moderator.id,
          resolvedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Action invalide." }, { status: 400 });
    console.error("moderation action error", error);
    return NextResponse.json({ error: "Action de modération impossible." }, { status: 500 });
  }
}
