import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, H2 } from "./primitives";
import { CheckIcon } from "./icons";

const CITALAB_FEATURES = [
  "Página pública citalab.mx/slug",
  "Citas ilimitadas",
  "Catálogo ilimitado de estudios y paquetes",
  "Confirmación instantánea con .ics",
  "Dashboard para toda tu recepción",
  "Soporte en español por WhatsApp",
];

const CADENA_FEATURES = [
  "Todo lo de CitaLab",
  "Sucursales ilimitadas",
  "Dominio propio (lab.com/agendar)",
  "Account manager dedicado",
];

export function LandingPricing() {
  return (
    <section id="precios" className="py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="mx-auto mb-12 max-w-[720px] text-center">
          <Eyebrow>Precios simples</Eyebrow>
          <H2 className="mt-3.5">Un plan por laboratorio. Sin sorpresas.</H2>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-pretty text-ink-sub">
            Precio fijo mensual — sin comisiones por cita, sin letra chica.
            Cancela cuando quieras.
          </p>
        </div>

        {/* Card principal + card secundaria */}
        <div className="mx-auto grid max-w-[900px] gap-4 md:grid-cols-[1.4fr_1fr] md:items-stretch">
          {/* Card principal: CitaLab */}
          <div className="relative flex flex-col rounded-[16px] border-[0.5px] border-ink bg-ink p-7 text-white">
            {/* Badge lanzamiento */}
            <Badge
              variant="outline"
              className="absolute left-1/2 top-0 h-auto -translate-x-1/2 -translate-y-1/2 border-[0.5px] border-brand-accent/30 bg-brand-accent px-3 py-[5px] font-mono text-[10.5px] uppercase tracking-[0.6px] text-white"
            >
              Precio de lanzamiento · sube a $990 el 1 jul 2026
            </Badge>

            <div className="mb-3.5 mt-2 font-mono text-[11px] uppercase tracking-[0.8px] text-white/55">
              CitaLab
            </div>
            <h3 className="m-0 mb-1 text-[28px] font-semibold tracking-[-0.5px]">
              Todo lo que tu laboratorio necesita.
            </h3>
            <p className="mb-5 text-[13.5px] text-white/65">
              Un solo plan, pensado para labs independientes.
            </p>

            <div className="flex items-baseline gap-2">
              <div className="text-[52px] font-semibold leading-none tracking-[-1.8px] tabular-nums">
                <sup
                  className="mr-[3px] text-[18px] font-medium tracking-normal text-white/50"
                  style={{ top: "-20px" }}
                >
                  $
                </sup>
                490
              </div>
              <span className="text-[14px] font-medium text-white/55 line-through tabular-nums">
                $990
              </span>
            </div>
            <div className="mb-6 mt-1 text-[13px] text-white/55">
              MXN / mes · IVA incluido
            </div>

            <ul className="mb-7 grid list-none gap-y-0 p-0 md:grid-cols-2 md:gap-x-4">
              {CITALAB_FEATURES.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2.5 py-1.5 text-[13.5px] text-white/80"
                >
                  <span className="mt-[3px] flex-shrink-0">
                    <CheckIcon className="text-leaf-bg" />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="mt-auto inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-4 text-[15px] font-medium text-ink"
            >
              Empezar prueba gratis 14 días
            </Link>
            <p className="mt-3 text-center text-[12px] text-white/55">
              Sin tarjeta de crédito
            </p>
          </div>

          {/* Card secundaria: Cadena */}
          <div className="relative flex flex-col rounded-[16px] border-[0.5px] border-line bg-white p-7 text-ink">
            <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.8px] text-ink-mute">
              Cadena
            </div>
            <h3 className="m-0 mb-1 text-[22px] font-semibold tracking-[-0.4px]">
              Para múltiples sucursales.
            </h3>
            <p className="mb-4 text-[13px] text-ink-sub">
              Varios laboratorios con marca unificada.
            </p>

            <div className="text-[28px] font-semibold tracking-[-0.5px] tabular-nums">
              Hablemos
            </div>
            <div className="mb-5 mt-1 text-[13px] text-ink-mute">
              Precio por sucursal
            </div>

            <ul className="mb-6 list-none space-y-0 p-0">
              {CADENA_FEATURES.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2.5 py-1.5 text-[13px] text-ink-sub"
                >
                  <span className="mt-[3px] flex-shrink-0">
                    <CheckIcon />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <a
              href="mailto:hola@citalab.mx?subject=Cadena%20de%20laboratorios"
              className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-lg border-[0.5px] border-line-strong bg-white px-4 text-[14px] font-medium text-ink"
            >
              Contactar ventas
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-[13px] text-ink-mute">
          Todos los planes incluyen: SSL, backups diarios, cumplimiento
          LFPDPPP, datos en servidores de México.
        </div>
      </div>
    </section>
  );
}
