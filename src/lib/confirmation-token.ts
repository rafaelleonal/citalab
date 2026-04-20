import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token HMAC para restringir acceso a `/[slug]/confirmacion/[id]`.
 *
 * Sin este token, cualquier persona con el UUID de la cita podría ver
 * la PII del paciente. El token va en la URL (`?t=...`), se genera al
 * crear la cita, y se verifica en la página de confirmación.
 *
 * Formato: base64url(HMAC-SHA256(secret, `${appointmentId}`))
 * (sin expiración — la cita misma es el recurso; si el link se filtra,
 * se podría añadir expiración o rotación, pero por ahora es mejor que nada.)
 */

function getSecret(): string {
  const secret = process.env.CONFIRMATION_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "CONFIRMATION_TOKEN_SECRET no configurado o muy corto (mínimo 32 chars)",
    );
  }
  return secret;
}

function toBase64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signAppointmentToken(appointmentId: string): string {
  const mac = createHmac("sha256", getSecret())
    .update(appointmentId)
    .digest();
  return toBase64Url(mac);
}

export function verifyAppointmentToken(
  appointmentId: string,
  token: string | undefined | null,
): boolean {
  if (!token) return false;
  const expected = createHmac("sha256", getSecret())
    .update(appointmentId)
    .digest();
  let provided: Buffer;
  try {
    provided = fromBase64Url(token);
  } catch {
    return false;
  }
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}
