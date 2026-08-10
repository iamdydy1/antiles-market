import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  displayName: z.string().trim().min(2).max(60),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const input = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, isBanned: true } });
    if (!user || user.isBanned) return NextResponse.json({ error: "Compte indisponible." }, { status: 403 });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { displayName: input.displayName, phone: input.phone || null },
      select: { id: true, displayName: true, phone: true, email: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Vérifiez les informations saisies." }, { status: 400 });
    console.error("profile update error", error);
    return NextResponse.json({ error: "Impossible de modifier le profil." }, { status: 500 });
  }
}
