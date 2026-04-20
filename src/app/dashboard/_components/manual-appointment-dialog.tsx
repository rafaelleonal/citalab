"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createManualAppointment } from "../actions";

const schema = z.object({
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  name: z.string().trim().min(2, "Ingresa el nombre completo"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?52\s?)?(?:\d[\s-]?){10}$/, "Teléfono mexicano de 10 dígitos"),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export type ServiceOption = {
  id: string;
  name: string;
  price: string;
  requiresFasting: boolean;
};

export function ManualAppointmentDialog({
  services: serviceOptions,
  defaultDate,
}: {
  services: ServiceOption[];
  defaultDate: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionError, setSelectionError] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate,
      time: "",
      name: "",
      phone: "",
      email: "",
    },
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return serviceOptions;
    const q = query.toLowerCase();
    return serviceOptions.filter((s) => s.name.toLowerCase().includes(q));
  }, [serviceOptions, query]);

  const total = useMemo(
    () =>
      serviceOptions
        .filter((s) => selectedIds.has(s.id))
        .reduce((sum, s) => sum + Number(s.price), 0),
    [serviceOptions, selectedIds]
  );

  function toggle(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    if (next.size > 0) setSelectionError("");
  }

  function resetAndClose() {
    setOpen(false);
    setSelectedIds(new Set());
    setQuery("");
    setSelectionError("");
    form.reset({ date: defaultDate, time: "", name: "", phone: "", email: "" });
  }

  function onSubmit(values: FormValues) {
    if (selectedIds.size === 0) {
      setSelectionError("Selecciona al menos un estudio.");
      return;
    }
    startTransition(async () => {
      const res = await createManualAppointment({
        serviceIds: Array.from(selectedIds),
        appointmentDate: values.date,
        appointmentTime: values.time,
        patientName: values.name,
        patientPhone: values.phone,
        patientEmail: values.email ?? "",
      });

      if (res.ok) {
        toast.success("Cita creada correctamente");
        resetAndClose();
        router.refresh();
      } else if (res.error === "slot_taken") {
        toast.error("Ya hay una cita en ese horario");
      } else {
        toast.error("No se pudo crear la cita");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : resetAndClose())}>
      <DialogTrigger
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Nueva cita
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva cita manual</DialogTitle>
          <DialogDescription>
            Crea una cita para un paciente que agendó por teléfono o en persona.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Services */}
          <div className="space-y-2">
            <Label>Estudios</Label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Buscar estudio..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-52 overflow-y-auto rounded-md border border-border bg-card">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Sin resultados
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map((s) => {
                    const checked = selectedIds.has(s.id);
                    return (
                      <li key={s.id}>
                        <label
                          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                            checked ? "bg-muted/60" : "hover:bg-muted/40"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(s.id)}
                          />
                          <span className="flex-1 truncate text-foreground">
                            {s.name}
                          </span>
                          {s.requiresFasting && (
                            <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
                              Ayuno
                            </span>
                          )}
                          <span className="tabular-nums text-muted-foreground">
                            ${Number(s.price).toLocaleString("es-MX")}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {selectedIds.size} seleccionado
                {selectedIds.size !== 1 ? "s" : ""}
              </span>
              <span className="font-medium tabular-nums text-foreground">
                Total: ${total.toLocaleString("es-MX")} MXN
              </span>
            </div>
            {selectionError && (
              <p className="text-sm text-destructive">{selectionError}</p>
            )}
          </div>

          {/* Date & time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-date">Fecha</Label>
              <Input id="m-date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-time">Hora</Label>
              <Input id="m-time" type="time" {...form.register("time")} />
              {form.formState.errors.time && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.time.message}
                </p>
              )}
            </div>
          </div>

          {/* Patient */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-name">Nombre del paciente</Label>
              <Input id="m-name" placeholder="Juan Pérez" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-phone">Teléfono</Label>
                <Input
                  id="m-phone"
                  type="tel"
                  placeholder="55 1234 5678"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-email">Email (opcional)</Label>
                <Input
                  id="m-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
