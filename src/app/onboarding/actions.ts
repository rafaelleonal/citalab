"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { labs, services } from "@/db/schema";
import type { WeeklyHours } from "@/db/schema";

export type ServiceInput = {
  name: string;
  code?: string | null;
  category?: string | null;
  description?: string | null;
  price: string;
  durationMinutes: number;
  requiresFasting: boolean;
  fastingHours?: number | null;
  instructions: string;
};

export type OnboardingPayload = {
  name: string;
  address: string;
  phone: string;
  hours: WeeklyHours;
  services: ServiceInput[];
};

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

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let suffix = 2;
  while (true) {
    const [existing] = await db
      .select({ id: labs.id })
      .from(labs)
      .where(eq(labs.slug, slug))
      .limit(1);
    if (!existing) return slug;
    slug = `${base}-${suffix++}`;
  }
}

export async function finishOnboarding(payload: OnboardingPayload) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No active organization");

  const slug = await uniqueSlug(toSlug(payload.name));

  const [lab] = await db
    .insert(labs)
    .values({
      name: payload.name,
      slug,
      address: payload.address || null,
      phone: payload.phone || null,
      hours: payload.hours,
      clerkOrgId: orgId,
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
      }))
    );
  }

  redirect("/dashboard");
}
