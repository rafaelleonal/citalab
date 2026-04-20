import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { and, asc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/db";
import { labs, services } from "@/db/schema";
import { groupHoursForDisplay } from "@/lib/hours";
import { ServicesList } from "./_components/services-list";

function formatMxPhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return raw;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}

/** Check if lab is currently open */
function isOpenNow(
  hours: NonNullable<(typeof labs.$inferSelect)["hours"]>
): { open: boolean; closeLabel?: string } {
  const now = new Date();
  const dayKeys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const;
  const dayKey = dayKeys[now.getDay()];
  const todayRange = hours[dayKey];
  if (!todayRange) return { open: false };

  const [oh, om] = todayRange.open.split(":").map(Number);
  const [ch, cm] = todayRange.close.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;

  if (nowMins >= openMins && nowMins < closeMins) {
    const h = ch;
    const m = cm;
    const period = h < 12 ? "AM" : "PM";
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return {
      open: true,
      closeLabel: `Cierra ${display}:${String(m).padStart(2, "0")} ${period}`,
    };
  }
  return { open: false };
}

export default async function LabLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [lab] = await db.select().from(labs).where(eq(labs.slug, slug)).limit(1);
  if (!lab) notFound();

  const labServices = await db
    .select({
      id: services.id,
      name: services.name,
      price: services.price,
      durationMinutes: services.durationMinutes,
      requiresFasting: services.requiresFasting,
    })
    .from(services)
    .where(and(eq(services.labId, lab.id), eq(services.active, true)))
    .orderBy(asc(services.name));

  const hoursRows = lab.hours ? groupHoursForDisplay(lab.hours) : [];
  const openStatus = lab.hours ? isOpenNow(lab.hours) : { open: false };

  const mapsQuery = encodeURIComponent(lab.address ?? lab.name);
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const mapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* ── Topbar ── */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <Logo size={15} />
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: openStatus.open ? "#0B6E4F" : "#C7C4BC" }}
          />
          {openStatus.open ? "Agenda abierta" : "Agenda cerrada"}
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="px-5 pb-6 pt-4">
        <p className="mb-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Laboratorio clínico
        </p>
        <h1
          className="mb-2.5 text-[2.1rem] font-semibold leading-[1.05] tracking-[-0.045em] text-foreground"
        >
          {lab.name}
        </h1>
        <p className="mb-5 max-w-sm text-[15px] text-muted-foreground">
          Sin filas, sin llamadas. Agenda tu cita en menos de un minuto.
        </p>

        <div className="flex items-stretch gap-2">
          <Link
            href={`/${slug}/agendar`}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-foreground text-[14px] font-medium text-background"
          >
            Agendar cita
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          {lab.phone && (
            <a
              href={`tel:${lab.phone.replace(/\D/g, "")}`}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
              aria-label="Llamar al laboratorio"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3.8c0-.5.4-1 .9-1h1.6c.4 0 .8.3.9.7l.6 2.1c.1.4-.1.8-.4 1l-1 .7c.8 1.6 2 2.8 3.6 3.6l.7-1c.2-.3.6-.5 1-.4l2.1.6c.4.1.7.5.7.9v1.6c0 .5-.5.9-1 .9C6.5 13.5 2.5 9.5 3 3.8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* ── Map / Address card ── */}
      {lab.address && (
        <div className="px-5 pb-5">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Static street-map SVG */}
            <div className="relative h-36 bg-[#EBE6DC]">
              <svg width="100%" height="100%" viewBox="0 0 350 144" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <rect x="0" y="0" width="90" height="52" fill="#F5F0E5"/>
                <rect x="95" y="0" width="110" height="44" fill="#F5F0E5"/>
                <rect x="210" y="0" width="140" height="50" fill="#F5F0E5"/>
                <rect x="0" y="64" width="80" height="40" fill="#F5F0E5"/>
                <rect x="85" y="58" width="130" height="52" fill="#F5F0E5"/>
                <rect x="220" y="60" width="130" height="48" fill="#F5F0E5"/>
                <rect x="0" y="116" width="100" height="28" fill="#F5F0E5"/>
                <rect x="105" y="120" width="120" height="24" fill="#F5F0E5"/>
                <rect x="230" y="114" width="120" height="30" fill="#F5F0E5"/>
                <rect x="218" y="60" width="52" height="48" fill="#DCE5CE"/>
                <rect x="0" y="52" width="350" height="6" fill="#fff"/>
                <rect x="0" y="110" width="350" height="6" fill="#fff"/>
                <rect x="90" y="0" width="5" height="144" fill="#fff"/>
                <rect x="215" y="0" width="5" height="144" fill="#fff"/>
                <rect x="0" y="78" width="350" height="10" fill="#FFE8A8"/>
                <line x1="0" y1="83" x2="350" y2="83" stroke="#fff" strokeWidth="0.6" strokeDasharray="4 4"/>
                <path d="M40 130 L90 130 L90 83 L178 83" stroke="#1A73E8" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                <circle cx="40" cy="130" r="5" fill="#1A73E8" stroke="#fff" strokeWidth="2"/>
              </svg>
              {/* Pin */}
              <div className="absolute" style={{ left: "51%", top: "83px", transform: "translate(-50%,-100%)" }}>
                <svg width="20" height="27" viewBox="0 0 22 30">
                  <path d="M11 0C4.9 0 0 4.9 0 11c0 8.2 11 19 11 19s11-10.8 11-19C22 4.9 17.1 0 11 0z" fill="#111"/>
                  <circle cx="11" cy="11" r="4.5" fill="#FFF"/>
                </svg>
              </div>
              <p className="absolute bottom-1 left-2 font-sans text-[8px] text-black/40">Google</p>
            </div>

            {/* Address + actions */}
            <div className="p-3.5">
              <div className="mb-3 flex items-start gap-2.5">
                <svg className="mt-0.5 shrink-0 text-muted-foreground" width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14s5-4.5 5-8.5A5 5 0 003 5.5C3 9.5 8 14 8 14z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <circle cx="8" cy="5.8" r="1.6" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{lab.address}</p>
                  {lab.phone && (
                    <p className="mt-0.5 font-mono text-[12px] tabular-nums text-muted-foreground">
                      {formatMxPhone(lab.phone)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={mapsDirUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-background text-[12px] font-medium text-foreground"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M1 6l10-5-4 10-1.5-3.5L1 6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  Cómo llegar
                </a>
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-background text-[12px] font-medium text-foreground"
                >
                  Abrir en Maps
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Hours ── */}
      {hoursRows.length > 0 && (
        <div className="px-5 pb-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Horarios
            </p>
            {openStatus.open && (
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "#0B6E4F" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#0B6E4F" }} />
                Abierto · {openStatus.closeLabel}
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {hoursRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${
                  i !== hoursRows.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-foreground">{row.label}</span>
                <span className={`font-mono tabular-nums text-[12px] ${row.range === "Cerrado" || row.range === null ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                  {row.range ?? "Cerrado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Services ── */}
      <div className="px-5 pb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Estudios disponibles
          </p>
          {labServices.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {labServices.length} {labServices.length === 1 ? "estudio" : "estudios"}
            </span>
          )}
        </div>
        {labServices.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-10 text-center text-sm text-muted-foreground">
            Aún no hay estudios publicados.
          </p>
        ) : (
          <ServicesList services={labServices} />
        )}
      </div>

      {/* ── Dark CTA card ── */}
      <div className="px-5 pb-7">
        <div className="relative overflow-hidden rounded-[14px] bg-foreground px-5 py-5 text-background">
          {/* Decorative rings */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/[0.08]" />
          <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full border border-white/[0.05]" />

          <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.07em] text-white/50">
            Agenda en 3 pasos
          </p>
          <p className="mb-4 text-[1.4rem] font-semibold leading-[1.1] tracking-[-0.04em]">
            Tu cita, lista<br />en 45 segundos.
          </p>
          <Link
            href={`/${slug}/agendar`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-[14px] font-medium text-foreground"
          >
            Empezar
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <div className="mt-3.5 flex gap-4 text-[11px] text-white/50">
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M8 2l5 2v4.5c0 3-2.2 4.8-5 5.5-2.8-.7-5-2.5-5-5.5V4l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              Datos cifrados
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M8 1L3 8h3l-1 5 5-7H7l1-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Sin registro
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 pb-8 pt-1 text-[11px] text-muted-foreground">
        <span>© {lab.name}</span>
        <span className="flex items-center gap-1">
          Con
          <Logo size={11} color="#8B8A83" style={{ marginLeft: 4 }} />
        </span>
      </div>
    </main>
  );
}
