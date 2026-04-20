import type { WeeklyHours } from "@/db/schema";
import { dateToDayKey, parseYMD } from "@/lib/hours";

export type SlotValidationError =
  | "invalid_date"
  | "past_date"
  | "before_lead_time"
  | "day_closed"
  | "outside_hours"
  | "misaligned_slot";

/**
 * Valida que una fecha+hora propuesta caiga dentro del horario del lab,
 * respete `minLeadHours` y esté alineada con `slotMinutes`.
 *
 * Esto es defensa-en-profundidad: el cliente ya filtra slots pasados y
 * días cerrados, pero un atacante que llame la server action directamente
 * podría saltarse esa validación.
 */
export function validateSlotAgainstLab(args: {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  hours: WeeklyHours | null;
  slotMinutes: number;
  minLeadHours: number;
  now?: Date;
}): { ok: true } | { ok: false; error: SlotValidationError } {
  const { date, time, hours, slotMinutes, minLeadHours } = args;
  const now = args.now ?? new Date();

  if (!hours) return { ok: false, error: "day_closed" };

  let dateObj: Date;
  try {
    dateObj = parseYMD(date);
  } catch {
    return { ok: false, error: "invalid_date" };
  }
  if (Number.isNaN(dateObj.getTime())) {
    return { ok: false, error: "invalid_date" };
  }

  const [hh, mm] = time.split(":").map(Number);
  if (
    Number.isNaN(hh) ||
    Number.isNaN(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    return { ok: false, error: "invalid_date" };
  }

  const proposed = new Date(dateObj);
  proposed.setHours(hh, mm, 0, 0);

  // Lead time (fecha pasada o demasiado cercana)
  const leadMs = minLeadHours * 60 * 60 * 1000;
  if (proposed.getTime() <= now.getTime()) {
    return { ok: false, error: "past_date" };
  }
  if (proposed.getTime() - now.getTime() < leadMs) {
    return { ok: false, error: "before_lead_time" };
  }

  // Día abierto?
  const dayRange = hours[dateToDayKey(dateObj)];
  if (!dayRange) return { ok: false, error: "day_closed" };

  // Dentro del horario?
  const [openH, openM] = dayRange.open.split(":").map(Number);
  const [closeH, closeM] = dayRange.close.split(":").map(Number);
  const minutesOfDay = hh * 60 + mm;
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  if (minutesOfDay < openMin || minutesOfDay >= closeMin) {
    return { ok: false, error: "outside_hours" };
  }

  // Alineado con la grilla de slots
  if ((minutesOfDay - openMin) % slotMinutes !== 0) {
    return { ok: false, error: "misaligned_slot" };
  }

  return { ok: true };
}
