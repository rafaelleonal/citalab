import { Eyebrow, H2 } from "./primitives";

const FAQS = [
  {
    q: "¿Tengo que enseñarle a mi equipo a usarlo?",
    a: "No. El dashboard se parece a una hoja de cálculo. Si tu recepcionista sabe usar WhatsApp, sabe usar CitaLab. Te hacemos un walkthrough de 20 min el día del setup.",
  },
  {
    q: "¿Qué pasa si un paciente llama por teléfono?",
    a: "Lo agendas manualmente desde el dashboard en 10 segundos — sirve para pacientes que no usan internet y queda en la misma agenda, con el mismo código de referencia.",
  },
  {
    q: "¿Puedo cambiar mi URL después?",
    a: "El slug (la parte después de citalab.mx/) es inmutable para que los links que compartas nunca se rompan. El nombre del laboratorio y todo lo demás sí puedes editarlo.",
  },
  {
    q: "¿Los datos de pacientes están seguros?",
    a: "Sí. Cifrado en tránsito y en reposo, servidores en México, cumplimiento con la LFPDPPP, backups diarios y acceso por roles. Tú eres dueño de tus datos y puedes exportarlos en cualquier momento.",
  },
  {
    q: "¿Cobran comisión por cita?",
    a: "No. Es un precio fijo mensual. Cobres 500 o 50,000 pesos ese mes, nosotros cobramos lo mismo. Tu margen es tu margen.",
  },
  {
    q: "¿Acepta pagos con tarjeta del paciente?",
    a: "Por ahora no procesamos pagos — el paciente paga en tu lab como lo hace hoy (efectivo o tu terminal). Pagos en línea vienen en el roadmap Q3 2026.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="pb-20 md:pb-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mx-auto mb-12 max-w-[720px] text-center">
          <Eyebrow>Preguntas frecuentes</Eyebrow>
          <H2 className="mt-3.5">
            Lo que laboratorios como el tuyo preguntan.
          </H2>
        </div>
        <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
          {FAQS.map((f, i) => {
            const isFirstRow = i < 2;
            return (
              <div
                key={f.q}
                className={
                  isFirstRow
                    ? "py-4 pt-0"
                    : "border-t-[0.5px] border-line py-4 pt-[18px]"
                }
              >
                <h4 className="mb-2 text-[17px] font-semibold tracking-[-0.3px]">
                  {f.q}
                </h4>
                <p className="m-0 text-[14px] leading-[1.55] text-ink-sub">
                  {f.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
