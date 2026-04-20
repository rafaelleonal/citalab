import Link from "next/link";
import { ArrowIcon } from "./icons";

export function LandingCta() {
  return (
    <section className="pb-20 md:pb-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[24px] bg-ink px-5 py-16 text-center text-white md:px-8 md:py-24">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.04) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 50%)",
            }}
          />
          <div className="relative">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.8px] text-white/45">
              Empezar
            </div>
            <h2 className="m-0 mx-auto max-w-[800px] text-[clamp(36px,5vw,56px)] font-semibold leading-[1.05] tracking-[-2px]">
              Tu agenda, funcionando en una tarde.
            </h2>
            <p className="mx-auto mb-9 mt-5 max-w-[520px] text-[17px] text-white/60">
              Configura tu laboratorio en 10 minutos. 14 días gratis, sin
              tarjeta.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-[15px] font-medium text-ink"
            >
              Crear mi página gratis
              <ArrowIcon className="text-ink" />
            </Link>
            <div className="mt-5 text-[12px] text-white/40">
              O si prefieres,{" "}
              <a
                href="mailto:hola@citalab.mx"
                className="text-white/70 underline underline-offset-2"
              >
                agenda una demo
              </a>{" "}
              y te la hacemos en vivo.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
