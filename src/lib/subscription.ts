import type { Lab, SubscriptionStatus } from "@/db/schema";

export const LAUNCH_END_DATE = "2026-07-01";

/** Constantes del plan. Sincronizar con los Prices creados en Stripe. */
export const PLAN = {
  name: "CitaLab",
  launchPriceMxn: 490,
  standardPriceMxn: 990,
  currency: "MXN" as const,
  interval: "mes" as const,
};

export const TRIAL_DAYS = 14;

/**
 * ¿El lab puede operar? True = dashboard usable + página pública
 * acepta citas. False = paywall / "en pausa".
 *
 * Ojo: esta función NO actualiza BD; solo evalúa el estado. Para
 * transicionar `trialing → trial_expired` usa `resolveSubscriptionState`.
 */
export function isSubscriptionActive(lab: Lab): boolean {
  switch (lab.subscriptionStatus) {
    case "active":
      return true;
    case "past_due":
      // Grace period: dejamos operar mientras Stripe reintenta.
      // La UI muestra banner rojo para que actualice tarjeta.
      return true;
    case "trialing":
      return lab.trialEndsAt > new Date();
    case "canceled":
      // Canceló pero aún dentro del periodo pagado.
      return lab.currentPeriodEnd ? lab.currentPeriodEnd > new Date() : false;
    default:
      return false;
  }
}

/**
 * Resuelve el estado "real" del lab ahora mismo. Si el estado persistido
 * es `trialing` pero `trialEndsAt` ya pasó, devuelve `trial_expired`
 * para que el caller actualice la BD (lazy transition).
 */
export function resolveSubscriptionState(lab: Lab): SubscriptionStatus {
  if (lab.subscriptionStatus === "trialing" && lab.trialEndsAt <= new Date()) {
    return "trial_expired";
  }
  if (
    lab.subscriptionStatus === "canceled" &&
    (!lab.currentPeriodEnd || lab.currentPeriodEnd <= new Date())
  ) {
    return "trial_expired"; // Terminó el periodo pagado; bloquear.
  }
  return lab.subscriptionStatus;
}

export type TrialInfo = {
  isTrialing: boolean;
  daysLeft: number; // 0 si ya venció
  endingSoon: boolean; // ≤ 3 días
};

export function getTrialInfo(lab: Lab, now: Date = new Date()): TrialInfo {
  if (lab.subscriptionStatus !== "trialing") {
    return { isTrialing: false, daysLeft: 0, endingSoon: false };
  }
  const msLeft = lab.trialEndsAt.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  return {
    isTrialing: true,
    daysLeft,
    endingSoon: daysLeft <= 3,
  };
}
