"use server";

import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appointments, appointmentServices, services } from "@/db/schema";
import { requireLab } from "@/lib/auth-helpers";
import type { AppointmentStatus } from "@/components/appointment-status-badge";

const ALLOWED_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
];

export async function updateAppointmentStatus(input: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  if (!ALLOWED_STATUSES.includes(input.status)) {
    return { ok: false, error: "invalid_status" as const };
  }

  const lab = await requireLab();

  const result = await db
    .update(appointments)
    .set({ status: input.status, updatedAt: new Date() })
    .where(
      and(eq(appointments.id, input.appointmentId), eq(appointments.labId, lab.id))
    )
    .returning({ id: appointments.id });

  if (result.length === 0) return { ok: false, error: "not_found" as const };

  revalidatePath("/dashboard");
  return { ok: true as const };
}

export type ManualAppointmentInput = {
  serviceIds: string[];
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
};

export type ManualAppointmentResult =
  | { ok: true; appointmentId: string }
  | { ok: false; error: "no_services" | "invalid_services" | "slot_taken" };

export async function createManualAppointment(
  input: ManualAppointmentInput
): Promise<ManualAppointmentResult> {
  const lab = await requireLab();

  if (input.serviceIds.length === 0) return { ok: false, error: "no_services" };

  const selectedServices = await db
    .select({ id: services.id, price: services.price })
    .from(services)
    .where(
      and(
        eq(services.labId, lab.id),
        eq(services.active, true),
        inArray(services.id, input.serviceIds)
      )
    );

  if (selectedServices.length !== input.serviceIds.length) {
    return { ok: false, error: "invalid_services" };
  }

  const [conflict] = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.labId, lab.id),
        eq(appointments.appointmentDate, input.appointmentDate),
        eq(appointments.appointmentTime, input.appointmentTime),
        ne(appointments.status, "cancelled")
      )
    )
    .limit(1);

  if (conflict) return { ok: false, error: "slot_taken" };

  const [created] = await db
    .insert(appointments)
    .values({
      labId: lab.id,
      patientName: input.patientName,
      patientPhone: input.patientPhone,
      patientEmail: input.patientEmail || null,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime,
      status: "pending",
    })
    .returning({ id: appointments.id });

  await db.insert(appointmentServices).values(
    selectedServices.map((s) => ({
      appointmentId: created.id,
      serviceId: s.id,
      priceSnapshot: s.price,
    }))
  );

  revalidatePath("/dashboard");
  return { ok: true, appointmentId: created.id };
}
