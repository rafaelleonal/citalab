"use server";

import { and, eq, inArray, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { labs, services, appointments, appointmentServices } from "@/db/schema";
import { createAppointmentSchema } from "@/lib/schemas";
import { validateSlotAgainstLab } from "@/lib/slot-validation";
import { signAppointmentToken } from "@/lib/confirmation-token";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  isSubscriptionActive,
  resolveSubscriptionState,
} from "@/lib/subscription";

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
  | { ok: true; appointmentId: string; token: string; redirectPath: string }
  | {
      ok: false;
      error:
        | "lab_not_found"
        | "lab_unavailable"
        | "no_services"
        | "slot_taken"
        | "invalid_services"
        | "invalid_input"
        | "invalid_slot"
        | "rate_limited";
    };

export async function createAppointment(
  rawInput: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  // 1. Validar input con Zod (C2)
  const parsed = createAppointmentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }
  const input = parsed.data;

  // 2. Rate limit — defensa contra DoS de la agenda (C3).
  // Dos buckets:
  //  - Por IP: máximo 10 citas / 10 min (sirve tanto al usuario legítimo
  //    que se equivoca como a un script individual).
  //  - Por slug: máximo 60 citas / 10 min (protege a cada lab contra un
  //    ataque distribuido que reparta la carga entre IPs).
  const h = await headers();
  const ip = getClientIp(h);
  const ipRl = await rateLimit({
    key: `create-appt:ip:${ip}`,
    windowMs: 10 * 60 * 1000,
    max: 10,
  });
  if (!ipRl.ok) return { ok: false, error: "rate_limited" };

  const slugRl = await rateLimit({
    key: `create-appt:slug:${input.slug}`,
    windowMs: 10 * 60 * 1000,
    max: 60,
  });
  if (!slugRl.ok) return { ok: false, error: "rate_limited" };

  // 3. Resolver lab por slug (+ verificar suscripción activa)
  const [lab] = await db
    .select({
      id: labs.id,
      hours: labs.hours,
      slotMinutes: labs.slotMinutes,
      minLeadHours: labs.minLeadHours,
      subscriptionStatus: labs.subscriptionStatus,
      trialEndsAt: labs.trialEndsAt,
      currentPeriodEnd: labs.currentPeriodEnd,
    })
    .from(labs)
    .where(eq(labs.slug, input.slug))
    .limit(1);
  if (!lab) return { ok: false, error: "lab_not_found" };

  // Si la suscripción no está activa, el lab no puede recibir citas.
  // Reusamos los helpers pasando solo los campos relevantes.
  const labForCheck = {
    subscriptionStatus: lab.subscriptionStatus,
    trialEndsAt: lab.trialEndsAt,
    currentPeriodEnd: lab.currentPeriodEnd,
  } as Parameters<typeof isSubscriptionActive>[0];
  labForCheck.subscriptionStatus = resolveSubscriptionState(labForCheck);
  if (!isSubscriptionActive(labForCheck)) {
    return { ok: false, error: "lab_unavailable" };
  }

  // 4. Validar que el slot caiga dentro del horario + lead time (C2)
  const slotCheck = validateSlotAgainstLab({
    date: input.appointmentDate,
    time: input.appointmentTime,
    hours: lab.hours,
    slotMinutes: lab.slotMinutes,
    minLeadHours: lab.minLeadHours,
  });
  if (!slotCheck.ok) return { ok: false, error: "invalid_slot" };

  // 5. Verificar que los servicios existan, estén activos y pertenezcan al lab
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

  // 6. Insertar en transacción. Si existe un índice único parcial sobre
  // (labId, appointmentDate, appointmentTime) WHERE status != 'cancelled',
  // un conflicto de carrera lanzará un error de unique-violation y lo
  // capturamos como `slot_taken`.
  try {
    const result = await db.transaction(async (tx) => {
      // Doble check dentro de la tx — más rápido si el índice no está aún
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
      if (conflict) {
        throw new SlotTakenError();
      }

      const [created] = await tx
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
          appointmentId: created.id,
          serviceId: s.id,
          priceSnapshot: s.price,
        })),
      );

      return created;
    });

    const token = signAppointmentToken(result.id);
    return {
      ok: true,
      appointmentId: result.id,
      token,
      redirectPath: `/${input.slug}/confirmacion/${result.id}?t=${token}`,
    };
  } catch (err) {
    if (err instanceof SlotTakenError) {
      return { ok: false, error: "slot_taken" };
    }
    // unique_violation de Postgres = 23505
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
