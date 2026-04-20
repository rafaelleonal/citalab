import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, H2 } from "./primitives";
import { CheckIcon } from "./icons";

function PriceCard({
  children,
  featured = false,
}: {
  children: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "relative flex flex-col rounded-[16px] border-[0.5px] border-ink bg-ink p-7 text-white"
          : "relative flex flex-col rounded-[16px] border-[0.5px] border-line bg-white p-7 text-ink"
      }
    >
      {children}
    </div>
  );
}

function PriceHeader({
  plan,
  title,
  children,
  featured = false,
}: {
  plan: string;
  title: string;
  children: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <>
      <div
        className={`mb-3.5 font-mono text-[11px] uppercase tracking-[0.8px] ${
          featured ? "text-white/55" : "text-ink-mute"
        }`}
      >
        {plan}
      </div>
      <h3 className="m-0 mb-1 text-[26px] font-semibold tracking-[-0.5px]">
        {title}
      </h3>
      <div
        className={`mb-4 min-h-[40px] text-[13px] ${
          featured ? "text-white/65" : "text-ink-sub"
        }`}
      >
        {children}
      </div>
    </>
  );
}

function PriceAmount({
  amount,
  featured = false,
}: {
  amount: string;
  featured?: boolean;
}) {
  return (
    <>
      <div className="text-[46px] font-semibold leading-none tracking-[-1.6px] tabular-nums">
        <sup
          className={`mr-[3px] text-[16px] font-medium tracking-normal ${
            featured ? "text-white/50" : "text-ink-mute"
          }`}
          style={{ top: "-16px" }}
        >
          $
        </sup>
        {amount}
      </div>
      <div
        className={`mb-6 mt-1 text-[13px] ${
          featured ? "text-white/55" : "text-ink-mute"
        }`}
      >
        MXN / mes · IVA incluido
      </div>
    </>
  );
}

function PriceLi({
  children,
  featured = false,
}: {
  children: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <li
      className={`flex items-start gap-2.5 py-1.5 text-[13.5px] ${
        featured ? "text-white/80" : "text-ink-sub"
      }`}
    >
      <span className="mt-[3px] flex-shrink-0">
        <CheckIcon className={featured ? "text-leaf-bg" : "text-leaf"} />
      </span>
      <span>{children}</span>
    </li>
  );
}

const INICIO_FEATURES = [
  "Página pública citalab.mx/slug",
  "Hasta 200 citas / mes",
  "Catálogo ilimitado de estudios",
  "1 usuario del dashboard",
  "Soporte por email",
];

const PROFESIONAL_FEATURES = [
  { t: "Todo lo de Inicio" },
  { t: "Citas ilimitadas", bold: true },
  { t: "Recordatorios por WhatsApp" },
  { t: "5 usuarios del dashboard" },
  { t: "Reportes de ingresos y asistencia" },
  { t: "Soporte prioritario" },
];

const CADENA_FEATURES = [
  "Todo lo de Profesional",
  "Sucursales ilimitadas",
  "Dominio propio (lab.com/agendar)",
  "Usuarios ilimitados",
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

        <div className="grid gap-4 md:grid-cols-3">
          <PriceCard>
            <PriceHeader plan="Inicio" title="Para laboratorios pequeños">
              Un solo lab, hasta 200 citas al mes.
            </PriceHeader>
            <PriceAmount amount="490" />
            <ul className="mb-6 list-none space-y-0 p-0">
              {INICIO_FEATURES.map((t) => (
                <PriceLi key={t}>{t}</PriceLi>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-lg border-[0.5px] border-line-strong bg-white px-4 text-[14px] font-medium text-ink"
            >
              Empezar gratis 14 días
            </Link>
          </PriceCard>

          <PriceCard featured>
            <Badge
              variant="outline"
              className="absolute right-[18px] top-[18px] h-auto border-[0.5px] border-white/20 bg-white/10 px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.6px] text-white"
            >
              Popular
            </Badge>
            <PriceHeader
              plan="Profesional"
              title="Para laboratorios en crecimiento"
              featured
            >
              Citas ilimitadas, WhatsApp, reportes.
            </PriceHeader>
            <PriceAmount amount="990" featured />
            <ul className="mb-6 list-none space-y-0 p-0">
              {PROFESIONAL_FEATURES.map((it) => (
                <PriceLi key={it.t} featured>
                  {it.bold ? (
                    <strong className="text-white">{it.t}</strong>
                  ) : (
                    it.t
                  )}
                </PriceLi>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-lg bg-white px-4 text-[14px] font-medium text-ink"
            >
              Empezar gratis 14 días
            </Link>
          </PriceCard>

          <PriceCard>
            <PriceHeader plan="Cadena" title="Para múltiples sucursales">
              Varios laboratorios con marca unificada.
            </PriceHeader>
            <div className="text-[28px] font-semibold tracking-[-0.5px] tabular-nums">
              Hablemos
            </div>
            <div className="mb-6 mt-1 text-[13px] text-ink-mute">
              Precio por sucursal
            </div>
            <ul className="mb-6 list-none space-y-0 p-0">
              {CADENA_FEATURES.map((t) => (
                <PriceLi key={t}>{t}</PriceLi>
              ))}
            </ul>
            <a
              href="mailto:hola@citalab.mx"
              className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-lg border-[0.5px] border-line-strong bg-white px-4 text-[14px] font-medium text-ink"
            >
              Agendar demo
            </a>
          </PriceCard>
        </div>

        <div className="mt-6 text-center text-[13px] text-ink-mute">
          Todos los planes incluyen: SSL, backups diarios, cumplimiento
          LFPDPPP, datos en servidores de México.
        </div>
      </div>
    </section>
  );
}
