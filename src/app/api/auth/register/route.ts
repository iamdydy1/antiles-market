import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  displayName: z.string().trim().min(2).max(60),
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail." }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        displayName: input.displayName,
        email: input.email,
        passwordHash: await hash(input.password, 12),
      },
      select: { id: true, displayName: true, email: true, role: true, createdAt: true },
    });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Informations d'inscription invalides." }, { status: 400 });
    console.error("register error", error);
    return NextResponse.json({ error: "Impossible de créer le compte." }, { status: 500 });
  }
}
