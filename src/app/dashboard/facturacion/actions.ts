"use server";

import { requireLabAdmin } from "@/lib/auth-helpers";

/**
 * Crea una sesión de Stripe Checkout y devuelve la URL a la que
 * redirigir al usuario.
 *
 * TODO: integración real con Stripe. Por ahora es un stub que regresa
 * un error específico para que la UI muestre "coming soon" sin romper.
 * Cuando se active Stripe:
 *   1. Crear/recuperar Customer (guardar stripeCustomerId en labs)
 *   2. Llamar stripe.checkout.sessions.create con:
 *      - mode: "subscription"
 *      - line_items: [{ price: STRIPE_PRICE_LAUNCH, quantity: 1 }]
 *      - metadata: { labId: lab.id }
 *      - success_url / cancel_url apuntando a /dashboard/facturacion
 *   3. Devolver session.url
 */
export async function createCheckoutSession(): Promise<
  { ok: true; url: string } | { ok: false; error: "not_admin" | "stripe_not_configured" }
> {
  const auth = await requireLabAdmin();
  if (!auth.ok) return { ok: false, error: "not_admin" };

  // Placeholder — activar cuando STRIPE_SECRET_KEY esté configurado.
  if (!process.env.STRIPE_SECRET_KEY) {
    return { ok: false, error: "stripe_not_configured" };
  }

  // TODO: implementar cuando lleguen las keys de Stripe
  return { ok: false, error: "stripe_not_configured" };
}

/**
 * Crea una sesión del Customer Portal de Stripe (hosted).
 * El usuario administra tarjeta, cancela, ve facturas.
 *
 * TODO: integración real con Stripe.
 */
export async function createPortalSession(): Promise<
  | { ok: true; url: string }
  | {
      ok: false;
      error: "not_admin" | "no_customer" | "stripe_not_configured";
    }
> {
  const auth = await requireLabAdmin();
  if (!auth.ok) return { ok: false, error: "not_admin" };

  if (!auth.lab.stripeCustomerId) {
    return { ok: false, error: "no_customer" };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { ok: false, error: "stripe_not_configured" };
  }

  // TODO: implementar cuando lleguen las keys de Stripe
  return { ok: false, error: "stripe_not_configured" };
}
