import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { labs, type Lab } from "@/db/schema";
import { resolveSubscriptionState } from "@/lib/subscription";

/**
 * Resuelve el lab activo desde la organización de Clerk.
 *
 * Side effect: si el estado de suscripción persistido quedó obsoleto
 * (trial venció sin que nadie actualizara la fila), hace un UPDATE
 * lazy a `trial_expired`. Así no necesitamos un cron.
 *
 * Cualquier miembro de la org puede leer datos del lab. Para MUTACIONES
 * destructivas/configuración usa `requireLabAdmin`.
 */
export async function requireLab(): Promise<Lab> {
  const { orgId } = await auth();
  if (!orgId) redirect("/onboarding");

  const [lab] = await db
    .select()
    .from(labs)
    .where(eq(labs.clerkOrgId, orgId))
    .limit(1);

  if (!lab) redirect("/onboarding");

  // Lazy transition del estado de suscripción (no bloquea — si el UPDATE
  // falla por concurrencia, el siguiente request lo reintenta).
  const resolved = resolveSubscriptionState(lab);
  if (resolved !== lab.subscriptionStatus) {
    await db
      .update(labs)
      .set({ subscriptionStatus: resolved, updatedAt: new Date() })
      .where(eq(labs.id, lab.id));
    lab.subscriptionStatus = resolved;
  }

  return lab;
}

export type LabRoleError = "not_authenticated" | "not_admin";

/**
 * Igual que `requireLab` pero exige rol `org:admin` en la organización.
 */
export async function requireLabAdmin(): Promise<
  { ok: true; lab: Lab } | { ok: false; error: LabRoleError }
> {
  const { orgId, orgRole } = await auth();
  if (!orgId) return { ok: false, error: "not_authenticated" };

  if (orgRole !== "org:admin") {
    return { ok: false, error: "not_admin" };
  }

  const [lab] = await db
    .select()
    .from(labs)
    .where(eq(labs.clerkOrgId, orgId))
    .limit(1);

  if (!lab) return { ok: false, error: "not_authenticated" };

  const resolved = resolveSubscriptionState(lab);
  if (resolved !== lab.subscriptionStatus) {
    await db
      .update(labs)
      .set({ subscriptionStatus: resolved, updatedAt: new Date() })
      .where(eq(labs.id, lab.id));
    lab.subscriptionStatus = resolved;
  }

  return { ok: true, lab };
}
