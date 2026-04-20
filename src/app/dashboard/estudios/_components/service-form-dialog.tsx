"use client";

import { useEffect, useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createService, updateService } from "../actions";

export type ServiceEditing = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  description: string | null;
  price: string;
  durationMinutes: number;
  requiresFasting: boolean;
  fastingHours: number | null;
  instructions: string | null;
  active: boolean;
};

const DURATION_VALUES = [10, 15, 20, 30, 45] as const;

const formSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ingresa un nombre de al menos 2 caracteres")
      .max(120, "Máximo 120 caracteres"),
    code: z.string().trim().max(20, "Máximo 20 caracteres"),
    category: z.string().trim().max(40, "Máximo 40 caracteres"),
    description: z.string().trim().max(200, "Máximo 200 caracteres"),
    price: z.coerce
      .number({ invalid_type_error: "El precio es requerido" })
      .positive("Debe ser mayor a 0")
      .max(99999, "Precio demasiado alto"),
    durationMinutes: z.coerce
      .number()
      .refine(
        (v) => (DURATION_VALUES as readonly number[]).includes(v),
        "Duración inválida"
      ),
    requiresFasting: z.boolean(),
    fastingHours: z.coerce
      .number()
      .int()
      .min(4, "Mínimo 4 horas")
      .max(24, "Máximo 24 horas")
      .optional(),
    instructions: z.string().trim().max(500),
  })
  .refine(
    (data) =>
      !data.requiresFasting || (data.instructions?.trim().length ?? 0) >= 10,
    {
      message: "Describe la preparación (mín. 10 caracteres)",
      path: ["instructions"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const EMPTY: FormValues = {
  name: "",
  code: "",
  category: "",
  description: "",
  price: 0,
  durationMinutes: 15,
  requiresFasting: false,
  fastingHours: 8,
  instructions: "",
};

export function ServiceFormDialog({
  open,
  onOpenChange,
  editing,
  categories,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: ServiceEditing | null;
  categories?: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const categoryListId = useId();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        name: editing.name,
        code: editing.code ?? "",
        category: editing.category ?? "",
        description: editing.description ?? "",
        price: Number(editing.price),
        durationMinutes: editing.durationMinutes,
        requiresFasting: editing.requiresFasting,
        fastingHours: editing.fastingHours ?? 8,
        instructions: editing.instructions ?? "",
      });
    } else {
      form.reset(EMPTY);
    }
  }, [open, editing, form]);

  const requiresFasting = form.watch("requiresFasting");
  const isEditing = !!editing;

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const payload = {
        name: values.name,
        code: values.code,
        category: values.category,
        description: values.description,
        price: values.price,
        durationMinutes: values.durationMinutes,
        requiresFasting: values.requiresFasting,
        fastingHours: values.requiresFasting ? values.fastingHours ?? 8 : null,
        instructions: values.requiresFasting ? values.instructions : "",
      };
      const res = isEditing
        ? await updateService(editing.id, payload)
        : await createService(payload);

      if (res.ok) {
        toast.success(isEditing ? "Estudio actualizado" : "Estudio creado");
        onOpenChange(false);
        router.refresh();
      } else if (res.error === "missing_instructions") {
        form.setError("instructions", {
          message: "Describe la preparación (mín. 10 caracteres)",
        });
      } else if (res.error === "not_found") {
        toast.error("El estudio ya no existe");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("No se pudo guardar el estudio");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    if (!next && form.formState.isDirty && !isPending) {
      if (!confirm("¿Descartar cambios?")) return;
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar estudio" : "Nuevo estudio"}
          </DialogTitle>
          <DialogDescription>
            Configura el estudio que ofrecerás a tus pacientes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">
              Nombre del estudio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s-name"
              autoFocus
              placeholder="Biometría hemática completa"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-code">Código</Label>
              <Input
                id="s-code"
                placeholder="BH-01"
                maxLength={20}
                {...form.register("code")}
              />
              {form.formState.errors.code && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-category">Categoría</Label>
              <Input
                id="s-category"
                list={categoryListId}
                placeholder="Hematología"
                maxLength={40}
                {...form.register("category")}
              />
              {categories && categories.length > 0 && (
                <datalist id={categoryListId}>
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              )}
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-description">
              Descripción breve{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (opcional)
              </span>
            </Label>
            <Input
              id="s-description"
              placeholder="Se mostrará en el catálogo público"
              maxLength={200}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-price">
                Precio (MXN) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="s-price"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="120"
                  className="pl-6"
                  {...form.register("price")}
                />
              </div>
              {form.formState.errors.price && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-duration">
                Duración <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(form.watch("durationMinutes"))}
                onValueChange={(v) =>
                  form.setValue("durationMinutes", Number(v), {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger id="s-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_VALUES.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={requiresFasting}
                onCheckedChange={(v) =>
                  form.setValue("requiresFasting", !!v, { shouldDirty: true })
                }
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  Requiere ayuno
                </p>
                <p className="text-xs text-muted-foreground">
                  El paciente debe prepararse antes del estudio
                </p>
              </div>
            </label>

            {requiresFasting && (
              <div className="mt-3 space-y-3 pl-7">
                <div className="space-y-1.5">
                  <Label htmlFor="s-fasting-hours" className="text-xs">
                    Horas de ayuno
                  </Label>
                  <Input
                    id="s-fasting-hours"
                    type="number"
                    min={4}
                    max={24}
                    step={1}
                    className="w-24"
                    {...form.register("fastingHours")}
                  />
                  {form.formState.errors.fastingHours && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.fastingHours.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-instructions" className="text-xs">
                    Instrucciones de preparación{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="s-instructions"
                    rows={3}
                    placeholder="Ayuno de 8 horas. No comer ni beber excepto agua."
                    {...form.register("instructions")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esto se mostrará al paciente en su confirmación.
                  </p>
                  {form.formState.errors.instructions && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.instructions.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isPending || (isEditing && !form.formState.isDirty)
              }
            >
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
