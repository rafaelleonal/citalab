import Link from "next/link";
import type { Lab } from "@/db/schema";
import { getTrialInfo, PLAN } from "@/lib/subscription";

/**
 * Pill con el estado de suscripción. Click → /dashboard/facturacion.
 * Se renderiza debajo del card del lab en el sidebar.
 */
export function PlanChip({ lab }: { lab: Lab }) {
  const trial = getTrialInfo(lab);

  let label: string;
  let tone:
    | "neutral"
    | "warning"
    | "success"
    | "danger" = "neutral";

  switch (lab.subscriptionStatus) {
    case "trialing":
      if (trial.daysLeft <= 1) {
        label =
          trial.daysLeft === 0
            ? "Prueba termina hoy"
            : "Prueba termina mañana";
        tone = "warning";
      } else if (trial.endingSoon) {
        label = `Prueba · ${trial.daysLeft} días`;
        tone = "warning";
      } else {
        label = `Prueba · ${trial.daysLeft} días`;
        tone = "neutral";
      }
      break;
    case "active":
      label = `${PLAN.name} · $${PLAN.launchPriceMxn}`;
      tone = "success";
      break;
    case "past_due":
      label = "Pago pendiente";
      tone = "danger";
      break;
    case "canceled":
      label = "Cancelada";
      tone = "warning";
      break;
    case "trial_expired":
      label = "Prueba vencida";
      tone = "danger";
      break;
    case "incomplete":
      label = "Completa tu pago";
      tone = "warning";
      break;
  }

  const toneClass = {
    neutral:
      "border-line-strong bg-surface-alt text-ink-sub",
    warning:
      "border-brand-accent/30 bg-brand-accent/10 text-brand-accent",
    success: "border-leaf/20 bg-leaf-bg text-leaf",
    danger:
      "border-destructive/30 bg-destructive/10 text-destructive",
  }[tone];

  return (
    <Link
      href="/dashboard/facturacion"
      className={`mt-2 inline-flex w-full items-center justify-between gap-2 rounded-md border-[0.5px] px-2.5 py-1.5 text-[11.5px] font-medium transition-opacity hover:opacity-80 ${toneClass}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === "neutral"
              ? "bg-ink-mute"
              : tone === "warning"
              ? "bg-brand-accent"
              : tone === "success"
              ? "bg-leaf"
              : "bg-destructive"
          }`}
        />
        {label}
      </span>
      <span className="font-mono text-[10px] opacity-60">→</span>
    </Link>
  );
}
