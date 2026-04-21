import { format } from "date-fns";
import { es } from "date-fns/locale";
import { requireLab } from "@/lib/auth-helpers";
import {
  getTrialInfo,
  isSubscriptionActive,
  LAUNCH_END_DATE,
  PLAN,
} from "@/lib/subscription";
import { BillingActions } from "./_components/billing-actions";

export default async function FacturacionPage() {
  const lab = await requireLab();
  const trial = getTrialInfo(lab);
  const active = isSubscriptionActive(lab);

  // Estado humano-legible para el card principal
  let statusLabel: string;
  let statusTone: "neutral" | "warning" | "success" | "danger";
  let statusCopy: string;

  switch (lab.subscriptionStatus) {
    case "trialing":
      statusLabel = trial.daysLeft === 1 ? "Prueba · 1 día" : `Prueba · ${trial.daysLeft} días`;
      statusTone = trial.endingSoon ? "warning" : "neutral";
      statusCopy = `Tu prueba termina el ${format(lab.trialEndsAt, "d 'de' MMMM", { locale: es })}. Activa tu plan antes para mantener el precio de lanzamiento.`;
      break;
    case "active":
      statusLabel = "Activo";
      statusTone = "success";
      statusCopy = lab.currentPeriodEnd
        ? `Próximo cobro: ${format(lab.currentPeriodEnd, "d 'de' MMMM", { locale: es })}.`
        : "Tu suscripción está al día.";
      break;
    case "past_due":
      statusLabel = "Pago pendiente";
      statusTone = "danger";
      statusCopy = "Tu último cargo falló. Actualiza tu método de pago para no perder el acceso.";
      break;
    case "trial_expired":
      statusLabel = "Prueba vencida";
      statusTone = "danger";
      statusCopy = "Tu prueba gratis terminó. Activa tu plan para reanudar el servicio.";
      break;
    case "canceled":
      statusLabel = "Cancelada";
      statusTone = "warning";
      statusCopy = lab.currentPeriodEnd
        ? `Tu acceso termina el ${format(lab.currentPeriodEnd, "d 'de' MMMM", { locale: es })}.`
        : "Tu suscripción fue cancelada.";
      break;
    case "incomplete":
      statusLabel = "Pago en proceso";
      statusTone = "warning";
      statusCopy = "Tu pago está siendo procesado. Si no se completó, inténtalo de nuevo.";
      break;
  }

  const toneClass = {
    neutral: "border-line-strong bg-surface-alt text-ink-sub",
    warning: "border-brand-accent/30 bg-brand-accent/10 text-brand-accent",
    success: "border-leaf/20 bg-leaf-bg text-leaf",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
  }[statusTone];

  return (
    <div className="mx-auto max-w-[820px]">
      <header className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.4px]">
          Facturación
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Administra tu plan, tarjeta y facturas.
        </p>
      </header>

      {/* Card del plan */}
      <section className="rounded-[14px] border border-border bg-card p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.8px] text-muted-foreground">
              Plan actual
            </div>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.4px]">
              {PLAN.name}
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border-[0.5px] px-2.5 py-[3px] text-[11px] font-medium ${toneClass}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                statusTone === "neutral"
                  ? "bg-ink-mute"
                  : statusTone === "warning"
                  ? "bg-brand-accent"
                  : statusTone === "success"
                  ? "bg-leaf"
                  : "bg-destructive"
              }`}
            />
            {statusLabel}
          </span>
        </div>

        {/* Precio */}
        <div className="mt-6 flex items-baseline gap-3">
          <div className="text-[40px] font-semibold leading-none tracking-[-1.2px] tabular-nums">
            <sup
              className="mr-[3px] text-[15px] font-medium tracking-normal text-muted-foreground"
              style={{ top: "-14px" }}
            >
              $
            </sup>
            {PLAN.launchPriceMxn}
          </div>
          <span className="text-[13px] text-muted-foreground line-through tabular-nums">
            ${PLAN.standardPriceMxn}
          </span>
          <span className="text-[13px] text-muted-foreground">MXN / mes</span>
        </div>
        <p className="mt-2 text-[12.5px] text-muted-foreground">
          Precio de lanzamiento. Sube a ${PLAN.standardPriceMxn} el{" "}
          {format(new Date(LAUNCH_END_DATE), "d 'de' MMMM 'de' yyyy", {
            locale: es,
          })}
          . Si activas ahora, conservas $490 de por vida.
        </p>

        {/* Status copy */}
        <p className="mt-4 rounded-md border border-border bg-muted/40 px-3.5 py-2.5 text-[13px] text-foreground">
          {statusCopy}
        </p>

        <div className="mt-6 border-t border-border pt-5">
          <BillingActions
            canActivate={
              lab.subscriptionStatus === "trialing" ||
              lab.subscriptionStatus === "trial_expired" ||
              lab.subscriptionStatus === "incomplete"
            }
            canManage={
              !!lab.stripeCustomerId &&
              (lab.subscriptionStatus === "active" ||
                lab.subscriptionStatus === "past_due" ||
                lab.subscriptionStatus === "canceled")
            }
          />
        </div>
      </section>

      {/* Info adicional */}
      <section className="mt-4 rounded-[14px] border border-border bg-card p-6">
        <h3 className="text-[14px] font-semibold">Incluido en tu plan</h3>
        <ul className="mt-3 grid gap-1.5 text-[13px] text-muted-foreground md:grid-cols-2">
          <li>· Página pública citalab.mx/{lab.slug}</li>
          <li>· Citas ilimitadas</li>
          <li>· Catálogo ilimitado de estudios y paquetes</li>
          <li>· Confirmación instantánea con .ics</li>
          <li>· Dashboard para toda tu recepción</li>
          <li>· Soporte en español por WhatsApp</li>
        </ul>
      </section>

      <section className="mt-4 rounded-[14px] border border-border bg-card p-6">
        <h3 className="text-[14px] font-semibold">Historial de facturas</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {lab.stripeCustomerId
            ? "Accede desde “Administrar suscripción” para ver y descargar tus facturas."
            : "Cuando actives tu plan, aquí aparecerán tus facturas."}
        </p>
      </section>

      {!active && lab.subscriptionStatus !== "trialing" && (
        <p className="mt-6 text-center text-[12px] text-muted-foreground">
          Mientras no actives tu plan, tu página pública aparece como «en
          pausa» para los pacientes y el dashboard queda en esta pantalla.
        </p>
      )}
    </div>
  );
}
