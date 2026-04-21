import { notFound } from "next/navigation";
import { and, asc, eq, gte, ne } from "drizzle-orm";
import { db } from "@/db";
import { labs, services, appointments } from "@/db/schema";
import { todayYMDInLabTz } from "@/lib/hours";
import { isSubscriptionActive, resolveSubscriptionState } from "@/lib/subscription";
import { BookingWizard } from "./_components/booking-wizard";
import { LabPaused } from "../_components/lab-paused";

export default async function AgendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [lab] = await db.select().from(labs).where(eq(labs.slug, slug)).limit(1);
  if (!lab) notFound();
  if (!lab.hours) notFound();

  lab.subscriptionStatus = resolveSubscriptionState(lab);
  if (!isSubscriptionActive(lab)) {
    return <LabPaused labName={lab.name} />;
  }

  const labServices = await db
    .select({
      id: services.id,
      name: services.name,
      price: services.price,
      durationMinutes: services.durationMinutes,
      requiresFasting: services.requiresFasting,
      instructions: services.instructions,
    })
    .from(services)
    .where(and(eq(services.labId, lab.id), eq(services.active, true)))
    .orderBy(asc(services.name));

  const today = todayYMDInLabTz();

  const takenAppointments = await db
    .select({
      date: appointments.appointmentDate,
      time: appointments.appointmentTime,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.labId, lab.id),
        gte(appointments.appointmentDate, today),
        ne(appointments.status, "cancelled")
      )
    );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-5 py-5 pb-10">
        <BookingWizard
          slug={slug}
          labName={lab.name}
          labHours={lab.hours}
          services={labServices}
          takenAppointments={takenAppointments.map((a) => ({
            date: a.date,
            time: a.time.slice(0, 5),
          }))}
        />
      </div>
    </main>
  );
}
