import { and, count, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { rateLimitHits } from "@/db/schema";

/**
 * Rate limiter con ventana deslizante, persistido en Postgres.
 *
 * Compromiso: una consulta + un insert por request (dos round-trips).
 * Suficiente para endpoints críticos como `createAppointment`, no para
 * endpoints de alto QPS. Si eso cambia, migrar a Upstash Redis.
 *
 * Uso típico:
 *
 *   const rl = await rateLimit({
 *     key: `create-appt:ip:${ip}`,
 *     windowMs: 60_000,
 *     max: 5,
 *   });
 *   if (!rl.ok) return { ok: false, error: "rate_limited" };
 */
export type RateLimitArgs = {
  key: string;
  windowMs: number;
  max: number;
};

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterMs: number };

export async function rateLimit(args: RateLimitArgs): Promise<RateLimitResult> {
  const { key, windowMs, max } = args;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // 1. Contar hits dentro de la ventana
  const [row] = await db
    .select({ n: count() })
    .from(rateLimitHits)
    .where(
      and(
        eq(rateLimitHits.key, key),
        gte(rateLimitHits.createdAt, windowStart),
      ),
    );

  const currentHits = Number(row?.n ?? 0);
  if (currentHits >= max) {
    // Retry-after aproximado: cuándo expira el hit más antiguo dentro
    // de la ventana. Sin consulta extra, devolvemos la ventana completa
    // como cota superior.
    return { ok: false, retryAfterMs: windowMs };
  }

  // 2. Registrar este hit
  await db.insert(rateLimitHits).values({ key });

  return { ok: true, remaining: Math.max(0, max - currentHits - 1) };
}

/**
 * Limpia hits viejos. Llamar ocasionalmente (desde un endpoint
 * programado o un cron). No se ejecuta por request para evitar latencia.
 */
export async function pruneRateLimitHits(
  olderThanMs: number = 24 * 60 * 60 * 1000,
): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMs);
  const result = await db
    .delete(rateLimitHits)
    .where(lte(rateLimitHits.createdAt, cutoff))
    .returning({ id: rateLimitHits.id });
  return result.length;
}

/**
 * Extrae la IP del cliente desde los headers (Vercel/Next.js).
 * Cae al string "unknown" para no romper el flujo si el header falta.
 */
export function getClientIp(headers: Headers): string {
  // Vercel / Next.js producción: `x-forwarded-for` contiene la IP real
  // al frente, separada por comas cuando hay múltiples proxies.
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
