"use server";

import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appointments, appointmentServices, services } from "@/db/schema";
import { requireLab } from "@/lib/auth-helpers";
import {
  manualAppointmentSchema,
  updateAppointmentStatusSchema,
} from "@/lib/schemas";
import { validateSlotAgainstLab } from "@/lib/slot-validation";
import type { AppointmentStatus } from "@/components/appointment-status-badge";

export async function updateAppointmentStatus(rawInput: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  const parsed = updateAppointmentStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" as const };
  }
  const input = parsed.data;

  const lab = await requireLab();

  const result = await db
    .update(appointments)
    .set({ status: input.status, updatedAt: new Date() })
    .where(
      and(eq(appointments.id, input.appointmentId), eq(appointments.labId, lab.id)),
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
  | {
      ok: false;
      error:
        | "no_services"
        | "invalid_services"
        | "slot_taken"
        | "invalid_input"
        | "invalid_slot";
    };

export async function createManualAppointment(
  rawInput: ManualAppointmentInput,
): Promise<ManualAppointmentResult> {
  const parsed = manualAppointmentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }
  const input = parsed.data;

  const lab = await requireLab();

  // Validar slot contra horario del lab (defensa en profundidad).
  // Nota: el dashboard permite más flexibilidad (ej. ignorar lead time
  // porque el admin puede querer meter una cita manual en el hueco),
  // así que pasamos minLeadHours: 0.
  const slotCheck = validateSlotAgainstLab({
    date: input.appointmentDate,
    time: input.appointmentTime,
    hours: lab.hours,
    slotMinutes: lab.slotMinutes,
    minLeadHours: 0,
  });
  if (!slotCheck.ok) return { ok: false, error: "invalid_slot" };

  const selectedServices = await db
    .select({ id: services.id, price: services.price })
    .from(services)
    .where(
      and(
        eq(services.labId, lab.id),
        eq(services.active, true),
        inArray(services.id, input.serviceIds),
      ),
    );

  if (selectedServices.length !== input.serviceIds.length) {
    return { ok: false, error: "invalid_services" };
  }

  try {
    const created = await db.transaction(async (tx) => {
      const [conflict] = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.labId, lab.id),
            eq(appointments.appointmentDate, input.appointmentDate),
            eq(appointments.appointmentTime, input.appointmentTime),
            ne(appointments.status, "cancelled"),
          ),
        )
        .limit(1);
      if (conflict) throw new SlotTakenError();

      const [row] = await tx
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

      await tx.insert(appointmentServices).values(
        selectedServices.map((s) => ({
          appointmentId: row.id,
          serviceId: s.id,
          priceSnapshot: s.price,
        })),
      );

      return row;
    });

    revalidatePath("/dashboard");
    return { ok: true, appointmentId: created.id };
  } catch (err) {
    if (err instanceof SlotTakenError) {
      return { ok: false, error: "slot_taken" };
    }
    if (isUniqueViolation(err)) {
      return { ok: false, error: "slot_taken" };
    }
    throw err;
  }
}

class SlotTakenError extends Error {
  constructor() {
    super("slot_taken");
    this.name = "SlotTakenError";
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23505"
  );
}
