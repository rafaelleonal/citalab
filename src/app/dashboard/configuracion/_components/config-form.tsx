"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HoursEditor, hasAnyOpenDay } from "@/components/hours-editor";
import type { WeeklyHours } from "@/db/schema";
import {
  updateLabHours,
  updateLabInfo,
  updateLabPreferences,
} from "../actions";

const phoneRegex = /^(?:\+?52\s?)?(?:\d[\s-]?){10}$/;

const infoSchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre válido").max(120),
  address: z.string().trim().max(300),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || phoneRegex.test(v),
      "Teléfono mexicano de 10 dígitos"
    ),
});

type InfoValues = z.infer<typeof infoSchema>;

type LabConfig = {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  hours: WeeklyHours;
  slotMinutes: number;
  minLeadHours: number;
};

const SECTIONS = [
  { id: "identidad", index: "01", label: "Identidad" },
  { id: "operacion", index: "02", label: "Operación" },
  { id: "reglas", index: "03", label: "Reglas de agenda" },
];

export function ConfigForm({ lab }: { lab: LabConfig }) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Configurar · Ajustes generales
        </p>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          Configuración del laboratorio
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Identidad pública, horarios de atención y reglas para agendar citas.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <SectionNav />
        <div className="space-y-8">
          <InfoSection lab={lab} />
          <HoursSection lab={lab} />
          <PreferencesSection lab={lab} />
        </div>
      </div>
    </div>
  );
}

function SectionNav() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Secciones" className="lg:sticky lg:top-20 lg:self-start">
      <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        En esta página
      </p>
      <ul className="space-y-px border-l border-border">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex items-baseline gap-2 px-3 py-1.5 text-[12.5px] transition-colors"
                style={{
                  borderLeft: isActive
                    ? "1.5px solid #111"
                    : "1.5px solid transparent",
                  marginLeft: "-1px",
                  color: isActive ? "#111" : "#8B8A83",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span
                  className="font-mono text-[10.5px] tabular-nums"
                  style={{ color: isActive ? "#52514C" : "#C7C4BC" }}
                >
                  {s.index}
                </span>
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Section({
  id,
  index,
  label,
  title,
  description,
  children,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-border bg-card"
    >
      <header
        className="flex flex-wrap items-start justify-between gap-3 px-6 py-5"
        style={{ background: "#FCFAF5", borderBottom: "0.5px solid rgba(17,17,17,0.08)" }}
      >
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {index} · {label}
          </p>
          <h2 className="mt-1.5 text-[17px] font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      <div className="p-6 md:p-7">{children}</div>
    </section>
  );
}

function SectionFooter({
  isPending,
  disabled,
  onSave,
}: {
  isPending: boolean;
  disabled: boolean;
  onSave?: () => void;
}) {
  return (
    <div
      className="mt-6 flex items-center justify-end gap-3 border-t pt-4"
      style={{ borderColor: "rgba(17,17,17,0.08)" }}
    >
      {disabled && !isPending ? (
        <p className="font-mono text-[11px] text-muted-foreground">
          Sin cambios
        </p>
      ) : null}
      <Button
        type={onSave ? "button" : "submit"}
        onClick={onSave}
        disabled={isPending || disabled}
        size="sm"
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  required,
  children,
  hint,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <Label
        htmlFor={htmlFor}
        className="font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground"
      >
        {children}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {hint && (
        <span className="font-mono text-[10.5px] text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}

/* ───────── Info ───────── */

function InfoSection({ lab }: { lab: LabConfig }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<InfoValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: lab.name,
      address: lab.address,
      phone: lab.phone,
    },
  });

  function onSubmit(values: InfoValues) {
    startTransition(async () => {
      const res = await updateLabInfo(values);
      if (res.ok) {
        toast.success("Datos actualizados");
        form.reset(values);
        router.refresh();
      } else {
        toast.error("No se pudieron guardar los cambios");
      }
    });
  }

  return (
    <Section
      id="identidad"
      index="01"
      label="Identidad"
      title="Información pública"
      description="Estos datos aparecen en tu página pública y en las confirmaciones de cita."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="l-name" required>
              Nombre del laboratorio
            </FieldLabel>
            <Input id="l-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <FieldLabel>URL pública</FieldLabel>
            <TooltipProvider>
              <div
                className="flex items-stretch overflow-hidden rounded-md border border-border"
                style={{ background: "#F5F1EA" }}
              >
                <span className="flex items-center px-3 font-mono text-[11.5px] text-muted-foreground">
                  citalab.mx/
                </span>
                <div className="flex-1 border-l border-border bg-card px-3 py-2 font-mono text-[12.5px] text-foreground">
                  {lab.slug}
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        className="flex items-center border-l border-border bg-card px-3 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Por qué no se puede cambiar"
                      >
                        <Lock className="h-3.5 w-3.5" />
                      </button>
                    }
                  />
                  <TooltipContent className="max-w-xs">
                    El slug no se puede cambiar para proteger los links que ya
                    compartiste con tus pacientes.
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="l-phone">Teléfono</FieldLabel>
            <Input
              id="l-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              placeholder="55 1234 5678"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <FieldLabel htmlFor="l-address">Dirección</FieldLabel>
            <Textarea
              id="l-address"
              rows={2}
              maxLength={300}
              placeholder="Av. Ejemplo 123, Col. Centro, CDMX"
              {...form.register("address")}
            />
          </div>
        </div>

        <SectionFooter
          isPending={isPending}
          disabled={!form.formState.isDirty}
        />
      </form>
    </Section>
  );
}

/* ───────── Hours ───────── */

function HoursSection({ lab }: { lab: LabConfig }) {
  const router = useRouter();
  const [hours, setHours] = useState<WeeklyHours>(lab.hours);
  const [isPending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  function handleChange(next: WeeklyHours) {
    setHours(next);
    setDirty(true);
  }

  function handleSave() {
    if (!hasAnyOpenDay(hours)) {
      toast.error("Debe haber al menos un día abierto");
      return;
    }
    startTransition(async () => {
      const res = await updateLabHours(hours);
      if (res.ok) {
        toast.success("Horarios actualizados");
        setDirty(false);
        router.refresh();
      } else if (res.error === "no_open_day") {
        toast.error("Debe haber al menos un día abierto");
      } else {
        toast.error("No se pudieron guardar los horarios");
      }
    });
  }

  return (
    <Section
      id="operacion"
      index="02"
      label="Operación"
      title="Horarios de atención"
      description="Los pacientes solo podrán agendar dentro de estos horarios. Los cambios afectan la disponibilidad pública de inmediato."
    >
      <HoursEditor value={hours} onChange={handleChange} />
      <SectionFooter
        isPending={isPending}
        disabled={!dirty}
        onSave={handleSave}
      />
    </Section>
  );
}

/* ───────── Preferences ───────── */

function PreferencesSection({ lab }: { lab: LabConfig }) {
  const router = useRouter();
  const [slotMinutes, setSlotMinutes] = useState(lab.slotMinutes);
  const [minLeadHours, setMinLeadHours] = useState(lab.minLeadHours);
  const [isPending, startTransition] = useTransition();

  const dirty =
    slotMinutes !== lab.slotMinutes || minLeadHours !== lab.minLeadHours;

  function handleSave() {
    startTransition(async () => {
      const res = await updateLabPreferences({ slotMinutes, minLeadHours });
      if (res.ok) {
        toast.success("Preferencias actualizadas");
        router.refresh();
      } else {
        toast.error("No se pudieron guardar las preferencias");
      }
    });
  }

  return (
    <Section
      id="reglas"
      index="03"
      label="Reglas de agenda"
      title="Preferencias"
      description="Controlan cómo los pacientes ven la disponibilidad en tu página pública."
    >
      <div className="space-y-6">
        {/* Slot */}
        <div className="space-y-2">
          <FieldLabel>Duración de cada slot</FieldLabel>
          <RadioGroup
            value={String(slotMinutes)}
            onValueChange={(v) => v && setSlotMinutes(Number(v))}
            className="flex flex-wrap gap-2"
          >
            {[15, 30, 45].map((m) => (
              <label
                key={m}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 font-mono text-[12px] tabular-nums transition-colors"
                style={{
                  background: slotMinutes === m ? "#111" : "transparent",
                  color: slotMinutes === m ? "#fff" : "#52514C",
                  borderColor:
                    slotMinutes === m ? "#111" : "rgba(17,17,17,0.12)",
                }}
              >
                <RadioGroupItem
                  value={String(m)}
                  className="sr-only"
                  aria-label={`${m} minutos`}
                />
                {m} min
              </label>
            ))}
          </RadioGroup>
          <p className="text-[12px] text-muted-foreground">
            Intervalo entre horarios disponibles para agendar.
          </p>
        </div>

        {/* Lead */}
        <div className="space-y-2">
          <FieldLabel htmlFor="min-lead">Anticipación mínima</FieldLabel>
          <Select
            value={String(minLeadHours)}
            onValueChange={(v) => v && setMinLeadHours(Number(v))}
          >
            <SelectTrigger id="min-lead" className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Sin límite</SelectItem>
              <SelectItem value="1">1 hora</SelectItem>
              <SelectItem value="2">2 horas</SelectItem>
              <SelectItem value="4">4 horas</SelectItem>
              <SelectItem value="24">24 horas</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[12px] text-muted-foreground">
            Tiempo mínimo entre ahora y una cita agendable.
          </p>
        </div>

        {/* WhatsApp coming soon */}
        <div
          className="rounded-lg border px-4 py-3.5"
          style={{
            background: "#F5F1EA",
            borderColor: "rgba(17,17,17,0.06)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium text-foreground">
                  Recordatorios por WhatsApp
                </p>
                <span
                  className="rounded-[5px] border px-1.5 py-px font-mono text-[10.5px]"
                  style={{
                    background: "#EEF3F9",
                    color: "#2C5A8F",
                    borderColor: "rgba(44,90,143,0.18)",
                  }}
                >
                  Próximamente
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Envía un recordatorio automático 24 horas antes de cada cita.
              </p>
            </div>
            <Switch disabled aria-label="Recordatorios WhatsApp" />
          </div>
        </div>
      </div>

      <SectionFooter
        isPending={isPending}
        disabled={!dirty}
        onSave={handleSave}
      />
    </Section>
  );
}
