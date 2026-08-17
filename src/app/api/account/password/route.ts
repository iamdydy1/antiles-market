import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const input = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, passwordHash: true, isBanned: true } });
    if (!user || user.isBanned) return NextResponse.json({ error: "Compte indisponible." }, { status: 403 });

    const valid = await compare(input.currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Le mot de passe actuel est incorrect." }, { status: 400 });
    if (await compare(input.newPassword, user.passwordHash)) return NextResponse.json({ error: "Le nouveau mot de passe doit être différent de l’ancien." }, { status: 400 });

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(input.newPassword, 12) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Vérifiez les mots de passe saisis." }, { status: 400 });
    console.error("password update error", error);
    return NextResponse.json({ error: "Impossible de modifier le mot de passe." }, { status: 500 });
  }
}
