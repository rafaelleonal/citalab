"use server";

import { and, eq, gte, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  appointments,
  appointmentServices,
  packageItems,
  services,
} from "@/db/schema";
import { requireLab } from "@/lib/auth-helpers";
import { formatDateYMD } from "@/lib/hours";

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().max(20).optional().default(""),
  category: z.string().trim().max(40).optional().default(""),
  description: z.string().trim().max(200).optional().default(""),
  price: z.coerce.number().positive().max(99999),
  durationMinutes: z.union([
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(30),
    z.literal(45),
  ]),
  requiresFasting: z.boolean(),
  fastingHours: z.coerce.number().int().min(4).max(24).optional().nullable(),
  instructions: z.string().trim().max(500).optional().default(""),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

type ServiceResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_found"
        | "has_future_appointments"
        | "missing_instructions";
      futureCount?: number;
    };

function validateInstructions(input: ServiceInput): ServiceResult | null {
  if (input.requiresFasting && input.instructions.trim().length < 10) {
    return { ok: false, error: "missing_instructions" };
  }
  return null;
}

export async function createService(raw: unknown): Promise<ServiceResult> {
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const err = validateInstructions(parsed.data);
  if (err) return err;

  const lab = await requireLab();

  const [created] = await db
    .insert(services)
    .values({
      labId: lab.id,
      name: parsed.data.name,
      code: parsed.data.code || null,
      category: parsed.data.category || null,
      description: parsed.data.description || null,
      price: parsed.data.price.toFixed(2),
      durationMinutes: parsed.data.durationMinutes,
      requiresFasting: parsed.data.requiresFasting,
      fastingHours: parsed.data.requiresFasting
        ? parsed.data.fastingHours ?? 8
        : null,
      instructions: parsed.data.instructions || null,
      active: true,
    })
    .returning({ id: services.id });

  revalidatePath("/dashboard/estudios");
  return { ok: true, id: created.id };
}

export async function updateService(
  serviceId: string,
  raw: unknown
): Promise<ServiceResult> {
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const err = validateInstructions(parsed.data);
  if (err) return err;

  const lab = await requireLab();

  const result = await db
    .update(services)
    .set({
      name: parsed.data.name,
      code: parsed.data.code || null,
      category: parsed.data.category || null,
      description: parsed.data.description || null,
      price: parsed.data.price.toFixed(2),
      durationMinutes: parsed.data.durationMinutes,
      requiresFasting: parsed.data.requiresFasting,
      fastingHours: parsed.data.requiresFasting
        ? parsed.data.fastingHours ?? 8
        : null,
      instructions: parsed.data.instructions || null,
      updatedAt: new Date(),
    })
    .where(and(eq(services.id, serviceId), eq(services.labId, lab.id)))
    .returning({ id: services.id });

  if (result.length === 0) return { ok: false, error: "not_found" };

  revalidatePath("/dashboard/estudios");
  return { ok: true, id: serviceId };
}

export async function toggleServiceActive(
  serviceId: string
): Promise<{ ok: true; active: boolean } | { ok: false; error: "not_found" }> {
  const lab = await requireLab();

  const [current] = await db
    .select({ active: services.active })
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.labId, lab.id)))
    .limit(1);

  if (!current) return { ok: false, error: "not_found" };

  const nextActive = !current.active;

  await db
    .update(services)
    .set({ active: nextActive, updatedAt: new Date() })
    .where(and(eq(services.id, serviceId), eq(services.labId, lab.id)));

  revalidatePath("/dashboard/estudios");
  return { ok: true, active: nextActive };
}

export async function deleteService(serviceId: string): Promise<ServiceResult> {
  const lab = await requireLab();

  const [existing] = await db
    .select({ id: services.id })
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.labId, lab.id)))
    .limit(1);

  if (!existing) return { ok: false, error: "not_found" };

  const todayYMD = formatDateYMD(new Date());

  const futureRows = await db
    .select({ appointmentId: appointmentServices.appointmentId })
    .from(appointmentServices)
    .innerJoin(
      appointments,
      eq(appointments.id, appointmentServices.appointmentId)
    )
    .where(
      and(
        eq(appointmentServices.serviceId, serviceId),
        eq(appointments.labId, lab.id),
        gte(appointments.appointmentDate, todayYMD),
        ne(appointments.status, "cancelled")
      )
    );

  const uniqueFuture = new Set(futureRows.map((r) => r.appointmentId));

  if (uniqueFuture.size > 0) {
    return {
      ok: false,
      error: "has_future_appointments",
      futureCount: uniqueFuture.size,
    };
  }

  // Historial: si tiene citas pasadas, hacer soft delete en vez de romper FK
  const [pastExists] = await db
    .select({ id: appointmentServices.appointmentId })
    .from(appointmentServices)
    .where(eq(appointmentServices.serviceId, serviceId))
    .limit(1);

  if (pastExists) {
    await db
      .update(services)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(services.id, serviceId));
  } else {
    await db.delete(services).where(eq(services.id, serviceId));
  }

  revalidatePath("/dashboard/estudios");
  return { ok: true, id: serviceId };
}

/* ---------- Packages ---------- */

const packageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  price: z.coerce.number().positive().max(99999),
  durationMinutes: z.union([
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(30),
    z.literal(45),
    z.literal(60),
  ]),
  itemIds: z.array(z.string().uuid()).min(2).max(30),
});

export type PackageInput = z.infer<typeof packageSchema>;

type PackageResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_found"
        | "invalid_items"
        | "has_future_appointments";
      futureCount?: number;
    };

async function validateItemIds(
  labId: string,
  itemIds: string[]
): Promise<boolean> {
  if (itemIds.length === 0) return false;
  const rows = await db
    .select({ id: services.id })
    .from(services)
    .where(
      and(
        eq(services.labId, labId),
        inArray(services.id, itemIds),
        eq(services.isPackage, false)
      )
    );
  return rows.length === itemIds.length;
}

export async function createPackage(raw: unknown): Promise<PackageResult> {
  const parsed = packageSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const lab = await requireLab();

  const validItems = await validateItemIds(lab.id, parsed.data.itemIds);
  if (!validItems) return { ok: false, error: "invalid_items" };

  const [created] = await db
    .insert(services)
    .values({
      labId: lab.id,
      name: parsed.data.name,
      price: parsed.data.price.toFixed(2),
      durationMinutes: parsed.data.durationMinutes,
      requiresFasting: false,
      instructions: null,
      active: true,
      isPackage: true,
    })
    .returning({ id: services.id });

  await db.insert(packageItems).values(
    parsed.data.itemIds.map((serviceId) => ({
      packageId: created.id,
      serviceId,
    }))
  );

  revalidatePath("/dashboard/estudios");
  return { ok: true, id: created.id };
}

export async function updatePackage(
  packageId: string,
  raw: unknown
): Promise<PackageResult> {
  const parsed = packageSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const lab = await requireLab();

  const [pkg] = await db
    .select({ id: services.id })
    .from(services)
    .where(
      and(
        eq(services.id, packageId),
        eq(services.labId, lab.id),
        eq(services.isPackage, true)
      )
    )
    .limit(1);
  if (!pkg) return { ok: false, error: "not_found" };

  const validItems = await validateItemIds(lab.id, parsed.data.itemIds);
  if (!validItems) return { ok: false, error: "invalid_items" };

  await db
    .update(services)
    .set({
      name: parsed.data.name,
      price: parsed.data.price.toFixed(2),
      durationMinutes: parsed.data.durationMinutes,
      updatedAt: new Date(),
    })
    .where(eq(services.id, packageId));

  await db.delete(packageItems).where(eq(packageItems.packageId, packageId));
  await db.insert(packageItems).values(
    parsed.data.itemIds.map((serviceId) => ({
      packageId,
      serviceId,
    }))
  );

  revalidatePath("/dashboard/estudios");
  return { ok: true, id: packageId };
}

export async function deletePackage(
  packageId: string
): Promise<PackageResult> {
  const lab = await requireLab();

  const [pkg] = await db
    .select({ id: services.id })
    .from(services)
    .where(
      and(
        eq(services.id, packageId),
        eq(services.labId, lab.id),
        eq(services.isPackage, true)
      )
    )
    .limit(1);
  if (!pkg) return { ok: false, error: "not_found" };

  const todayYMD = formatDateYMD(new Date());

  const futureRows = await db
    .select({ appointmentId: appointmentServices.appointmentId })
    .from(appointmentServices)
    .innerJoin(
      appointments,
      eq(appointments.id, appointmentServices.appointmentId)
    )
    .where(
      and(
        eq(appointmentServices.serviceId, packageId),
        eq(appointments.labId, lab.id),
        gte(appointments.appointmentDate, todayYMD),
        ne(appointments.status, "cancelled")
      )
    );

  const uniqueFuture = new Set(futureRows.map((r) => r.appointmentId));
  if (uniqueFuture.size > 0) {
    return {
      ok: false,
      error: "has_future_appointments",
      futureCount: uniqueFuture.size,
    };
  }

  const [pastExists] = await db
    .select({ id: appointmentServices.appointmentId })
    .from(appointmentServices)
    .where(eq(appointmentServices.serviceId, packageId))
    .limit(1);

  if (pastExists) {
    await db
      .update(services)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(services.id, packageId));
  } else {
    await db.delete(services).where(eq(services.id, packageId));
  }

  revalidatePath("/dashboard/estudios");
  return { ok: true, id: packageId };
}
