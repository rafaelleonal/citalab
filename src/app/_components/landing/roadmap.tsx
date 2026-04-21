import { Eyebrow, H2 } from "./primitives";

type Status = "live" | "next" | "later";

const ITEMS: { q: string; title: string; desc: string; status: Status }[] = [
  {
    q: "Hoy",
    title: "Agendado + confirmación + dashboard",
    desc: "Página pública, wizard de 3 pasos, confirmación con .ics, panel para recepción y catálogo editable.",
    status: "live",
  },
  {
    q: "Q2 2026",
    title: "Recordatorios por WhatsApp",
    desc: "Aviso la noche anterior con hora, ayuno y ruta. Baja el ‘no asistió’ sin mover un dedo.",
    status: "next",
  },
  {
    q: "Q3 2026",
    title: "Pagos en línea",
    desc: "Cobra la cita al agendar con tarjeta o SPEI. Compatible con terminales existentes.",
    status: "later",
  },
  {
    q: "Q4 2026",
    title: "Reportes e integraciones",
    desc: "Analytics de ocupación e ingresos, export a Excel y API para tu LIS.",
    status: "later",
  },
];

const STATUS_STYLES: Record<Status, { badge: string; dot: string; label: string }> = {
  live: {
    badge: "border-leaf/20 bg-leaf-bg text-leaf",
    dot: "bg-leaf",
    label: "Disponible",
  },
  next: {
    badge: "border-brand-accent/30 bg-brand-accent/10 text-brand-accent",
    dot: "bg-brand-accent",
    label: "Siguiente",
  },
  later: {
    badge: "border-line-strong bg-surface-alt text-ink-mute",
    dot: "bg-ink-faint",
    label: "En roadmap",
  },
};

export function LandingRoadmap() {
  return (
    <section id="roadmap" className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mx-auto mb-12 max-w-[720px] text-center">
          <Eyebrow>Roadmap</Eyebrow>
          <H2 className="mt-3.5">
            Lo que ya hace, y lo que viene.
          </H2>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-pretty text-ink-sub">
            Construimos en público. Si entras hoy, tu feedback define qué
            priorizamos — y mantienes el precio de lanzamiento de por vida.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-[14px] border-[0.5px] border-line bg-line md:grid-cols-4">
          {ITEMS.map((it) => {
            const s = STATUS_STYLES[it.status];
            return (
              <div
                key={it.title}
                className="flex flex-col gap-3 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.8px] text-ink-mute">
                    {it.q}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border-[0.5px] px-2 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.4px] ${s.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold leading-[1.2] tracking-[-0.3px]">
                  {it.title}
                </h3>
                <p className="text-[13.5px] leading-[1.5] text-ink-sub">
                  {it.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
