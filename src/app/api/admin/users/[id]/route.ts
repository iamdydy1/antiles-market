import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  action: z.enum(["BAN", "UNBAN", "SET_ROLE"]),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff();
    if (!actor) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

    const { id } = await params;
    const input = schema.parse(await request.json());
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isBanned: true, displayName: true },
    });
    if (!target) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    if (target.id === actor.id) return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre compte ici." }, { status: 400 });

    if (actor.role === "MODERATOR") {
      if (target.role !== "USER") return NextResponse.json({ error: "Un modérateur ne peut agir que sur les comptes utilisateurs." }, { status: 403 });
      if (input.action === "SET_ROLE") return NextResponse.json({ error: "Seul un administrateur peut modifier les rôles." }, { status: 403 });
    }

    if (input.action === "SET_ROLE") {
      if (actor.role !== "ADMIN") return NextResponse.json({ error: "Seul un administrateur peut modifier les rôles." }, { status: 403 });
      if (!input.role) return NextResponse.json({ error: "Rôle requis." }, { status: 400 });

      if (target.role === "ADMIN" && input.role !== "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN", isBanned: false } });
        if (adminCount <= 1) return NextResponse.json({ error: "Impossible de retirer le dernier administrateur actif." }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role: input.role },
        select: { id: true, displayName: true, email: true, role: true, isBanned: true },
      });
      return NextResponse.json({ user: updated });
    }

    if (input.action === "BAN" && target.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN", isBanned: false } });
      if (adminCount <= 1) return NextResponse.json({ error: "Impossible de bannir le dernier administrateur actif." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBanned: input.action === "BAN" },
      select: { id: true, displayName: true, email: true, role: true, isBanned: true },
    });
    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Action invalide." }, { status: 400 });
    console.error("admin user update error", error);
    return NextResponse.json({ error: "Impossible de modifier cet utilisateur." }, { status: 500 });
  }
}
