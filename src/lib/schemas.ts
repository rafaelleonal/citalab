import { z } from "zod";

/**
 * Schemas compartidos entre cliente y servidor.
 * TODA server action DEBE validar su input con uno de estos schemas
 * antes de tocar la BD. Nunca confíes en el cliente.
 */

// ──────────────────────────────────────────────────────────────
// Primitivos
// ──────────────────────────────────────────────────────────────

export const uuidSchema = z.string().uuid("ID inválido");

/** YYYY-MM-DD (formato `date` de Postgres) */
export const ymdDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00`)), "Fecha inválida");

/** HH:MM (24h) */
export const hmTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida");

// ──────────────────────────────────────────────────────────────
// Paciente
// ──────────────────────────────────────────────────────────────

export const patientSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Nombre muy corto")
    .max(120, "Nombre muy largo"),
  patientPhone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Teléfono debe tener 10 dígitos"),
  patientEmail: z
    .string()
    .trim()
    .max(200)
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
});

export type PatientInput = z.infer<typeof patientSchema>;

// ──────────────────────────────────────────────────────────────
// Citas
// ──────────────────────────────────────────────────────────────

export const createAppointmentSchema = patientSchema.extend({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug inválido"),
  serviceIds: z
    .array(uuidSchema)
    .min(1, "Selecciona al menos un estudio")
    .max(30, "Demasiados estudios"),
  appointmentDate: ymdDateSchema,
  appointmentTime: hmTimeSchema,
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const manualAppointmentSchema = patientSchema.extend({
  serviceIds: z.array(uuidSchema).min(1).max(30),
  appointmentDate: ymdDateSchema,
  appointmentTime: hmTimeSchema,
});

export type ManualAppointmentInput = z.infer<typeof manualAppointmentSchema>;

export const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
]);

export const updateAppointmentStatusSchema = z.object({
  appointmentId: uuidSchema,
  status: appointmentStatusSchema,
});

// ──────────────────────────────────────────────────────────────
// Servicios (usado en onboarding y en dashboard/estudios)
// ──────────────────────────────────────────────────────────────

const priceRegex = /^\d{1,7}(\.\d{1,2})?$/;

export const serviceInputSchema = z
  .object({
    name: z.string().trim().min(2, "Nombre muy corto").max(120),
    code: z.string().trim().max(40).nullish(),
    category: z.string().trim().max(60).nullish(),
    description: z.string().trim().max(500).nullish(),
    price: z
      .string()
      .trim()
      .regex(priceRegex, "Precio inválido")
      .refine((s) => Number(s) >= 0 && Number(s) <= 999_999, "Precio fuera de rango"),
    durationMinutes: z
      .number()
      .int()
      .refine(
        (n) => [10, 15, 20, 30, 45].includes(n),
        "Duración debe ser 10, 15, 20, 30 o 45 min",
      ),
    requiresFasting: z.boolean(),
    fastingHours: z.number().int().min(0).max(48).nullish(),
    instructions: z.string().trim().max(1000).default(""),
  })
  .superRefine((val, ctx) => {
    if (val.requiresFasting && (val.instructions?.trim().length ?? 0) < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["instructions"],
        message: "Si requiere ayuno, agrega instrucciones (≥10 caracteres)",
      });
    }
  });

export type ServiceInput = z.infer<typeof serviceInputSchema>;

// ──────────────────────────────────────────────────────────────
// Onboarding
// ──────────────────────────────────────────────────────────────

const dayRangeSchema = z
  .object({ open: hmTimeSchema, close: hmTimeSchema })
  .refine((v) => v.open < v.close, "Hora de apertura debe ser antes del cierre")
  .nullable();

export const weeklyHoursSchema = z.object({
  monday: dayRangeSchema,
  tuesday: dayRangeSchema,
  wednesday: dayRangeSchema,
  thursday: dayRangeSchema,
  friday: dayRangeSchema,
  saturday: dayRangeSchema,
  sunday: dayRangeSchema,
});

export const onboardingPayloadSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(120),
  address: z.string().trim().max(300).default(""),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine(
      (s) => s === "" || /^\d{10}$/.test(s.replace(/\D/g, "")),
      "Teléfono inválido",
    )
    .default(""),
  hours: weeklyHoursSchema,
  services: z.array(serviceInputSchema).max(200),
});

export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>;
