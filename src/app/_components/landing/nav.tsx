import Link from "next/link";
import { Logo } from "@/components/logo";

export function LandingNav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b-[0.5px] border-line bg-[rgba(250,247,242,0.82)]"
      style={{
        backdropFilter: "saturate(160%) blur(10px)",
        WebkitBackdropFilter: "saturate(160%) blur(10px)",
      }}
    >
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-5 md:px-8">
        <Logo size={22} />
        <div className="hidden gap-7 text-[14px] text-ink-sub md:flex">
          <a href="#producto" className="hover:text-black">
            Producto
          </a>
          <a href="#flujo" className="hover:text-black">
            Cómo funciona
          </a>
          <a href="#precios" className="hover:text-black">
            Precios
          </a>
          <a href="#roadmap" className="hover:text-black">
            Roadmap
          </a>
          <a href="#faq" className="hover:text-black">
            Preguntas
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="inline-flex h-8 items-center justify-center rounded-[7px] border-[0.5px] border-line-strong bg-white px-3 text-[13px] font-medium text-ink"
          >
            Ingresar
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-8 items-center justify-center rounded-[7px] bg-ink px-3 text-[13px] font-medium text-white"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(17,17,17,0.18)",
            }}
          >
            Empezar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
