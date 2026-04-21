import { Eyebrow, H2, H3, P } from "./primitives";

function FeatureCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border-[0.5px] border-line bg-white p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/** Miniatura de la página /[slug]/confirmacion real — ticket con fecha + estudios + referencia. */
function ConfirmationMock() {
  return (
    <div
      className="w-full max-w-[320px] overflow-hidden rounded-[14px] border-[0.5px] border-line bg-white"
      style={{
        boxShadow:
          "0 1px 0 rgba(17,17,17,0.03), 0 14px 40px rgba(17,17,17,0.06)",
      }}
    >
      {/* Confirmed chip */}
      <div className="px-4 pb-1 pt-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-leaf/20 bg-leaf-bg px-2 py-[3px] text-[10px] font-medium text-leaf">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
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
      </div>

      {/* Date + time */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-[52px] w-[46px] shrink-0 flex-col items-center justify-center rounded-[8px] bg-ink text-white">
          <span className="text-[7px] uppercase tracking-[0.1em] opacity-60">
            ABR
          </span>
          <span className="font-mono text-[20px] font-semibold leading-none tabular-nums">
            22
          </span>
          <span className="mt-0.5 text-[6px] uppercase tracking-[0.08em] opacity-45">
            MIÉ
          </span>
        </div>
        <div>
          <p className="text-[17px] font-semibold tracking-[-0.03em]">
            8:00 AM
          </p>
          <p className="mt-0.5 text-[11px] text-ink-mute">
            Llega 5 min antes · 20 min
          </p>
        </div>
      </div>

      {/* Perforation */}
      <div className="relative h-px">
        <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-bg-warm" />
        <div className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-bg-warm" />
        <div className="absolute left-3 right-3 top-0 border-t border-dashed border-line" />
      </div>

      {/* Studies */}
      <div className="px-4 py-3">
        <p className="mb-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-ink-mute">
          Estudios
        </p>
        <div className="flex justify-between py-0.5 text-[12px]">
          <span>Biometría hemática</span>
          <span className="font-mono tabular-nums text-ink-mute">$300</span>
        </div>
        <div className="flex justify-between py-0.5 text-[12px]">
          <span>Química 35</span>
          <span className="font-mono tabular-nums text-ink-mute">$650</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-2">
          <span className="text-[11px] text-ink-mute">Total</span>
          <span className="font-mono text-[14px] font-semibold tabular-nums">
            $950{" "}
            <span className="text-[10px] font-normal text-ink-mute">MXN</span>
          </span>
        </div>
      </div>

      {/* Ref code */}
      <div className="flex items-center justify-between border-t border-line bg-[#FCFAF5] px-4 py-2.5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-mute">
            Referencia
          </p>
          <p className="mt-0.5 font-mono text-[16px] font-medium tracking-[0.12em]">
            293ECE77
          </p>
        </div>
        <div className="flex h-7 items-center rounded-md bg-ink px-2.5 text-[10px] font-medium text-white">
          + Calendario
        </div>
      </div>
    </div>
  );
}

const STATUS_ROWS = [
  { tm: "08:00", n: "R. Tesét", st: "Atendido", c: "bg-leaf" },
  { tm: "09:00", n: "C. Ramírez", st: "Pendiente", c: "bg-[#C7A03A]" },
  { tm: "10:30", n: "S. Herrera", st: "No asistió", c: "bg-[#B86464]" },
];

const STUDIES = [
  ["BH", "$300"],
  ["Química 35", "$650"],
  ["EGO", "$180"],
  ["Perfil tiroideo", "$850"],
] as const;

const ONBOARDING_STEPS = [
  {
    n: "01",
    t: "Datos",
    d: "Nombre, slug, teléfono, dirección",
    done: true,
  },
  {
    n: "02",
    t: "Horarios",
    d: "Por día de la semana, partidos o corridos",
    done: true,
  },
  {
    n: "03",
    t: "Catálogo",
    d: "Importa o crea los tuyos",
    done: false,
  },
];

const STATS = [
  ["24/7", "agenda abierta"],
  ["45s", "para agendar"],
  [".ics", "al calendario"],
] as const;

export function LandingFeatures() {
  return (
    <section id="producto" className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mx-auto mb-12 max-w-[720px] text-center">
          <Eyebrow>Producto</Eyebrow>
          <H2 className="mt-3.5">
            Construido para laboratorios clínicos mexicanos.
          </H2>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-pretty text-ink-sub">
            No es un agendador genérico adaptado. CitaLab entiende ayunos,
            paquetes, horarios partidos y el idioma de tu equipo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <FeatureCard className="md:col-span-4">
            <Eyebrow>Página pública</Eyebrow>
            <H3 className="mt-2.5">Tu propio citalab.mx/tu-laboratorio</H3>
            <P>
              URL corta, personalizada y lista para compartir. Incluye tu
              dirección, horarios, catálogo de estudios con precios y ayunos.
              Optimizada para celular — el 87% de tus pacientes agenda desde
              ahí.
            </P>
            <div className="mt-5 flex items-center gap-[3px] rounded-[10px] border-[0.5px] border-line bg-surface-alt px-4 py-4 font-mono text-[14px] text-ink-sub">
              <span className="text-ink-mute">citalab.mx/</span>
              <span className="rounded-[4px] bg-[#FFE999] px-1 py-[2px] font-medium text-ink">
                santa-lucia
              </span>
              <span
                className="ml-0.5 inline-block h-[14px] w-[1.5px] bg-ink"
                style={{ animation: "cl-blink 1s steps(2) infinite" }}
              />
            </div>
          </FeatureCard>

          <FeatureCard className="md:col-span-2">
            <Eyebrow>Tablero de citas</Eyebrow>
            <H3 className="mt-2.5">Todo en una tabla.</H3>
            <P>Filtra por día, paciente o estado. Marca con un click.</P>
            <div className="mt-4 grid gap-1.5">
              {STATUS_ROWS.map((r) => (
                <div
                  key={r.tm}
                  className="flex items-center justify-between rounded-lg border-[0.5px] border-line bg-[#FCFAF5] px-3 py-2 text-[13px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-mono text-[12px] text-ink-mute">
                      {r.tm}
                    </span>
                    <span>{r.n}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-ink-sub">
                    <span className={`h-2 w-2 rounded-full ${r.c}`} />
                    {r.st}
                  </div>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard className="md:col-span-2">
            <Eyebrow>Catálogo</Eyebrow>
            <H3 className="mt-2.5">Estudios con superpoderes.</H3>
            <P>Precio, duración, si requiere ayuno. Paquetes con descuento.</P>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {STUDIES.map(([n, p]) => (
                <div
                  key={n}
                  className="flex items-center justify-between rounded-lg border-[0.5px] border-line bg-[#FCFAF5] px-3 py-2.5 text-[13px]"
                >
                  <span>{n}</span>
                  <span className="font-mono text-ink-sub">{p}</span>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard className="md:col-span-4">
            <Eyebrow>Onboarding en 10 minutos</Eyebrow>
            <H3 className="mt-2.5">
              Importa 20 estudios comunes con un click.
            </H3>
            <P>
              Tres pasos: datos del lab → horarios por día → catálogo. Empiezas
              con la lista de estudios mexicanos más comunes precargada, y
              ajustas precios en segundos.
            </P>
            <div className="mt-4 flex items-stretch gap-3">
              {ONBOARDING_STEPS.map((s) => (
                <div
                  key={s.n}
                  className={
                    s.done
                      ? "flex-1 rounded-[10px] border-[0.5px] border-ink bg-ink p-3 text-white"
                      : "flex-1 rounded-[10px] border-[0.5px] border-line bg-[#FCFAF5] p-3 text-ink"
                  }
                >
                  <div
                    className={`mb-2 font-mono text-[10px] ${
                      s.done ? "text-white/55" : "text-ink-mute"
                    }`}
                  >
                    {s.n}
                  </div>
                  <div className="mb-[3px] text-[13px] font-medium">{s.t}</div>
                  <div
                    className={`text-[11.5px] leading-[1.4] ${
                      s.done ? "text-white/55" : "text-ink-mute"
                    }`}
                  >
                    {s.d}
                  </div>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard className="md:col-span-6">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <Eyebrow>Confirmación instantánea</Eyebrow>
                <h3 className="mt-2.5 text-[30px] font-semibold leading-[1.08] tracking-[-0.8px]">
                  El paciente sabe a qué ir, desde el segundo cero.
                </h3>
                <p className="mt-3 max-w-[460px] text-[14.5px] text-ink-sub">
                  Al terminar de agendar, ve su cita confirmada con fecha, hora,
                  código de referencia, ayuno requerido y ruta al lab. La agrega
                  a su calendario con un click. Sin esperar SMS ni llamadas de
                  vuelta.
                </p>
                <div className="mt-5 flex flex-wrap gap-6 text-[13px] text-ink-mute">
                  {STATS.map(([n, l]) => (
                    <span key={l}>
                      <strong className="block text-[22px] font-semibold text-ink">
                        {n}
                      </strong>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <ConfirmationMock />
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
