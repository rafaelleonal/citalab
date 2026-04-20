"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { WeeklyHours } from "@/db/schema";
import { StepServices, type ServiceItem } from "./step-services";
import { StepDatetime } from "./step-datetime";
import { StepPatient, type PatientFormData } from "./step-patient";
import { createAppointment } from "../actions";

type TakenAppointment = { date: string; time: string };

type BookingWizardProps = {
  slug: string;
  labName: string;
  labHours: WeeklyHours;
  services: ServiceItem[];
  takenAppointments: TakenAppointment[];
};

const STEP_LABELS = ["Estudios", "Fecha y hora", "Tus datos"];
const STEP_TITLES = [
  "¿Qué estudios\nvas a realizarte?",
  "¿Cuándo te\nacomoda venir?",
  "Casi listo.\nSolo lo esencial.",
];

export function BookingWizard({
  slug,
  labName,
  labHours,
  services,
  takenAppointments,
}: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const selectedServices = services.filter((s) => selectedIds.has(s.id));

  function handleBack() {
    if (step === 1) router.push(`/${slug}`);
    else if (step === 2) setStep(1);
    else setStep(2);
  }

  function handleDatetimeNext(d: string, t: string) {
    setDate(d);
    setTime(t);
    setStep(3);
  }

  function handlePatientSubmit(patient: PatientFormData) {
    setSubmitError("");
    startTransition(async () => {
      const result = await createAppointment({
        slug,
        serviceIds: Array.from(selectedIds),
        appointmentDate: date,
        appointmentTime: time,
        patientName: patient.name.trim(),
        patientPhone: patient.phone.trim(),
        patientEmail: (patient.email ?? "").trim(),
      });

      if (!result.ok) {
        if (result.error === "slot_taken") {
          setSubmitError(
            "Ese horario acaba de ocuparse. Por favor selecciona otro."
          );
          setStep(2);
        } else if (result.error === "rate_limited") {
          setSubmitError(
            "Has intentado agendar demasiadas veces. Espera unos minutos e intenta de nuevo."
          );
        } else {
          setSubmitError("No pudimos crear tu cita. Intenta de nuevo.");
        }
        return;
      }

      router.push(result.redirectPath);
    });
  }

  return (
    <div>
      {/* ── Step header ── */}
      <div className="mb-5">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-transparent transition-colors hover:bg-muted"
            aria-label="Regresar"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M11 7H3m0 0L6.5 3.5M3 7l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex-1 text-[12.5px] text-muted-foreground">
            <strong className="font-medium text-foreground">{labName}</strong>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/${slug}`)}
            className="border-none bg-transparent text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancelar
          </button>
        </div>

        <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
          Paso {step} de 3 · {STEP_LABELS[step - 1]}
        </p>

        <h1 className="whitespace-pre-line text-[1.65rem] font-semibold leading-[1.1] tracking-[-0.04em] text-foreground">
          {STEP_TITLES[step - 1]}
        </h1>

        <div className="mt-4 flex gap-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-[3px] flex-1 rounded-full transition-colors"
              style={{ background: n <= step ? "#111" : "rgba(17,17,17,0.12)" }}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <StepServices
          services={services}
          selectedIds={selectedIds}
          onChangeSelected={setSelectedIds}
          onNext={() => setStep(2)}
          onBack={handleBack}
        />
      )}
      {step === 2 && (
        <StepDatetime
          labHours={labHours}
          selectedServices={selectedServices}
          takenAppointments={takenAppointments}
          onBack={() => setStep(1)}
          onNext={handleDatetimeNext}
        />
      )}
      {step === 3 && (
        <StepPatient
          selectedServices={selectedServices}
          date={date}
          time={time}
          onBack={() => setStep(2)}
          onSubmit={handlePatientSubmit}
          isPending={isPending}
          submitError={submitError}
        />
      )}
    </div>
  );
}
