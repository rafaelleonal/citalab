import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Estrategia: todo es privado por default EXCEPTO rutas que coincidan
 * con una whitelist explícita. Invertimos la lógica (antes era
 * "reserved list") para que una ruta nueva dentro de `src/app/` quede
 * PROTEGIDA por default — la única forma de hacerla pública es añadirla
 * aquí.
 */

// Rutas absolutas públicas (no dependen del slug del lab).
const isAbsolutePublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// Prefijos que NUNCA son slug de lab, aunque caigan en la raíz:
// si una ruta empieza con uno de estos, no se considera pública por slug.
const PRIVATE_FIRST_SEGMENTS = new Set([
  "dashboard",
  "onboarding",
  "api",
  "sign-in",
  "sign-up",
]);

// Sub-paths públicos debajo de `/{slug}/...`. Añadir aquí solo cuando
// exista una ruta pública nueva dentro del lab.
// - `""`                       → `/slug` (landing del lab)
// - `"agendar"`                → `/slug/agendar`
// - `"agendar/..."`            → `/slug/agendar/cualquier-cosa`
// - `"confirmacion/..."`       → `/slug/confirmacion/...`
const PUBLIC_SLUG_SUBPATH_RE = /^(|agendar(\/.*)?|confirmacion\/[^/]+)$/;

function isPublicSlugRoute(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  const [first, ...rest] = parts;
  if (PRIVATE_FIRST_SEGMENTS.has(first)) return false;
  return PUBLIC_SLUG_SUBPATH_RE.test(rest.join("/"));
}

export default clerkMiddleware(async (auth, req) => {
  if (isAbsolutePublic(req)) return;
  if (isPublicSlugRoute(req.nextUrl.pathname)) return;
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
