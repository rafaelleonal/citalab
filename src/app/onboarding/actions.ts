"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { labs, services } from "@/db/schema";
import {
  onboardingPayloadSchema,
  type OnboardingPayload,
} from "@/lib/schemas";
import { TRIAL_DAYS } from "@/lib/subscription";

export type { OnboardingPayload, ServiceInput } from "@/lib/schemas";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Slugs reservados: no pueden ser usados por un lab público
// porque chocarían con rutas internas o serían confusos.
const RESERVED_SLUGS = new Set([
  "dashboard",
  "onboarding",
  "sign-in",
  "sign-up",
  "api",
  "_next",
  "admin",
  "login",
  "logout",
  "register",
  "help",
  "support",
  "billing",
  "settings",
  "profile",
  "legal",
  "privacy",
  "terms",
  "about",
  "contact",
  "citalab",
  "www",
]);

async function uniqueSlug(base: string): Promise<string> {
  let candidate = RESERVED_SLUGS.has(base) ? `${base}-lab` : base;
  let suffix = 2;
  while (true) {
    const [existing] = await db
      .select({ id: labs.id })
      .from(labs)
      .where(eq(labs.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

export async function finishOnboarding(
  rawPayload: OnboardingPayload,
): Promise<void> {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No active organization");

  // Validar payload con Zod antes de tocar la BD (A3).
  const parsed = onboardingPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    throw new Error("invalid_input");
  }
  const payload = parsed.data;

  // TOCTOU guard: si ya existe un lab para esta org, redirigimos al
  // dashboard en vez de crear otro (unique() lo bloquearía con excepción).
  const [existing] = await db
    .select({ id: labs.id })
    .from(labs)
    .where(eq(labs.clerkOrgId, orgId))
    .limit(1);
  if (existing) {
    redirect("/dashboard");
  }

  const slug = await uniqueSlug(toSlug(payload.name));

  // Trial: arranca HOY al completar onboarding, dura TRIAL_DAYS.
  const trialEndsAt = new Date(
    Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
  );

  try {
    const [lab] = await db
      .insert(labs)
      .values({
        name: payload.name,
        slug,
        address: payload.address || null,
        phone: payload.phone || null,
        hours: payload.hours,
        clerkOrgId: orgId,
        subscriptionStatus: "trialing",
        trialEndsAt,
      })
      .returning({ id: labs.id });

    if (payload.services.length > 0) {
      await db.insert(services).values(
        payload.services.map((s) => ({
          labId: lab.id,
          name: s.name,
          code: s.code || null,
          category: s.category || null,
          description: s.description || null,
          price: String(Number(s.price).toFixed(2)),
          durationMinutes: s.durationMinutes,
          requiresFasting: s.requiresFasting,
          fastingHours: s.requiresFasting ? (s.fastingHours ?? 8) : null,
          instructions: s.instructions || null,
        })),
      );
    }
  } catch (err) {
    // Race / unique violation en clerkOrgId o slug → el usuario probablemente
    // ya terminó el onboarding en otro tab.
    if (isUniqueViolation(err)) {
      redirect("/dashboard");
    }
    throw err;
  }

  redirect("/dashboard");
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23505"
  );
}
