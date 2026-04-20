import Link from "next/link";
import { Logo } from "@/components/logo";

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function LandingFooter() {
  return (
    <footer className="pb-12 pt-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo size={22} />
            <p className="mt-3 max-w-[280px] text-[13.5px] leading-[1.5] text-ink-sub">
              Software de agendado online para laboratorios clínicos
              mexicanos. Hecho en Chiapas.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-[rgba(17,17,17,0.06)]"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-[rgba(17,17,17,0.06)]"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-sub">
            <Link href="/sign-in" className="hover:text-black">
              Ingresar
            </Link>
            <Link href="/sign-up" className="hover:text-black">
              Empezar gratis
            </Link>
            <a href="mailto:hola@citalab.mx" className="hover:text-black">
              Contacto
            </a>
          </nav>
        </div>
        <div className="mt-12 flex items-center justify-between border-t-[0.5px] border-line pt-6 text-[12px] text-ink-mute">
          <div>© 2026 CitaLab · Hecho con ♡ en México</div>
          <div className="font-mono">citalab.mx</div>
        </div>
      </div>
    </footer>
  );
}
