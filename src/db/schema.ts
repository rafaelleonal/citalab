import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  date,
  time,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export type WeeklyHours = {
  monday: { open: string; close: string } | null;
  tuesday: { open: string; close: string } | null;
  wednesday: { open: string; close: string } | null;
  thursday: { open: string; close: string } | null;
  friday: { open: string; close: string } | null;
  saturday: { open: string; close: string } | null;
  sunday: { open: string; close: string } | null;
};

export const labs = pgTable("labs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address"),
  phone: text("phone"),
  hours: jsonb("hours").$type<WeeklyHours>(),
  slotMinutes: integer("slot_minutes").default(30).notNull(),
  minLeadHours: integer("min_lead_hours").default(0).notNull(),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  labId: uuid("lab_id")
    .references(() => labs.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  code: text("code"),
  category: text("category"),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").default(15).notNull(),
  requiresFasting: boolean("requires_fasting").default(false).notNull(),
  fastingHours: integer("fasting_hours"),
  instructions: text("instructions"),
  active: boolean("active").default(true).notNull(),
  isPackage: boolean("is_package").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const packageItems = pgTable(
  "package_items",
  {
    packageId: uuid("package_id")
      .references(() => services.id, { onDelete: "cascade" })
      .notNull(),
    serviceId: uuid("service_id")
      .references(() => services.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.packageId, table.serviceId] }),
  }),
);

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  labId: uuid("lab_id")
    .references(() => labs.id, { onDelete: "cascade" })
    .notNull(),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  patientEmail: text("patient_email"),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appointmentServices = pgTable(
  "appointment_services",
  {
    appointmentId: uuid("appointment_id")
      .references(() => appointments.id, { onDelete: "cascade" })
      .notNull(),
    serviceId: uuid("service_id")
      .references(() => services.id, { onDelete: "cascade" })
      .notNull(),
    priceSnapshot: numeric("price_snapshot", {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.appointmentId, table.serviceId] }),
  }),
);

export type Lab = typeof labs.$inferSelect;
export type NewLab = typeof labs.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type AppointmentService = typeof appointmentServices.$inferSelect;
export type NewAppointmentService = typeof appointmentServices.$inferInsert;

export type PackageItem = typeof packageItems.$inferSelect;
export type NewPackageItem = typeof packageItems.$inferInsert;

/**
 * Rate limit: una fila por intento. Se limpia periódicamente.
 * `key` = identificador del bucket (ej. `create-appt:ip:1.2.3.4`,
 *         `create-appt:slug:santa-lucia`).
 */
export const rateLimitHits = pgTable(
  "rate_limit_hits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    keyCreatedIdx: index("rate_limit_hits_key_created_idx").on(
      table.key,
      table.createdAt,
    ),
  }),
);
