import { Logo } from "@/components/logo";

/**
 * Pantalla mostrada en `/[slug]` y `/[slug]/agendar` cuando el
 * laboratorio no tiene suscripción activa. No exponemos los datos
 * (nombre, dirección, catálogo) — solo una nota neutral.
 */
export function LabPaused({ labName }: { labName: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm px-6 text-center text-ink">
      <div className="mb-6">
        <Logo size={24} />
      </div>
      <h1 className="text-[28px] font-semibold tracking-[-0.6px]">
        {labName} está en pausa
      </h1>
      <p className="mt-3 max-w-[420px] text-[15px] text-ink-sub">
        El laboratorio no está aceptando citas online en este momento.
        Contáctalos directamente para agendar.
      </p>
      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.6px] text-ink-mute">
        Agendado con CitaLab
      </p>
    </main>
  );
}
