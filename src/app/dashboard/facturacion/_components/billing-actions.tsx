"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCheckoutSession, createPortalSession } from "../actions";

export function BillingActions({
  canActivate,
  canManage,
}: {
  canActivate: boolean;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);

  function handleActivate() {
    startTransition(async () => {
      const res = await createCheckoutSession();
      if (res.ok) {
        setRedirecting(true);
        window.location.href = res.url;
      } else if (res.error === "stripe_not_configured") {
        toast.info("El pago estará disponible muy pronto.", {
          description:
            "Estamos terminando la integración con Stripe. Te avisaremos por email cuando puedas activar tu plan.",
        });
      } else if (res.error === "not_admin") {
        toast.error("Solo el admin de la organización puede activar el plan.");
      } else {
        toast.error("No pudimos iniciar el pago. Intenta de nuevo.");
      }
    });
  }

  function handleManage() {
    startTransition(async () => {
      const res = await createPortalSession();
      if (res.ok) {
        setRedirecting(true);
        window.location.href = res.url;
      } else if (res.error === "stripe_not_configured") {
        toast.info("El portal de Stripe estará disponible muy pronto.");
      } else if (res.error === "no_customer") {
        toast.error("Primero activa tu plan para acceder al portal.");
      } else {
        toast.error("No pudimos abrir el portal. Intenta de nuevo.");
      }
    });
  }

  const busy = pending || redirecting;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {canActivate && (
        <button
          type="button"
          onClick={handleActivate}
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-5 text-[14px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Abriendo Stripe…" : "Activar plan · $490 MXN / mes"}
        </button>
      )}
      {canManage && (
        <button
          type="button"
          onClick={handleManage}
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Administrar suscripción
        </button>
      )}
    </div>
  );
}
