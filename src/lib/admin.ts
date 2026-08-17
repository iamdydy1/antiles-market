import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireStaff() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, displayName: true, email: true, role: true, isBanned: true },
  });
  if (!user || user.isBanned || !["MODERATOR", "ADMIN"].includes(user.role)) return null;
  return user;
}

export async function requireAdmin() {
  const user = await requireStaff();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
