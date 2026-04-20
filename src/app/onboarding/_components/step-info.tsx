"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* Teléfono MX: 10 dígitos, opcional +52 y separadores. */
const PHONE_REGEX = /^(?:\+?52\s?)?(?:\d[\s-]?){9}\d$/;

const NAME_MAX = 120;
const ADDRESS_MAX = 300;
const PHONE_MAX = 20;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresa al menos 2 caracteres.")
    .max(NAME_MAX, `Máximo ${NAME_MAX} caracteres.`),
  address: z
    .string()
    .trim()
    .max(ADDRESS_MAX, `Máximo ${ADDRESS_MAX} caracteres.`),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || PHONE_REGEX.test(v),
      "Teléfono mexicano de 10 dígitos."
    ),
});

type FormValues = z.infer<typeof schema>;

type StepInfoProps = {
  defaults?: { name: string; address: string; phone: string };
  onNext: (data: { name: string; address: string; phone: string }) => void;
};

export function StepInfo({ defaults, onNext }: StepInfoProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: defaults?.name ?? "",
      address: defaults?.address ?? "",
      phone: defaults?.phone ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const address = watch("address") ?? "";

  function onSubmit(values: FormValues) {
    onNext({
      name: values.name,
      address: values.address,
      phone: values.phone,
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 md:p-7">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-describedby="step-info-desc"
        className="space-y-4"
      >
        <p id="step-info-desc" className="sr-only">
          Los campos marcados con asterisco son obligatorios.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="lab-name">
            Nombre del laboratorio{" "}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </Label>
          <Input
            id="lab-name"
            type="text"
            autoComplete="organization"
            autoFocus
            required
            maxLength={NAME_MAX}
            placeholder="Laboratorio Clínico del Valle"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "lab-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p
              id="lab-name-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="lab-address">
              Dirección{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (opcional)
              </span>
            </Label>
            <span
              className="text-[11px] tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              {address.length}/{ADDRESS_MAX}
            </span>
          </div>
          <Textarea
            id="lab-address"
            autoComplete="street-address"
            maxLength={ADDRESS_MAX}
            rows={3}
            placeholder="Av. Insurgentes Sur 1234, Col. Del Valle, CDMX"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "lab-address-error" : undefined}
            {...register("address")}
          />
          {errors.address && (
            <p
              id="lab-address-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lab-phone">
            Teléfono{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (opcional)
            </span>
          </Label>
          <Input
            id="lab-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={PHONE_MAX}
            placeholder="55 1234 5678"
            aria-invalid={!!errors.phone}
            aria-describedby={
              errors.phone ? "lab-phone-error" : "lab-phone-hint"
            }
            {...register("phone")}
          />
          {errors.phone ? (
            <p
              id="lab-phone-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.phone.message}
            </p>
          ) : (
            <p id="lab-phone-hint" className="text-xs text-muted-foreground">
              10 dígitos. Formato mexicano.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            Siguiente
          </Button>
        </div>
      </form>
    </section>
  );
}
