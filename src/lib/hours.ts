import type { WeeklyHours } from "@/db/schema";

export type DayKey = keyof WeeklyHours;

export const DAY_KEYS: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const DAY_LABELS_ES: Record<DayKey, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const WEEKDAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export function formatTime12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h < 12 ? "AM" : "PM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
}

export type HoursRow = { label: string; range: string | null };

export function groupHoursForDisplay(hours: WeeklyHours): HoursRow[] {
  const rows: HoursRow[] = [];

  const weekdayRanges = WEEKDAYS.map((k) => hours[k]);
  const allWeekdaysEqual =
    weekdayRanges.every((r) => r !== null) &&
    weekdayRanges.every(
      (r) =>
        r!.open === weekdayRanges[0]!.open &&
        r!.close === weekdayRanges[0]!.close,
    );

  if (allWeekdaysEqual && weekdayRanges[0]) {
    const r = weekdayRanges[0];
    rows.push({
      label: "Lunes a viernes",
      range: `${formatTime12h(r.open)} - ${formatTime12h(r.close)}`,
    });
  } else {
    for (const k of WEEKDAYS) {
      const r = hours[k];
      rows.push({
        label: DAY_LABELS_ES[k],
        range: r
          ? `${formatTime12h(r.open)} - ${formatTime12h(r.close)}`
          : null,
      });
    }
  }

  for (const k of ["saturday", "sunday"] as const) {
    const r = hours[k];
    rows.push({
      label: DAY_LABELS_ES[k],
      range: r
        ? `${formatTime12h(r.open)} - ${formatTime12h(r.close)}`
        : "Cerrado",
    });
  }

  return rows;
}

export function dateToDayKey(date: Date): DayKey {
  return DAY_KEYS[date.getDay()];
}

export function isDayOpen(hours: WeeklyHours, date: Date): boolean {
  return hours[dateToDayKey(date)] !== null;
}

export type Slot = { time: string; label: string; available: boolean };

const SLOT_MINUTES = 30;

export function generateSlots(
  hours: WeeklyHours,
  date: Date,
  takenTimes: Set<string>,
  now: Date,
): Slot[] {
  const dayRange = hours[dateToDayKey(date)];
  if (!dayRange) return [];

  const [openH, openM] = dayRange.open.split(":").map(Number);
  const [closeH, closeM] = dayRange.close.split(":").map(Number);

  const cursor = new Date(date);
  cursor.setHours(openH, openM, 0, 0);

  const end = new Date(date);
  end.setHours(closeH, closeM, 0, 0);

  const slots: Slot[] = [];
  while (cursor < end) {
    const hh = String(cursor.getHours()).padStart(2, "0");
    const mm = String(cursor.getMinutes()).padStart(2, "0");
    const time = `${hh}:${mm}`;
    const isPast = cursor.getTime() <= now.getTime();
    const isTaken = takenTimes.has(time);
    slots.push({
      time,
      label: formatTime12h(time),
      available: !isPast && !isTaken,
    });
    cursor.setMinutes(cursor.getMinutes() + SLOT_MINUTES);
  }
  return slots;
}

export function normalizeTimeString(dbTime: string): string {
  return dbTime.slice(0, 5);
}

export function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseYMD(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Zona horaria oficial de los laboratorios. Todos los cálculos de
 * "hoy", "mañana", etc. deben usar esta TZ — no la del runtime.
 * Vercel ejecuta funciones en UTC; cerca de medianoche CDMX, `new Date()`
 * devolvería el día siguiente y los cálculos de "citas de hoy" fallarían.
 *
 * TODO: si se soporta multi-país, mover a lab.timezone.
 */
export const LAB_TIMEZONE = "America/Mexico_City";

/**
 * "Hoy" en formato YYYY-MM-DD, calculado en la zona horaria del lab.
 */
export function todayYMDInLabTz(
  now: Date = new Date(),
  timeZone: string = LAB_TIMEZONE,
): string {
  // Intl.DateTimeFormat con `en-CA` devuelve YYYY-MM-DD nativo.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Fecha actual como objeto Date interpretado en la TZ del lab.
 * Útil para cálculos que necesitan operar en "hoy local" en lugar de UTC.
 */
export function nowInLabTz(
  now: Date = new Date(),
  timeZone: string = LAB_TIMEZONE,
): Date {
  const ymd = todayYMDInLabTz(now, timeZone);
  const hhmm = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  const [y, m, d] = ymd.split("-").map(Number);
  const [hh, mm, ss] = hhmm.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, ss);
}
