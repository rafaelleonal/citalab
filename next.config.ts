import type { NextConfig } from "next";

// Headers de seguridad globales.
// La CSP no se incluye aquí porque Next.js inyecta scripts y estilos
// con hashes dinámicos; habilitarla requiere configurar `nonce` por request.
// Cuando se haga, moverla a middleware con un nonce por respuesta.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // La confirmación contiene PII: nada de cache compartido ni
        // referrer que filtre el token al hacer click en Maps/WhatsApp.
        source: "/:slug/confirmacion/:id",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
