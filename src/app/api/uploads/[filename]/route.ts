import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const uploadDir = process.env.UPLOAD_DIR ?? "/app/uploads";
    const data = await readFile(path.join(uploadDir, filename));
    const extension = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    return new NextResponse(data, {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
