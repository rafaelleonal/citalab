import { Eyebrow, H2 } from "./primitives";

const STRIKE_STYLE = {
  textDecorationColor: "rgba(17,17,17,0.25)",
  textDecorationThickness: "1.5px",
} as const;

const CARDS = [
  {
    n: "01",
    bad: (
      <>
        Tu recepcionista <s style={STRIKE_STYLE}>anota en libreta</s>,
      </>
    ),
    good: (
      <>
        <strong className="font-medium text-ink">
          CitaLab agenda en línea
        </strong>{" "}
        — nombre, teléfono, estudios y hora, cifrado y buscable.
      </>
    ),
  },
  {
    n: "02",
    bad: (
      <>
        Los pacientes{" "}
        <s style={STRIKE_STYLE}>te mandan WhatsApp a las 11 PM</s>,
      </>
    ),
    good: (
      <>
        <strong className="font-medium text-ink">
          tu página reserva sola
        </strong>{" "}
        — incluso cuando el lab está cerrado, sin trabajo extra para ti.
      </>
    ),
  },
  {
    n: "03",
    bad: (
      <>
        Te enteras del ayuno{" "}
        <s style={STRIKE_STYLE}>cuando el paciente ya comió</s>,
      </>
    ),
    good: (
      <>
        <strong className="font-medium text-ink">
          recordatorios automáticos
        </strong>{" "}
        la noche anterior con las instrucciones específicas de sus estudios.
      </>
    ),
  },
];

export function LandingProblem() {
  return (
    <section className="border-y-[0.5px] border-line bg-surface-dim py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mx-auto mb-12 max-w-[720px] text-center">
          <Eyebrow>El problema</Eyebrow>
          <H2 className="mt-3.5">
            Perder citas porque nadie contesta{" "}
            <span className="text-[rgba(17,17,17,0.45)]">
              ya no es necesario.
            </span>
          </H2>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-pretty text-ink-sub">
            El 68% de los pacientes que llaman a un laboratorio en horario no
            laboral nunca regresan. CitaLab atiende por ti 24/7.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-[14px] border-[0.5px] border-line bg-line md:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.n} className="bg-white p-7">
              <div className="mb-5 font-mono text-[11px] tracking-[0.8px] text-ink-mute">
                {c.n}
              </div>
              <div className="mb-2.5 text-[20px] font-semibold leading-[1.2] tracking-[-0.4px]">
                {c.bad}
              </div>
              <div className="text-[14px] text-ink-sub">{c.good}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
