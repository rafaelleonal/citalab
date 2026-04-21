import Link from "next/link";
import type { Lab } from "@/db/schema";
import { getTrialInfo } from "@/lib/subscription";

/**
 * Banner superior del dashboard. Solo se muestra cuando el estado
 * requiere atención del usuario (trial a punto de vencer, pago fallido).
 */
export function TrialBanner({ lab }: { lab: Lab }) {
  const trial = getTrialInfo(lab);

  if (lab.subscriptionStatus === "past_due") {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-destructive/30 bg-destructive/10 px-5 py-2.5 text-[13px] text-destructive md:px-6">
        <div>
          <strong className="font-semibold">Tu último pago falló.</strong>{" "}
          Actualiza tu método de pago para no perder el acceso.
        </div>
        <Link
          href="/dashboard/facturacion"
          className="inline-flex h-8 items-center rounded-md border border-destructive/40 bg-white px-3 text-[12px] font-medium text-destructive hover:bg-destructive/5"
        >
          Actualizar tarjeta
        </Link>
      </div>
    );
  }

  if (lab.subscriptionStatus === "trialing" && trial.endingSoon) {
    const copy =
      trial.daysLeft === 0
        ? "Tu prueba termina hoy."
        : trial.daysLeft === 1
        ? "Tu prueba termina mañana."
        : `Te quedan ${trial.daysLeft} días de prueba.`;
    return (
      <div className="flex items-center justify-between gap-3 border-b border-brand-accent/30 bg-brand-accent/10 px-5 py-2.5 text-[13px] text-brand-accent md:px-6">
        <div>
          <strong className="font-semibold">{copy}</strong> Activa tu plan
          para no perder el precio de lanzamiento de $490/mes.
        </div>
        <Link
          href="/dashboard/facturacion"
          className="inline-flex h-8 items-center rounded-md bg-brand-accent px-3 text-[12px] font-medium text-white hover:opacity-90"
        >
          Activar plan
        </Link>
      </div>
    );
  }

  return null;
}
