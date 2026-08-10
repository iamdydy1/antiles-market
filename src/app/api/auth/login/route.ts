import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || user.isBanned || !(await compare(input.password, user.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
    }

    const response = NextResponse.json({
      user: { id: user.id, displayName: user.displayName, email: user.email, role: user.role },
    });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Informations de connexion invalides." }, { status: 400 });
    console.error("login error", error);
    return NextResponse.json({ error: "Connexion impossible." }, { status: 500 });
  }
}
