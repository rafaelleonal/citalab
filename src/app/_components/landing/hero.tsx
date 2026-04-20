import Link from "next/link";
import { ArrowIcon } from "./icons";
import { HeroMock } from "./hero-mock";

const TRUST_POINTS = [
  "Sin tarjeta de crédito",
  "Montaje en 10 min",
  "Soporte en español",
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pb-8 pt-12">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_1fr] md:gap-16">
          <div>
            <h1 className="m-0 text-[clamp(44px,7.5vw,76px)] font-semibold leading-[1.05] tracking-[-2.6px]">
              La agenda de tu laboratorio,
              <span className="block text-[rgba(17,17,17,0.42)]">
                sin tener que contestar el teléfono.
              </span>
            </h1>
            <p className="mt-6 max-w-[560px] text-[18px] leading-[1.5] text-pretty text-ink-sub">
              CitaLab le da a cada laboratorio clínico una página de agendado
              profesional. Tus pacientes reservan online en 45 segundos. Tú
              atiendes, no tomas recados.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-[15px] font-medium text-white"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(17,17,17,0.18)",
                }}
              >
                Prueba 14 días gratis
                <ArrowIcon />
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-[13px] text-ink-mute">
              {TRUST_POINTS.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-ink-mute"
                  >
                    <path
                      d="M11 3.5L5 10 2.5 7.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <HeroMock />
        </div>
      </div>
    </section>
  );
}
