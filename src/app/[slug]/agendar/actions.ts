"use server";

import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { labs, services, appointments, appointmentServices } from "@/db/schema";

export type CreateAppointmentInput = {
  slug: string;
  serviceIds: string[];
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
};

export type CreateAppointmentResult =
  | { ok: true; appointmentId: string }
  | { ok: false; error: "lab_not_found" | "no_services" | "slot_taken" | "invalid_services" };

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<CreateAppointmentResult> {
  const [lab] = await db
    .select({ id: labs.id })
    .from(labs)
    .where(eq(labs.slug, input.slug))
    .limit(1);
  if (!lab) return { ok: false, error: "lab_not_found" };

  if (input.serviceIds.length === 0) return { ok: false, error: "no_services" };

  const selectedServices = await db
    .select({
      id: services.id,
      price: services.price,
    })
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

  return { ok: true, appointmentId: created.id };
}
