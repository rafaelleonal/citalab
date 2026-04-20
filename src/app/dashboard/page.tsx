import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { and, asc, desc, eq, gte, inArray, lt, lte } from "drizzle-orm";
import { db } from "@/db";
import { appointments, appointmentServices, services } from "@/db/schema";
import { requireLab } from "@/lib/auth-helpers";
import { formatDateYMD, parseYMD } from "@/lib/hours";
import { CitasView } from "./_components/citas-view";
import type { AppointmentRow } from "./_components/appointments-table";
import type { ServiceOption } from "./_components/manual-appointment-dialog";

type RangeKey = "today" | "tomorrow" | "week" | "date";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; range?: string }>;
}) {
  const lab = await requireLab();
  const sp = await searchParams;

  const today = new Date();
  const todayYMD = formatDateYMD(today);
  const tomorrowYMD = formatDateYMD(addDays(today, 1));
  const weekEndYMD = formatDateYMD(addDays(today, 6));

  const rangeRaw = sp.range as RangeKey | undefined;
  const range: RangeKey =
    rangeRaw === "tomorrow" ||
    rangeRaw === "week" ||
    rangeRaw === "date"
      ? rangeRaw
      : "today";

  const selectedDate =
    sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : todayYMD;

  let dateWhere;
  let rangeLabel: string;
  if (range === "today") {
    dateWhere = eq(appointments.appointmentDate, todayYMD);
    rangeLabel = "Hoy";
  } else if (range === "tomorrow") {
    dateWhere = eq(appointments.appointmentDate, tomorrowYMD);
    rangeLabel = "Mañana";
  } else if (range === "week") {
    dateWhere = and(
      gte(appointments.appointmentDate, todayYMD),
      lte(appointments.appointmentDate, weekEndYMD)
    );
    rangeLabel = "Esta semana";
  } else {
    dateWhere = eq(appointments.appointmentDate, selectedDate);
    rangeLabel = format(parseYMD(selectedDate), "d 'de' MMM", { locale: es });
  }

  const dayAppointments = await db
    .select({
      id: appointments.id,
      date: appointments.appointmentDate,
      time: appointments.appointmentTime,
      patientName: appointments.patientName,
      patientPhone: appointments.patientPhone,
      status: appointments.status,
    })
    .from(appointments)
    .where(and(eq(appointments.labId, lab.id), dateWhere))
    .orderBy(
      asc(appointments.appointmentDate),
      asc(appointments.appointmentTime)
    );

  let rows: AppointmentRow[] = [];

  if (dayAppointments.length > 0) {
    const appointmentIds = dayAppointments.map((a) => a.id);
    const serviceLinks = await db
      .select({
        appointmentId: appointmentServices.appointmentId,
        serviceId: services.id,
        name: services.name,
        price: services.price,
        requiresFasting: services.requiresFasting,
      })
      .from(appointmentServices)
      .innerJoin(services, eq(services.id, appointmentServices.serviceId))
      .where(inArray(appointmentServices.appointmentId, appointmentIds));

    const byAppointment = new Map<string, AppointmentRow["services"]>();
    const totalByAppointment = new Map<string, number>();
    for (const link of serviceLinks) {
      const list = byAppointment.get(link.appointmentId) ?? [];
      list.push({
        id: link.serviceId,
        name: link.name,
        requiresFasting: link.requiresFasting,
      });
      byAppointment.set(link.appointmentId, list);
      totalByAppointment.set(
        link.appointmentId,
        (totalByAppointment.get(link.appointmentId) ?? 0) + Number(link.price)
      );
    }

    const uniquePhones = Array.from(
      new Set(dayAppointments.map((a) => a.patientPhone))
    );
    const priorCounts = new Map<string, number>();
    if (uniquePhones.length > 0) {
      const prior = await db
        .select({
          phone: appointments.patientPhone,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.labId, lab.id),
            inArray(appointments.patientPhone, uniquePhones),
            lt(appointments.appointmentDate, todayYMD)
          )
        );
      for (const p of prior) {
        priorCounts.set(p.phone, (priorCounts.get(p.phone) ?? 0) + 1);
      }
    }

    rows = dayAppointments.map((a) => ({
      id: a.id,
      date: a.date,
      time: a.time,
      patientName: a.patientName,
      patientPhone: a.patientPhone,
      status: a.status,
      services: byAppointment.get(a.id) ?? [],
      total: totalByAppointment.get(a.id) ?? 0,
      priorVisits: priorCounts.get(a.patientPhone) ?? 0,
    }));
  }

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    projectedRevenue: rows
      .filter((r) => r.status !== "cancelled" && r.status !== "no_show")
      .reduce((sum, r) => sum + r.total, 0),
  };

  const labServicesRaw = await db
    .select({
      id: services.id,
      name: services.name,
      price: services.price,
      requiresFasting: services.requiresFasting,
    })
    .from(services)
    .where(and(eq(services.labId, lab.id), eq(services.active, true)))
    .orderBy(asc(services.name));

  const labServices: ServiceOption[] = labServicesRaw;

  const recentActivityRaw = await db
    .select({
      id: appointments.id,
      patientName: appointments.patientName,
      status: appointments.status,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      date: appointments.appointmentDate,
      time: appointments.appointmentTime,
    })
    .from(appointments)
    .where(eq(appointments.labId, lab.id))
    .orderBy(desc(appointments.updatedAt))
    .limit(6);

  const recentActivity = recentActivityRaw.map((r) => ({
    id: r.id,
    patientName: r.patientName,
    status: r.status,
    date: r.date,
    time: r.time,
    at: r.updatedAt.toISOString(),
    isNew: r.updatedAt.getTime() === r.createdAt.getTime(),
  }));

  return (
    <CitasView
      lab={{ slug: lab.slug, name: lab.name }}
      rows={rows}
      stats={stats}
      labServices={labServices}
      range={range}
      selectedDate={selectedDate}
      rangeLabel={rangeLabel}
      recentActivity={recentActivity}
    />
  );
}
