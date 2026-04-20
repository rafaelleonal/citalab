const STEPS: { mark: string; h: string; d: React.ReactNode }[] = [
  {
    mark: "01 → PACIENTE",
    h: "Comparte tu link",
    d: (
      <>
        WhatsApp, redes sociales, Google Maps, o pega{" "}
        <code className="font-mono text-[12px]">citalab.mx/tu-lab</code> en tu
        página web.
      </>
    ),
  },
  {
    mark: "02 → PACIENTE",
    h: "Agenda en 45 seg",
    d: "Elige estudios, fecha, hora y deja sus datos. Recibe código de referencia y .ics para su calendario.",
  },
  {
    mark: "03 → CITALAB",
    h: "Recordatorio WhatsApp",
    d: "La noche anterior enviamos hora, dirección, ayuno y ruta a Google Maps. Automático.",
  },
  {
    mark: "04 → TÚ",
    h: "Atiendes la cita",
    d: "Marca como Atendido, No asistió o Cancelado con un click. Los ingresos se cuadran solos.",
  },
];

export function LandingFlow() {
  return (
    <section id="flujo" className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="rounded-[20px] bg-ink p-10 text-white md:p-14">
          <div className="max-w-[640px]">
            <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.8px] text-white/50">
              Cómo funciona
            </div>
            <h2 className="m-0 text-[48px] font-semibold leading-[1.08] tracking-[-1.6px] text-white">
              De teléfono a tablero en 4 pasos.
            </h2>
            <p className="mt-4 max-w-[520px] text-[16px] text-white/60">
              Desde que el paciente abre tu link hasta que llega a tu
              recepción. Sin fricciones.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.mark} className="relative pt-6">
                <div className="absolute top-0 font-mono text-[11px] tracking-[1px] text-white/40">
                  {s.mark}
                </div>
                <div className="absolute left-0 right-0 top-6 h-px bg-white/15" />
                <h4 className="mb-2 mt-4 text-[19px] font-semibold tracking-[-0.3px]">
                  {s.h}
                </h4>
                <div className="text-[13px] leading-[1.5] text-white/60">
                  {s.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
