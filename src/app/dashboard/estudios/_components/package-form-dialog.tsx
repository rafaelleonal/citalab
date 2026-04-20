"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createPackage, updatePackage } from "../actions";

export type PackageEditing = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  active: boolean;
  items: { id: string; name: string; price: string }[];
};

export type PackageStudyOption = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  requiresFasting: boolean;
  instructions: string | null;
  active: boolean;
};

const DURATION_VALUES = [10, 15, 20, 30, 45, 60] as const;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: PackageEditing | null;
  availableStudies: PackageStudyOption[];
};

export function PackageFormDialog({
  open,
  onOpenChange,
  editing,
  availableStudies,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  // Reset form state when the dialog opens or the editing target changes.
  // React 19 idiom: setState during render guarded by a key is preferred over useEffect+setState.
  const instanceKey = open ? (editing?.id ?? "new") : null;
  const [lastKey, setLastKey] = useState<string | null>(null);
  if (instanceKey !== lastKey) {
    setLastKey(instanceKey);
    if (instanceKey !== null) {
      if (editing) {
        setName(editing.name);
        setPrice(String(Number(editing.price)));
        setDuration(editing.durationMinutes);
        setSelected(new Set(editing.items.map((i) => i.id)));
      } else {
        setName("");
        setPrice("");
        setDuration(30);
        setSelected(new Set());
      }
      setError("");
    }
  }

  const sumPrice = useMemo(() => {
    return availableStudies
      .filter((s) => selected.has(s.id))
      .reduce((a, s) => a + Number(s.price), 0);
  }, [availableStudies, selected]);

  const priceNum = Number(price);
  const savings = sumPrice - (isNaN(priceNum) ? 0 : priceNum);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Ingresa un nombre.");
      return;
    }
    const p = Number(price);
    if (!price || isNaN(p) || p <= 0) {
      setError("Ingresa un precio válido.");
      return;
    }
    if (selected.size < 2) {
      setError("Selecciona al menos 2 estudios.");
      return;
    }
    setError("");

    const payload = {
      name: name.trim(),
      price: p,
      durationMinutes: duration,
      itemIds: Array.from(selected),
    };

    startTransition(async () => {
      const res = editing
        ? await updatePackage(editing.id, payload)
        : await createPackage(payload);
      if (res.ok) {
        toast.success(editing ? "Paquete actualizado" : "Paquete creado");
        onOpenChange(false);
        router.refresh();
      } else if (res.error === "invalid_items") {
        toast.error("Algún estudio ya no está disponible.");
      } else {
        toast.error("No se pudo guardar el paquete");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar paquete" : "Nuevo paquete"}
          </DialogTitle>
          <DialogDescription>
            Agrupa estudios y ofrece un precio combinado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="pkg-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pkg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Perfil ejecutivo"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-price">
                Precio (MXN) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="pkg-price"
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1200"
                  className="pl-6"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-duration">Duración</Label>
              <Select
                value={String(duration)}
                onValueChange={(v) => setDuration(Number(v))}
              >
                <SelectTrigger id="pkg-duration" className="w-full">
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

          <div className="space-y-2">
            <Label>
              Estudios incluidos <span className="text-destructive">*</span>{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (selecciona al menos 2)
              </span>
            </Label>
            {availableStudies.length < 2 ? (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Necesitas al menos 2 estudios activos para crear un paquete.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-background">
                <ul className="divide-y divide-border">
                  {availableStudies.map((s) => {
                    const checked = selected.has(s.id);
                    return (
                      <li key={s.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-[13px] transition-colors hover:bg-muted/40">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(s.id)}
                          />
                          <span className="flex-1 truncate text-foreground">
                            {s.name}
                          </span>
                          <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
                            ${Number(s.price).toLocaleString("es-MX")}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {selected.size > 0 && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[12px]">
              <span className="text-muted-foreground">
                Suma individual: ${sumPrice.toLocaleString("es-MX")}
              </span>
              {savings > 0 && (
                <span
                  className="rounded-[5px] border px-1.5 py-0.5 font-mono text-[11px] font-medium"
                  style={{
                    background: "#E6F2EC",
                    color: "#0B6E4F",
                    borderColor: "rgba(11,110,79,0.18)",
                  }}
                >
                  Ahorro ${savings.toLocaleString("es-MX")}
                </span>
              )}
              {savings < 0 && price && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  Precio mayor que suma individual
                </span>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
