import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;
async function redis() {
  if (!process.env.REDIS_URL) return null;
  if (!client) { client = createClient({ url: process.env.REDIS_URL }); client.on("error", (error) => console.error("redis error", error)); }
  if (!client.isOpen) await client.connect();
  return client;
}

export function requestIp(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"; }
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  try { const r = await redis(); if (!r) return { allowed: true, remaining: limit }; const count = await r.incr(`rl:${key}`); if (count === 1) await r.expire(`rl:${key}`, windowSeconds); return { allowed: count <= limit, remaining: Math.max(0, limit - count) }; }
  catch (error) { console.error("rate limit unavailable", error); return { allowed: true, remaining: limit }; }
}
