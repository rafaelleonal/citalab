"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";
import { StepInfo } from "./step-info";
import { StepHours } from "./step-hours";
import { StepCatalog } from "./step-catalog";
import { finishOnboarding } from "../actions";
import type { WeeklyHours } from "@/db/schema";
import type { ServiceInput } from "../actions";

type StepOneData = { name: string; address: string; phone: string };
type StepTwoData = { hours: WeeklyHours };

const STEP_LABELS = ["Datos del lab", "Horarios", "Catálogo inicial"];

export function OnboardingWizard({
  initialStep = 1,
  onComplete,
}: {
  initialStep?: number;
  onComplete?: () => void;
}) {
  const [step, setStep] = useState(() => initialStep);
  const [stepOne, setStepOne] = useState<StepOneData | null>(null);
  const [stepTwo, setStepTwo] = useState<StepTwoData | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStepOneNext(data: StepOneData) {
    setStepOne(data);
    setStep(2);
  }

  function handleStepTwoNext(data: StepTwoData) {
    setStepTwo(data);
    setStep(3);
  }

  function handleFinish(finalServices: ServiceInput[]) {
    if (onComplete) {
      onComplete();
      return;
    }
    startTransition(async () => {
      await finishOnboarding({
        name: stepOne!.name,
        address: stepOne!.address,
        phone: stepOne!.phone,
        hours: stepTwo!.hours,
        services: finalServices,
      });
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur"
        style={{ borderColor: "rgba(17,17,17,0.08)" }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-6 px-5">
          {/* Brand */}
          <Logo size={17} />

          {/* Progress steps */}
          <ol className="flex flex-1 items-center justify-center gap-0">
            {[1, 2, 3].map((n, i) => {
              const done = n < step;
              const active = n === step;
              return (
                <li key={n} className="flex items-center gap-0">
                  <div className="flex items-center gap-2">
                    {/* Circle */}
                    <div
                      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors"
                      style={{
                        background:
                          done || active ? "#111" : "transparent",
                        color: done || active ? "#fff" : "#8B8A83",
                        border:
                          done || active
                            ? "none"
                            : "1px solid rgba(17,17,17,0.18)",
                      }}
                      aria-current={active ? "step" : undefined}
                    >
                      {done ? (
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      ) : (
                        n
                      )}
                    </div>
                    {/* Label */}
                    <span
                      className="hidden text-[13px] sm:inline"
                      style={{
                        color: active ? "#111" : done ? "#52514C" : "#8B8A83",
                        fontWeight: active ? 500 : 400,
                      }}
                    >
                      {STEP_LABELS[n - 1]}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < 2 && (
                    <span
                      className="mx-3 hidden h-px w-8 shrink-0 sm:block sm:w-10 md:w-14"
                      style={{
                        background: done ? "#111" : "rgba(17,17,17,0.14)",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Close */}
          <button
            type="button"
            onClick={() => {
              if (confirm("¿Salir del onboarding? Podrás continuar después.")) {
                window.location.href = "/";
              }
            }}
            className="shrink-0 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cerrar y continuar después"
          >
            <span className="hidden sm:inline">Cerrar y continuar después</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 2L12 12M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 md:py-12">
        <div className="mb-8">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Paso {step} de 3 · {STEP_LABELS[step - 1]}
          </p>
          <h1 className="mt-2.5 text-[30px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {step === 1 && "Cuéntanos sobre tu laboratorio."}
            {step === 2 && "¿Cuándo atiende tu laboratorio?"}
            {step === 3 && "Elige los estudios con los que empezar."}
          </h1>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
            {step === 1 &&
              "Esta información aparecerá en tu página pública de citas."}
            {step === 2 &&
              "Solo aceptaremos citas dentro de tus horarios. Puedes ajustarlos después."}
            {step === 3 && (
              <>
                Te precargamos los 20 estudios más comunes en México.
                <br />
                Desmarca los que no ofreces y ajusta precios — puedes editar
                todo después.
              </>
            )}
          </p>
        </div>

        {step === 1 && (
          <StepInfo defaults={stepOne ?? undefined} onNext={handleStepOneNext} />
        )}
        {step === 2 && (
          <StepHours
            defaults={stepTwo?.hours}
            onNext={handleStepTwoNext}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepCatalog
            defaults={[]}
            onFinish={handleFinish}
            onBack={() => setStep(2)}
            isPending={isPending}
          />
        )}
      </main>
    </div>
  );
}
