"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, Download, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServiceInput } from "../actions";

type CatalogEntry = {
  code: string;
  name: string;
  price: number;
  durationMinutes: number;
  requiresFasting: boolean;
  fastingHours: number | null;
  instructions: string;
};

const COMMON_CATALOG: CatalogEntry[] = [
  {
    code: "BH-01",
    name: "Biometría hemática",
    price: 300,
    durationMinutes: 15,
    requiresFasting: true,
    fastingHours: 8,
    instructions: "Ayuno de 8 horas. No comer ni beber excepto agua.",
  },
  {
    code: "QS-35",
    name: "Química sanguínea 35",
    price: 650,
    durationMinutes: 20,
    requiresFasting: true,
    fastingHours: 12,
    instructions: "Ayuno de 12 horas. No comer ni beber excepto agua.",
  },
  {
    code: "EGO-01",
    name: "Examen general de orina",
    price: 180,
    durationMinutes: 10,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "LIP-01",
    name: "Perfil lipídico",
    price: 520,
    durationMinutes: 15,
    requiresFasting: true,
    fastingHours: 12,
    instructions: "Ayuno de 12 horas. No consumir alcohol 24 h antes.",
  },
  {
    code: "TSH-T3-T4",
    name: "Perfil tiroideo",
    price: 850,
    durationMinutes: 15,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "PSA-01",
    name: "Antígeno prostático (PSA)",
    price: 640,
    durationMinutes: 15,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "CPS-3",
    name: "Coproparasitoscópico",
    price: 220,
    durationMinutes: 10,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "GLU-01",
    name: "Glucosa en ayuno",
    price: 95,
    durationMinutes: 10,
    requiresFasting: true,
    fastingHours: 8,
    instructions: "Ayuno de 8 horas. Solo agua permitida.",
  },
  {
    code: "HBA1C",
    name: "Hemoglobina glucosilada (HbA1c)",
    price: 380,
    durationMinutes: 15,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "HEP-01",
    name: "Perfil hepático",
    price: 480,
    durationMinutes: 15,
    requiresFasting: true,
    fastingHours: 8,
    instructions: "Ayuno de 8 horas.",
  },
  {
    code: "COL-01",
    name: "Colesterol total",
    price: 160,
    durationMinutes: 10,
    requiresFasting: true,
    fastingHours: 12,
    instructions: "Ayuno de 12 horas.",
  },
  {
    code: "TRG-01",
    name: "Triglicéridos",
    price: 160,
    durationMinutes: 10,
    requiresFasting: true,
    fastingHours: 12,
    instructions: "Ayuno de 12 horas. Evitar alcohol 24 h antes.",
  },
  {
    code: "AU-01",
    name: "Ácido úrico",
    price: 130,
    durationMinutes: 10,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "CRE-01",
    name: "Creatinina",
    price: 120,
    durationMinutes: 10,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "UR-01",
    name: "Urea",
    price: 120,
    durationMinutes: 10,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "PAP-01",
    name: "Papanicolaou",
    price: 280,
    durationMinutes: 20,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "VDRL-01",
    name: "VDRL (sífilis)",
    price: 210,
    durationMinutes: 10,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "VIH-01",
    name: "VIH (ELISA)",
    price: 270,
    durationMinutes: 15,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "GPO-01",
    name: "Grupo sanguíneo y Rh",
    price: 160,
    durationMinutes: 10,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
  {
    code: "TP-01",
    name: "Tiempo de protrombina",
    price: 200,
    durationMinutes: 15,
    requiresFasting: false,
    fastingHours: null,
    instructions: "",
  },
];

type ExtraService = {
  name: string;
  price: string;
  durationMinutes: number;
  requiresFasting: boolean;
  instructions: string;
};

const EMPTY_FORM: ExtraService = {
  name: "",
  price: "",
  durationMinutes: 15,
  requiresFasting: false,
  instructions: "",
};

type StepCatalogProps = {
  defaults?: ServiceInput[];
  onFinish: (services: ServiceInput[]) => void;
  onBack: () => void;
  isPending: boolean;
};

export function StepCatalog({
  onFinish,
  onBack,
  isPending,
}: StepCatalogProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(COMMON_CATALOG.map((s) => s.code))
  );
  const [extras, setExtras] = useState<ExtraService[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [form, setForm] = useState<ExtraService>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  function toggleCode(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function handleAddManual() {
    if (!form.name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    const price = Number(form.price);
    if (!form.price || isNaN(price) || price <= 0) {
      setFormError("Ingresa un precio válido.");
      return;
    }
    setExtras((prev) => [...prev, { ...form, name: form.name.trim() }]);
    setForm(EMPTY_FORM);
    setFormError("");
    setManualOpen(false);
  }

  function removeExtra(index: number) {
    setExtras((prev) => prev.filter((_, i) => i !== index));
  }

  const selectedCatalog = useMemo(
    () => COMMON_CATALOG.filter((s) => selected.has(s.code)),
    [selected]
  );

  const totalCount = selectedCatalog.length + extras.length;
  const totalPrice = useMemo(() => {
    const fromCatalog = selectedCatalog.reduce((a, s) => a + s.price, 0);
    const fromExtras = extras.reduce((a, s) => a + Number(s.price), 0);
    return fromCatalog + fromExtras;
  }, [selectedCatalog, extras]);

  function handleFinish() {
    const final: ServiceInput[] = [
      ...selectedCatalog.map((s) => ({
        name: s.name,
        code: s.code,
        price: String(s.price),
        durationMinutes: s.durationMinutes as 10 | 15 | 20 | 30 | 45,
        requiresFasting: s.requiresFasting,
        fastingHours: s.fastingHours,
        instructions: s.instructions,
        category: "",
        description: "",
      })),
      ...extras.map((s) => ({
        name: s.name,
        code: "",
        price: s.price,
        durationMinutes: s.durationMinutes as 10 | 15 | 20 | 30 | 45,
        requiresFasting: s.requiresFasting,
        fastingHours: s.requiresFasting ? 8 : null,
        instructions: s.instructions,
        category: "",
        description: "",
      })),
    ];
    onFinish(final);
  }

  return (
    <div className="space-y-5 pb-32">
      {/* Import hint card */}
      <div
        className="flex items-center gap-4 rounded-xl border px-5 py-4"
        style={{
          background: "#F5F1EA",
          borderColor: "rgba(17,17,17,0.06)",
        }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "#111" }}
          aria-hidden="true"
        >
          <Download className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium text-foreground">
            Importar estudios comunes mexicanos
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            20 estudios con precios sugeridos basados en el promedio del mercado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          className="shrink-0 inline-flex h-8 items-center rounded-md border border-border bg-card px-3.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          Saltar este paso
        </button>
      </div>

      {/* Catalog table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header */}
        <div
          className="grid grid-cols-[28px_1fr_100px_100px_88px] items-center gap-3 border-b px-5 py-2.5"
          style={{
            background: "#FCFAF5",
            borderColor: "rgba(17,17,17,0.08)",
          }}
        >
          <span aria-hidden="true" />
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            Estudio
          </span>
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            Duración
          </span>
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            Ayuno
          </span>
          <span className="text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            Precio
          </span>
        </div>

        {/* Rows */}
        <ul>
          {COMMON_CATALOG.map((s) => {
            const checked = selected.has(s.code);
            return (
              <li
                key={s.code}
                className="border-t"
                style={{ borderColor: "rgba(17,17,17,0.06)" }}
              >
                <label
                  className="grid cursor-pointer grid-cols-[28px_1fr_100px_100px_88px] items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                  style={{ opacity: checked ? 1 : 0.4 }}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleCode(s.code)}
                    aria-label={s.name}
                  />
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`truncate text-[13px] font-medium ${
                        checked ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.name}
                    </span>
                    <span
                      className="shrink-0 rounded-[5px] border px-1.5 py-px font-mono text-[10.5px] text-muted-foreground"
                      style={{
                        background: "#F5F1EA",
                        borderColor: "rgba(17,17,17,0.08)",
                      }}
                    >
                      {s.code}
                    </span>
                  </div>
                  <span className="font-mono text-[12.5px] tabular-nums text-muted-foreground">
                    {s.durationMinutes} min
                  </span>
                  <span>
                    {s.requiresFasting && s.fastingHours ? (
                      <span
                        className="inline-block rounded-[5px] border px-1.5 py-0.5 font-mono text-[11px] font-medium"
                        style={{
                          background: "#F5EBD9",
                          color: "#8A5A1A",
                          borderColor: "rgba(138,90,26,0.18)",
                        }}
                      >
                        {s.fastingHours}h
                      </span>
                    ) : (
                      <span className="font-mono text-[12.5px] text-muted-foreground/40">
                        —
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-right font-mono text-[13px] font-medium tabular-nums ${
                      checked ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    ${s.price.toLocaleString("es-MX")}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Extras list */}
      {extras.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            className="border-b px-5 py-2.5"
            style={{
              background: "#FCFAF5",
              borderColor: "rgba(17,17,17,0.08)",
            }}
          >
            <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
              Estudios adicionales
            </span>
          </div>
          <ul>
            {extras.map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-t px-5 py-3"
                style={{ borderColor: "rgba(17,17,17,0.06)" }}
              >
                <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                  {s.name}
                </span>
                <span className="font-mono text-[12.5px] tabular-nums text-muted-foreground">
                  {s.durationMinutes} min
                </span>
                {s.requiresFasting && (
                  <span
                    className="rounded-[5px] border px-1.5 py-0.5 font-mono text-[11px] font-medium"
                    style={{
                      background: "#F5EBD9",
                      color: "#8A5A1A",
                      borderColor: "rgba(138,90,26,0.18)",
                    }}
                  >
                    8h
                  </span>
                )}
                <span className="w-16 text-right font-mono text-[13px] font-medium tabular-nums text-foreground">
                  ${Number(s.price).toLocaleString("es-MX")}
                </span>
                <button
                  type="button"
                  onClick={() => removeExtra(i)}
                  className="shrink-0 text-muted-foreground/60 transition-colors hover:text-destructive"
                  aria-label={`Eliminar ${s.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add custom study */}
      {!manualOpen ? (
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar un estudio que no esté en la lista
        </button>
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13.5px] font-semibold text-foreground">
              Nuevo estudio
            </h3>
            <button
              type="button"
              onClick={() => {
                setManualOpen(false);
                setForm(EMPTY_FORM);
                setFormError("");
              }}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-name">Nombre</Label>
            <Input
              id="svc-name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setFormError("");
              }}
              placeholder="Perfil ginecológico"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-price">Precio (MXN)</Label>
              <Input
                id="svc-price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => {
                  setForm((f) => ({ ...f, price: e.target.value }));
                  setFormError("");
                }}
                placeholder="350"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-duration">Duración</Label>
              <Select
                value={String(form.durationMinutes)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, durationMinutes: Number(v) }))
                }
              >
                <SelectTrigger id="svc-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 15, 20, 30, 45].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="fasting"
              checked={form.requiresFasting}
              onCheckedChange={(v) =>
                setForm((f) => ({
                  ...f,
                  requiresFasting: !!v,
                  instructions: v ? "Ayuno de 8 horas." : "",
                }))
              }
            />
            <Label htmlFor="fasting" className="cursor-pointer">
              Requiere ayuno
            </Label>
          </div>

          {form.requiresFasting && (
            <div className="space-y-1.5">
              <Label htmlFor="svc-instructions">Preparación</Label>
              <Textarea
                id="svc-instructions"
                value={form.instructions}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instructions: e.target.value }))
                }
                placeholder="Ayuno de 8 horas"
                rows={2}
              />
            </div>
          )}

          {formError && (
            <p role="alert" className="text-xs text-destructive">
              {formError}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleAddManual}
          >
            Agregar estudio
          </Button>
        </div>
      )}

      {/* Sticky footer */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 px-5 pb-5 pt-16"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(250,247,242,0.92) 28%, rgb(250,247,242) 55%)",
        }}
      >
        <div
          className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5"
          style={{ boxShadow: "0 8px 32px rgba(17,17,17,0.10)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] text-foreground">
              <span className="font-medium">{totalCount} de {COMMON_CATALOG.length}</span>{" "}
              <span className="text-muted-foreground">
                estudios seleccionados · Precio total promedio
              </span>{" "}
              <span className="font-mono font-medium tabular-nums">
                ${totalPrice.toLocaleString("es-MX")} MXN
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            disabled={isPending}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Atrás
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={isPending}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#111" }}
          >
            {isPending ? (
              "Guardando..."
            ) : (
              <>
                Finalizar y ver mi dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
