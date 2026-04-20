import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { and, eq } from "drizzle-orm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/db";
import {
  labs,
  services,
  appointments,
  appointmentServices,
} from "@/db/schema";
import { formatTime12h, parseYMD } from "@/lib/hours";
import { verifyAppointmentToken } from "@/lib/confirmation-token";

// No cachear ni permitir robots: página con PII.
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false, nocache: true },
};

function formatMxPhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return raw;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildIcs(params: {
  uid: string;
  start: Date;
  durationMinutes: number;
  summary: string;
  description: string;
  location: string;
}): string {
  const { uid, start, durationMinutes, summary, description, location } = params;
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const fmtLocal = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const now = new Date();
  const fmtUtc = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//citalab//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmtUtc(now)}`,
    `DTSTART:${fmtLocal(start)}`,
    `DTEND:${fmtLocal(end)}`,
    `SUMMARY:${escape(summary)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default async function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug, id } = await params;
  const { t } = await searchParams;

  // Verificar token HMAC antes de cualquier query: sin token válido,
  // respondemos 404 para no filtrar si la cita existe o no (C1).
  if (!verifyAppointmentToken(id, t)) notFound();

  const [lab] = await db.select().from(labs).where(eq(labs.slug, slug)).limit(1);
  if (!lab) notFound();

  const [appointment] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.labId, lab.id)))
    .limit(1);
  if (!appointment) notFound();

  const appointmentServiceRows = await db
    .select({
      id: services.id,
      name: services.name,
      durationMinutes: services.durationMinutes,
      requiresFasting: services.requiresFasting,
      instructions: services.instructions,
      priceSnapshot: appointmentServices.priceSnapshot,
    })
    .from(appointmentServices)
    .innerJoin(services, eq(services.id, appointmentServices.serviceId))
    .where(eq(appointmentServices.appointmentId, appointment.id));

  const fastingServices = appointmentServiceRows.filter((s) => s.requiresFasting);
  const total = appointmentServiceRows.reduce(
    (sum, s) => sum + Number(s.priceSnapshot),
    0
  );
  const totalDuration = appointmentServiceRows.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 15),
    0
  );

  const dateObj = parseYMD(appointment.appointmentDate);
  const dayOfWeek = format(dateObj, "EEEE", { locale: es }); // "miércoles"
  const dayNum = format(dateObj, "d");
  const monthLabel = format(dateObj, "MMM", { locale: es });
  const fullDate = format(dateObj, "EEEE d 'de' MMMM", { locale: es });
  const timeLabel = formatTime12h(appointment.appointmentTime.slice(0, 5));
  const shortRef = appointment.id.slice(0, 8).toUpperCase();
  const firstName = appointment.patientName.split(" ")[0] ?? appointment.patientName;

  const [h, m] = appointment.appointmentTime.split(":").map(Number);
  const start = new Date(dateObj);
  start.setHours(h ?? 8, m ?? 0, 0, 0);

  const icsDescription = [
    `Referencia: ${shortRef}`,
    "",
    "Estudios:",
    ...appointmentServiceRows.map((s) => `• ${s.name}`),
    "",
    `Total: $${total.toLocaleString("es-MX")} MXN`,
    ...(fastingServices.length > 0
      ? [
          "",
          "Preparación requerida:",
          ...fastingServices.map(
            (s) => `• ${s.name}: ${s.instructions ?? "Ayuno requerido"}`
          ),
        ]
      : []),
  ].join("\n");

  const icsContent = buildIcs({
    uid: `${appointment.id}@citalab`,
    start,
    durationMinutes: totalDuration || 15,
    summary: `Cita · ${lab.name}`,
    description: icsDescription,
    location: lab.address ?? lab.name,
  });
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  const shareText = [
    `Mi cita en ${lab.name}`,
    `${fullDate} · ${timeLabel}`,
    `Ref: ${shortRef}`,
    ...(lab.address ? [lab.address] : []),
  ].join("\n");
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const mapsQuery = encodeURIComponent(lab.address ?? lab.name);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {/* ── Header band ── */}
      <div
        className="relative overflow-hidden px-5 pb-5 pt-6"
        style={{
          background: "linear-gradient(180deg, #F0EDE6 0%, #FAF7F2 100%)",
          borderBottom: "0.5px solid rgba(17,17,17,0.08)",
        }}
      >
        {/* Confirmed chip */}
        <div
          className="mb-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            background: "#E7F0EB",
            color: "#0B6E4F",
            border: "0.5px solid rgba(11,110,79,0.18)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5l3 3 6-6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Cita confirmada
        </div>

        <h1 className="mb-2 text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.045em] text-foreground">
          Nos vemos el<br />
          {dayOfWeek}, {firstName}.
        </h1>
        <p className="max-w-xs text-[13px] text-muted-foreground">
          Guarda esta referencia por si acaso. Te avisaremos antes de tu cita.
        </p>
      </div>

      <div className="px-5 py-5 space-y-3">
        {/* ── Ticket card ── */}
        <div
          className="relative overflow-hidden rounded-[14px] border border-border bg-card"
          style={{ boxShadow: "0 1px 0 rgba(17,17,17,0.03), 0 14px 40px rgba(17,17,17,0.06)" }}
        >
          {/* Date + time */}
          <div className="flex items-center gap-3.5 px-4.5 py-4" style={{ padding: "18px 18px 16px" }}>
            <div
              className="flex h-[62px] w-[56px] shrink-0 flex-col items-center justify-center rounded-[10px]"
              style={{ background: "#111", color: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}
            >
              <span className="text-[8px] uppercase tracking-[0.1em] opacity-60">{monthLabel}</span>
              <span className="font-mono text-[24px] font-semibold leading-none tabular-nums">{dayNum}</span>
              <span className="mt-0.5 text-[7px] uppercase tracking-[0.08em] opacity-45">
                {format(dateObj, "EEE", { locale: es })}
              </span>
            </div>
            <div>
              <p className="text-[20px] font-semibold tracking-[-0.04em] text-foreground">
                {timeLabel}
              </p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Llega 5 min antes · {totalDuration} min aprox.
              </p>
            </div>
          </div>

          {/* Perforated divider */}
          <div className="relative h-px">
            <div
              className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full"
              style={{ background: "#FAF7F2" }}
            />
            <div
              className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full"
              style={{ background: "#FAF7F2" }}
            />
            <div
              className="absolute left-3 right-3 top-0 border-t border-dashed border-border"
            />
          </div>

          {/* Studies */}
          <div className="px-[18px] py-[16px]">
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Estudios
            </p>
            {appointmentServiceRows.map((s) => (
              <div key={s.id} className="flex justify-between py-1 text-[13px]">
                <span className="text-foreground">{s.name}</span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  ${Number(s.priceSnapshot).toLocaleString("es-MX")}
                </span>
              </div>
            ))}
            <div className="mt-2.5 flex justify-between border-t border-border pt-2.5">
              <span className="text-[12px] text-muted-foreground">
                Total a pagar en sitio
              </span>
              <span className="font-mono text-[16px] font-semibold tabular-nums text-foreground">
                ${total.toLocaleString("es-MX")}{" "}
                <span className="text-[11px] font-normal text-muted-foreground">MXN</span>
              </span>
            </div>
          </div>

          {/* Reference code */}
          <div
            className="flex items-center justify-between border-t border-border px-[18px] py-3"
            style={{ background: "#FCFAF5" }}
          >
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.08em]"
                style={{ color: "#8B8A83" }}
              >
                Código de referencia
              </p>
              <p className="mt-0.5 font-mono text-[20px] font-medium tracking-[0.12em] text-foreground">
                {shortRef}
              </p>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card"
              aria-label="Copiar código"
              onClick={undefined}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="4.5" y="4.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2.5 9V3a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={icsHref}
            download={`cita-${shortRef}.ics`}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-foreground text-[13px] font-medium text-background"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M2.5 6.5h11M5.5 2.5v2M10.5 2.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Al calendario
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-[13px] font-medium text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="4" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="12" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="12" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5.5 7.2l5-2.4M5.5 8.8l5 2.4" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            Compartir
          </a>
        </div>

        {/* ── Preparation timeline ── */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Cómo prepararte
          </p>
          {[
            {
              when: "Hoy",
              text: "Agenda activada. Revisa tu WhatsApp para confirmación.",
              done: true,
            },
            ...(fastingServices.length > 0
              ? [
                  {
                    when: `${format(dateObj, "EEE", { locale: es })} · 12:00 AM`,
                    text: "Empieza tu ayuno de 8 horas. Solo agua permitida.",
                    done: false,
                  },
                ]
              : []),
            {
              when: `${format(dateObj, "EEE d MMM", { locale: es })} · ${timeLabel}`,
              text: "Llega al laboratorio con identificación oficial.",
              done: false,
              last: true,
            },
          ].map((s, i, arr) => (
            <div key={i} className="flex gap-3">
              <div className="flex w-4 flex-col items-center">
                <div
                  className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
                  style={{
                    border: `1.5px solid ${s.done ? "#111" : "#C7C4BC"}`,
                    background: s.done ? "#111" : "#FAF7F2",
                  }}
                >
                  {s.done && (
                    <svg width="7" height="7" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 8.5l3 3 6-6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                {i !== arr.length - 1 && (
                  <div className="mt-0.5 flex-1 w-px bg-border" style={{ minHeight: 22 }} />
                )}
              </div>
              <div className="flex-1 pb-3.5">
                <p className="font-mono text-[10.5px] text-muted-foreground">{s.when}</p>
                <p className="mt-0.5 text-[13.5px] text-foreground">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Fasting warning ── */}
        {fastingServices.length > 0 && (
          <div
            className="flex items-start gap-2.5 rounded-xl p-3.5"
            style={{
              background: "#F5EBD9",
              border: "0.5px solid rgba(138,90,26,0.18)",
            }}
          >
            <svg
              className="mt-0.5 shrink-0"
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              style={{ color: "#8A5A1A" }}
            >
              <path d="M8 2l6.5 11.5h-13L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M8 6.5v3M8 11.4v.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-[12.5px] leading-relaxed" style={{ color: "#8A5A1A" }}>
                <strong className="font-semibold">Ayuno de 8 horas.</strong>{" "}
                Sin comida ni bebidas azucaradas desde las 12 AM de{" "}
                {format(dateObj, "EEEE", { locale: es })}. Puedes tomar agua.
              </p>
              {fastingServices.map((s) =>
                s.instructions ? (
                  <p key={s.id} className="mt-1 text-[11.5px]" style={{ color: "#8A5A1A" }}>
                    · {s.name}: {s.instructions}
                  </p>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* ── Lab location card ── */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: "#111" }}
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1.5c2 2.5 4 4.5 4 7a4 4 0 01-8 0c0-2.5 2-4.5 4-7z"
                stroke="#fff"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-foreground">{lab.name}</p>
            {lab.address && (
              <p className="mt-0.5 text-[11.5px] text-muted-foreground truncate">
                {lab.address}
              </p>
            )}
          </div>
          {lab.address && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 shrink-0 items-center rounded-md border border-border bg-background px-3 text-[12px] font-medium text-foreground"
            >
              Ruta
            </a>
          )}
        </div>

        {/* ── Reprogramar / Cancelar ── */}
        <div className="flex items-center justify-center gap-3 py-2 text-[12px] text-muted-foreground">
          <span>¿Necesitas cambiar algo?</span>
          <Link
            href={`/${slug}/agendar`}
            className="text-foreground underline underline-offset-2"
          >
            Reprogramar
          </Link>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center gap-1.5 pb-4 pt-1 text-[10px] text-muted-foreground">
          Agendado con
          <Logo size={11} color="#8B8A83" />
        </div>
      </div>
    </main>
  );
}
