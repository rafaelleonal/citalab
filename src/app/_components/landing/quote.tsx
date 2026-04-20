export function LandingQuote() {
  return (
    <section className="pb-8 pt-4">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="relative mx-auto max-w-[820px] rounded-[20px] border-[0.5px] border-line bg-white p-12">
          <div className="absolute left-9 top-8 text-[70px] font-semibold leading-[0.8] text-ink-faint">
            &ldquo;
          </div>
          <blockquote className="m-0 mb-[26px] pl-9 text-[24px] font-medium leading-[1.35] tracking-[-0.4px] text-balance">
            Antes perdíamos 2 horas al día contestando llamadas para confirmar
            horarios. Ahora los pacientes agendan solos y mi recepcionista
            hace lo que importa — atender a quien está frente a ella.
          </blockquote>
          <div className="flex items-center gap-3 pl-9">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #D4B58F, #A57F5B)",
              }}
            >
              DR
            </div>
            <div>
              <div className="text-[14px] font-medium">
                Diana Romero, QFB
              </div>
              <div className="mt-px text-[12px] text-ink-mute">
                Directora · Lab Santa Lucía, Roma Norte CDMX
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
