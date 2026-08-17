import { prisma } from "@/lib/prisma";

/**
 * Event listings should stop behaving like active marketplace listings once
 * their configured end date has passed. This keeps the status synchronized
 * without requiring a separate cron container for V1.
 */
export async function archiveExpiredEvents(now = new Date()) {
  await prisma.listing.updateMany({
    where: {
      status: { in: ["PUBLISHED", "RESERVED"] },
      eventEndAt: { lt: now },
    },
    data: { status: "ARCHIVED" },
  });
}
