"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { parseYMD, formatTime12h } from "@/lib/hours";
import type { ServiceItem } from "./step-services";

const patientSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Ingresa 10 dígitos sin espacios ni guiones"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
});

export type PatientFormData = z.infer<typeof patientSchema>;

type StepPatientProps = {
  selectedServices: ServiceItem[];
  date: string;
  time: string;
  onBack: () => void;
  onSubmit: (patient: PatientFormData) => void;
  isPending: boolean;
  submitError: string;
};

export function StepPatient({
  selectedServices,
  date,
  time,
  onBack,
  onSubmit,
  isPending,
  submitError,
}: StepPatientProps) {
  const [consented, setConsented] = useState(true);
  const total = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const dateObj = parseYMD(date);
  const dayLabel = format(dateObj, "EEEE d 'de' MMMM", { locale: es });
  const timeLabel = formatTime12h(time);
  const dayNum = format(dateObj, "d");
  const monthLabel = format(dateObj, "MMM", { locale: es });

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  function handleSubmit(values: PatientFormData) {
    if (!consented) return;
    onSubmit(values);
  }

  return (
    <div>
      {/* Appointment summary card */}
      <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Tu cita
          </p>
          <button
            type="button"
            onClick={onBack}
            className="text-[11.5px] text-muted-foreground underline underline-offset-2"
          >
            Editar
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          {/* Date chip */}
          <div
            className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-lg"
            style={{ background: "#111", color: "#fff" }}
          >
            <span className="text-[8px] uppercase tracking-wider opacity-60">
              {monthLabel}
            </span>
            <span className="font-mono text-[18px] font-semibold leading-none tabular-nums">
              {dayNum}
            </span>
          </div>
          <div>
            <p className="text-[14px] font-medium capitalize text-foreground">
              {dayLabel}
            </p>
            <p className="text-[12px] text-muted-foreground">{timeLabel}</p>
          </div>
        </div>

        <div className="px-4 py-3.5">
          <ul className="space-y-1.5">
            {selectedServices.map((s) => (
              <li key={s.id} className="flex justify-between gap-3 text-[13px]">
                <span className="truncate text-foreground">{s.name}</span>
                <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                  ${Number(s.price).toLocaleString("es-MX")}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[12px] text-muted-foreground">
              Total a pagar en sitio
            </span>
            <span className="font-mono text-[16px] font-semibold tabular-nums text-foreground">
              ${total.toLocaleString("es-MX")}{" "}
              <span className="text-[11px] font-normal text-muted-foreground">
                MXN
              </span>
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Efectivo o tarjeta directamente en el laboratorio
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        id="patient-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="p-name">
            Nombre completo{" "}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="p-name"
            placeholder="Juan Pérez García"
            autoComplete="name"
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-[12px] text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="p-phone">
              Teléfono{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <span className="text-[11px] text-muted-foreground">
              Para recordatorios
            </span>
          </div>
          <Input
            id="p-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            pattern="[0-9]{10}"
            placeholder="5512345678"
            aria-invalid={!!form.formState.errors.phone}
            {...form.register("phone", {
              onChange: (e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                if (digits !== e.target.value) {
                  form.setValue("phone", digits, {
                    shouldValidate: form.formState.isSubmitted,
                  });
                }
              },
            })}
          />
          {form.formState.errors.phone && (
            <p className="text-[12px] text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="p-email">Email</Label>
            <span className="text-[11px] text-muted-foreground">opcional</span>
          </div>
          <Input
            id="p-email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-[12px] text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Consent */}
        <label className="flex cursor-pointer items-start gap-2.5 pt-1">
          <div
            className="mt-0.5 flex shrink-0 items-center justify-center rounded-[4px]"
            style={{
              width: 16,
              height: 16,
              border: `1px solid ${consented ? "#111" : "rgba(17,17,17,0.3)"}`,
              background: consented ? "#111" : "#fff",
            }}
            onClick={() => setConsented((v) => !v)}
          >
            {consented && (
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.5 8.5l3 3 6-6.5"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-[12px] leading-relaxed text-muted-foreground">
            Acepto recibir recordatorios y los{" "}
            <span className="text-foreground underline underline-offset-2">
              términos de servicio
            </span>
            .
          </span>
        </label>
      </form>

      {submitError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Sticky footer */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 px-5 pb-6 pt-14"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,247,242,0) 0%, rgba(250,247,242,0.95) 30%, rgb(250,247,242) 60%)",
        }}
      >
        <button
          type="submit"
          form="patient-form"
          disabled={isPending || !consented}
          className="pointer-events-auto flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-medium text-background transition-opacity disabled:opacity-40"
          style={{ background: "#111" }}
        >
          {isPending
            ? "Confirmando…"
            : `Confirmar cita · $${total.toLocaleString("es-MX")}`}
          {!isPending && (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <p className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2l5 2v4.5c0 3-2.2 4.8-5 5.5-2.8-.7-5-2.5-5-5.5V4l5-2z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          No se hace cargo a tu tarjeta
        </p>
      </div>

      <div className="h-36" />
    </div>
  );
}
