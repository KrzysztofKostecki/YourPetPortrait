import { createHash } from "crypto";
import { getRedis } from "lib/redis/client";

function getDailyLimit(): number {
  const parsed = Number(process.env.AI_GENERATION_DAILY_LIMIT ?? "5");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

function quotaKey(email: string): string {
  const hash = createHash("sha256").update(email.toLowerCase()).digest("hex");
  const day = new Date().toISOString().slice(0, 10);
  return `portrait:quota:${day}:${hash}`;
}

export async function getRemainingQuota(email: string): Promise<number> {
  const redis = getRedis();
  const used = Number((await redis.get<number>(quotaKey(email))) ?? 0);
  return Math.max(0, getDailyLimit() - used);
}

export async function consumeQuota(email: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const redis = getRedis();
  const key = quotaKey(email);
  const used = Number((await redis.get<number>(key)) ?? 0);
  const limit = getDailyLimit();

  if (used >= limit) {
    return { allowed: false, remaining: 0 };
  }

  const next = used + 1;
  await redis.set(key, next, { ex: 60 * 60 * 48 });

  return { allowed: true, remaining: Math.max(0, limit - next) };
}
