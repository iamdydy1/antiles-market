import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  displayName: z.string().trim().min(2).max(60),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  accountType: z.enum(["PRIVATE", "PROFESSIONAL"]),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  businessId: z.string().trim().max(80).optional().or(z.literal("")),
  professionalPhone: z.string().trim().max(30).optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.accountType === "PROFESSIONAL" && !value.companyName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "Company name is required for a professional account." });
  }
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
      data: {
        displayName: input.displayName,
        phone: input.phone || null,
        accountType: input.accountType,
        companyName: input.accountType === "PROFESSIONAL" ? input.companyName || null : null,
        businessId: input.accountType === "PROFESSIONAL" ? input.businessId || null : null,
        professionalPhone: input.accountType === "PROFESSIONAL" ? input.professionalPhone || null : null,
      },
      select: { id: true, displayName: true, phone: true, email: true, accountType: true, companyName: true, businessId: true, professionalPhone: true },
    });
    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Vérifiez les informations saisies." }, { status: 400 });
    console.error("profile update error", error);
    return NextResponse.json({ error: "Impossible de modifier le profil." }, { status: 500 });
  }
}
