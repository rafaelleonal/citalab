import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { labs, type Lab } from "@/db/schema";

/**
 * Resuelve el lab activo desde la organización de Clerk.
 * Cualquier miembro de la org puede leer datos del lab (read-only).
 * Para MUTACIONES destructivas o de configuración, usa `requireLabAdmin`.
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

  return lab;
}

export type LabRoleError = "not_authenticated" | "not_admin";

/**
 * Igual que `requireLab` pero exige rol `org:admin` en la organización.
 * Devuelve un resultado en vez de redirigir, para que las server actions
 * puedan responder con un error controlado al cliente.
 */
export async function requireLabAdmin(): Promise<
  { ok: true; lab: Lab } | { ok: false; error: LabRoleError }
> {
  const { orgId, orgRole } = await auth();
  if (!orgId) return { ok: false, error: "not_authenticated" };

  // Clerk expone roles como strings tipo "org:admin", "org:member".
  // Solo admins pueden modificar catálogo y configuración.
  if (orgRole !== "org:admin") {
    return { ok: false, error: "not_admin" };
  }

  const [lab] = await db
    .select()
    .from(labs)
    .where(eq(labs.clerkOrgId, orgId))
    .limit(1);

  if (!lab) return { ok: false, error: "not_authenticated" };

  return { ok: true, lab };
}
