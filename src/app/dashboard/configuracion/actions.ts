"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { labs, type WeeklyHours } from "@/db/schema";
import { requireLabAdmin } from "@/lib/auth-helpers";

const phoneRegex = /^(?:\+?52\s?)?(?:\d[\s-]?){10}$/;
const timeRegex = /^\d{2}:\d{2}$/;

const dayRangeSchema = z
  .object({
    open: z.string().regex(timeRegex),
    close: z.string().regex(timeRegex),
  })
  .nullable();

const hoursSchema = z.object({
  monday: dayRangeSchema,
  tuesday: dayRangeSchema,
  wednesday: dayRangeSchema,
  thursday: dayRangeSchema,
  friday: dayRangeSchema,
  saturday: dayRangeSchema,
  sunday: dayRangeSchema,
});

const infoSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(300).optional().default(""),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || phoneRegex.test(v), "Teléfono inválido")
    .optional()
    .default(""),
});

const prefsSchema = z.object({
  slotMinutes: z.union([z.literal(15), z.literal(30), z.literal(45)]),
  minLeadHours: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(4),
    z.literal(24),
  ]),
});

export type UpdateResult =
  | { ok: true }
  | { ok: false; error: "invalid_input" | "no_open_day" | "not_admin" };

export async function updateLabInfo(raw: unknown): Promise<UpdateResult> {
  const parsed = infoSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const auth = await requireLabAdmin();
  if (!auth.ok) return { ok: false, error: "not_admin" };
  const lab = auth.lab;

  await db
    .update(labs)
    .set({
      name: parsed.data.name,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      updatedAt: new Date(),
    })
    .where(eq(labs.id, lab.id));

  revalidatePath("/dashboard/configuracion");
  revalidatePath(`/${lab.slug}`);
  return { ok: true };
}

export async function updateLabHours(raw: unknown): Promise<UpdateResult> {
  const parsed = hoursSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const hasAny = (Object.values(parsed.data) as Array<unknown>).some(
    (v) => v !== null
  );
  if (!hasAny) return { ok: false, error: "no_open_day" };

  const auth = await requireLabAdmin();
  if (!auth.ok) return { ok: false, error: "not_admin" };
  const lab = auth.lab;

  await db
    .update(labs)
    .set({
      hours: parsed.data as WeeklyHours,
      updatedAt: new Date(),
    })
    .where(eq(labs.id, lab.id));

  revalidatePath("/dashboard/configuracion");
  revalidatePath(`/${lab.slug}`);
  revalidatePath(`/${lab.slug}/agendar`);
  return { ok: true };
}

export async function updateLabPreferences(
  raw: unknown
): Promise<UpdateResult> {
  const parsed = prefsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const auth = await requireLabAdmin();
  if (!auth.ok) return { ok: false, error: "not_admin" };
  const lab = auth.lab;

  await db
    .update(labs)
    .set({
      slotMinutes: parsed.data.slotMinutes,
      minLeadHours: parsed.data.minLeadHours,
      updatedAt: new Date(),
    })
    .where(eq(labs.id, lab.id));

  revalidatePath("/dashboard/configuracion");
  revalidatePath(`/${lab.slug}/agendar`);
  return { ok: true };
}
