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
  ["73%", "menos ausencias"],
  ["24/7", "agenda abierta"],
  ["45s", "para agendar"],
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
            <P>
              Precio, duración, si requiere ayuno. Paquetes con descuento.
            </P>
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
                  <div className="mb-[3px] text-[13px] font-medium">
                    {s.t}
                  </div>
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
                <Eyebrow>Recordatorios automáticos</Eyebrow>
                <h3 className="mt-2.5 text-[30px] font-semibold leading-[1.08] tracking-[-0.8px]">
                  Tus pacientes no faltan a sus citas.
                </h3>
                <p className="mt-3 max-w-[460px] text-[14.5px] text-ink-sub">
                  La noche anterior reciben un recordatorio por WhatsApp con la
                  hora, dirección, código de referencia y las instrucciones de
                  ayuno específicas de sus estudios. Reduce los &ldquo;no
                  asistió&rdquo; hasta un 73%.
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
              <div className="flex flex-col items-start">
                <div
                  className="max-w-[280px] bg-[#DCF8C6] p-3.5 text-[13px] text-[#202C33]"
                  style={{ borderRadius: "12px 12px 12px 2px" }}
                >
                  <div className="mb-[3px] text-[11.5px] font-semibold text-[#075E54]">
                    CitaLab · Lab Santa Lucía
                  </div>
                  Hola Rafael 👋 Te esperamos mañana a las 8:00 AM.
                  <br />
                  <br />
                  <strong>⚠ Ayuno de 8 horas.</strong> Sin alimentos desde las
                  12:00 AM. Agua sí está permitida.
                  <br />
                  <br />
                  📍 Av. Álvaro Obregón 121
                  <br />
                  Ref: 293-ECE77
                  <div className="mt-1 text-right font-mono text-[10px] text-[rgba(32,44,51,0.5)]">
                    10:02 PM ✓✓
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
