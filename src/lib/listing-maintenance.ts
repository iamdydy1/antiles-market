import { prisma } from "@/lib/prisma";

const ARCHIVE_CHECK_INTERVAL_MS = 60_000;
let nextArchiveCheckAt = 0;

/**
 * Event listings should stop behaving like active marketplace listings once
 * their configured end date has passed. A small in-process throttle avoids a
 * database write check on every page view while keeping V1 effectively live.
 */
export async function archiveExpiredEvents(now = new Date()) {
  const timestamp = now.getTime();
  if (timestamp < nextArchiveCheckAt) return;
  nextArchiveCheckAt = timestamp + ARCHIVE_CHECK_INTERVAL_MS;

  try {
    await prisma.listing.updateMany({
      where: {
        status: { in: ["PUBLISHED", "RESERVED"] },
        eventEndAt: { lt: now },
      },
      data: { status: "ARCHIVED" },
    });
  } catch (error) {
    nextArchiveCheckAt = 0;
    throw error;
  }
}
