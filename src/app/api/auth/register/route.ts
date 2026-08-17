import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const schema = z.object({
  displayName: z.string().trim().min(2).max(60),
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
  accountType: z.enum(["PRIVATE", "PROFESSIONAL"]).default("PRIVATE"),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  businessId: z.string().trim().max(80).optional().or(z.literal("")),
  professionalPhone: z.string().trim().max(30).optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.accountType === "PROFESSIONAL" && !value.companyName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "Company name is required for a professional account." });
  }
});

export async function POST(request: Request) {
  try {
    const limit = await rateLimit(`register:${requestIp(request)}`, 5, 3600);
    if (!limit.allowed) return NextResponse.json({ error: "Trop de créations de compte. Réessayez plus tard." }, { status: 429 });
    const input = schema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail." }, { status: 409 });
    const user = await prisma.user.create({
      data: {
        displayName: input.displayName,
        email: input.email,
        passwordHash: await hash(input.password, 12),
        accountType: input.accountType,
        companyName: input.accountType === "PROFESSIONAL" ? input.companyName || null : null,
        businessId: input.accountType === "PROFESSIONAL" ? input.businessId || null : null,
        professionalPhone: input.accountType === "PROFESSIONAL" ? input.professionalPhone || null : null,
      },
      select: { id: true, displayName: true, email: true, role: true, accountType: true, createdAt: true },
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
