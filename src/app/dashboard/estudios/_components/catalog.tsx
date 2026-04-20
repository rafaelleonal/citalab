"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Download,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceFormDialog } from "./service-form-dialog";
import { DeleteServiceDialog } from "./delete-service-dialog";
import { PackageFormDialog } from "./package-form-dialog";
import { toggleServiceActive, deletePackage } from "../actions";

export type CatalogRow = {
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
  isPackage: boolean;
  items: { id: string; name: string; code: string | null; price: string }[];
};

type FilterKey = "all" | "packages" | "inactive" | string; // or category name

export function Catalog({
  rows,
}: {
  rows: CatalogRow[];
  labSlug: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [fastingOnly, setFastingOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogRow | null>(null);
  const [toDelete, setToDelete] = useState<CatalogRow | null>(null);
  const [pkgOpen, setPkgOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<CatalogRow | null>(null);

  // Derived category counts (only non-packages, active)
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      if (r.isPackage || !r.active) continue;
      const cat = r.category?.trim() || "Sin categoría";
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const totals = useMemo(() => {
    return {
      all: rows.filter((r) => r.active && !r.isPackage).length,
      packages: rows.filter((r) => r.active && r.isPackage).length,
      inactive: rows.filter((r) => !r.active).length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === "all") {
      list = list.filter((r) => r.active);
    } else if (filter === "packages") {
      list = list.filter((r) => r.active && r.isPackage);
    } else if (filter === "inactive") {
      list = list.filter((r) => !r.active);
    } else {
      // category
      list = list.filter(
        (r) =>
          r.active &&
          !r.isPackage &&
          (r.category?.trim() || "Sin categoría") === filter
      );
    }
    if (fastingOnly) list = list.filter((r) => r.requiresFasting);
    if (query.trim()) {
      const q = query
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      list = list.filter((r) => {
        const hay = `${r.name} ${r.code ?? ""} ${r.description ?? ""}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return hay.includes(q);
      });
    }
    return list;
  }, [rows, filter, fastingOnly, query]);

  function openNewStudy() {
    setEditing(null);
    setFormOpen(true);
  }
  function openNewPackage() {
    setEditingPkg(null);
    setPkgOpen(true);
  }
  function openEdit(row: CatalogRow) {
    if (row.isPackage) {
      setEditingPkg(row);
      setPkgOpen(true);
    } else {
      setEditing(row);
      setFormOpen(true);
    }
  }
  function handleToggle(row: CatalogRow) {
    startTransition(async () => {
      const res = await toggleServiceActive(row.id);
      if (res.ok) {
        toast.success(res.active ? "Activado" : "Desactivado");
        router.refresh();
      } else {
        toast.error("No se pudo actualizar");
      }
    });
  }
  function handleDeletePackage(row: CatalogRow) {
    if (!confirm(`¿Eliminar el paquete "${row.name}"?`)) return;
    startTransition(async () => {
      const res = await deletePackage(row.id);
      if (res.ok) {
        toast.success("Paquete eliminado");
        router.refresh();
      } else if (res.error === "has_future_appointments") {
        toast.error(
          `No se puede eliminar: tiene ${res.futureCount} cita(s) futura(s).`
        );
      } else {
        toast.error("No se pudo eliminar");
      }
    });
  }

  const activeStudies = rows.filter(
    (r) => r.active && !r.isPackage
  ) as CatalogRow[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Configurar · Estudios
          </p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            Catálogo de estudios
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {totals.all} estudios activos · Precios visibles en tu página
            pública.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Download className="h-3.5 w-3.5" />
            Importar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
              style={{ background: "#111" }}
              aria-label="Crear"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={openNewStudy}>
                Nuevo estudio
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={openNewPackage}
                disabled={activeStudies.length < 2}
              >
                Nuevo paquete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        {/* Category sidebar */}
        <aside className="overflow-hidden rounded-xl border border-border bg-card">
          <FilterRow
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Todos"
            count={totals.all}
            variant="primary"
          />
          {categories.length > 0 && (
            <div
              className="border-t"
              style={{ borderColor: "rgba(17,17,17,0.06)" }}
            >
              {categories.map(([cat, n]) => (
                <FilterRow
                  key={cat}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                  label={cat}
                  count={n}
                />
              ))}
            </div>
          )}
          <div
            className="border-t"
            style={{ borderColor: "rgba(17,17,17,0.06)" }}
          >
            <FilterRow
              active={filter === "packages"}
              onClick={() => setFilter("packages")}
              label="Paquetes"
              count={totals.packages}
            />
          </div>
          {totals.inactive > 0 && (
            <div
              className="border-t"
              style={{ borderColor: "rgba(17,17,17,0.06)" }}
            >
              <FilterRow
                active={filter === "inactive"}
                onClick={() => setFilter("inactive")}
                label="Inactivos"
                count={totals.inactive}
                muted
              />
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-card px-3"
              style={{ minWidth: 220 }}
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o código…"
                className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Buscar estudio"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Limpiar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Chip
              active={fastingOnly}
              onClick={() => setFastingOnly((v) => !v)}
            >
              Requiere ayuno
            </Chip>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                Sin resultados
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ajusta los filtros o crea un nuevo estudio.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {/* Table header */}
              <div
                className="grid grid-cols-[1fr_88px_72px_140px_80px_32px] items-center gap-4 border-b px-5 py-2.5"
                style={{
                  background: "#FCFAF5",
                  borderColor: "rgba(17,17,17,0.08)",
                }}
              >
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Estudio
                </span>
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Duración
                </span>
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Ayuno
                </span>
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Categoría
                </span>
                <span className="text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Precio
                </span>
                <span />
              </div>
              {/* Rows */}
              <ul>
                {filtered.map((r) => (
                  <li
                    key={r.id}
                    className="grid grid-cols-[1fr_88px_72px_140px_80px_32px] items-center gap-4 border-t px-5 py-3.5"
                    style={{ borderColor: "rgba(17,17,17,0.06)" }}
                  >
                    {/* Estudio */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`truncate text-[13.5px] font-medium ${
                            r.active
                              ? "text-foreground"
                              : "text-muted-foreground/70"
                          }`}
                        >
                          {r.name}
                        </span>
                        {r.code && (
                          <span
                            className="rounded-[5px] border px-1.5 py-px font-mono text-[10.5px] text-muted-foreground"
                            style={{
                              background: "#F5F1EA",
                              borderColor: "rgba(17,17,17,0.08)",
                            }}
                          >
                            {r.code}
                          </span>
                        )}
                        {r.isPackage && (
                          <span
                            className="rounded-[5px] border px-1.5 py-px font-mono text-[10.5px]"
                            style={{
                              background: "#EEF3F9",
                              color: "#2C5A8F",
                              borderColor: "rgba(44,90,143,0.18)",
                            }}
                          >
                            Paquete
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                          {r.description}
                        </p>
                      )}
                      {r.isPackage && r.items.length > 0 && (
                        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                          {r.items
                            .map((it) => it.code || it.name)
                            .join(" + ")}
                          {(() => {
                            const sum = r.items.reduce(
                              (a, s) => a + Number(s.price),
                              0
                            );
                            const save = sum - Number(r.price);
                            return save > 0
                              ? ` · Ahorro $${save.toLocaleString("es-MX")}`
                              : "";
                          })()}
                        </p>
                      )}
                    </div>
                    {/* Duración */}
                    <span className="font-mono text-[12.5px] tabular-nums text-muted-foreground">
                      {r.durationMinutes} min
                    </span>
                    {/* Ayuno */}
                    <span>
                      {r.requiresFasting ? (
                        <span
                          className="inline-block rounded-[5px] border px-1.5 py-0.5 font-mono text-[10.5px]"
                          style={{
                            background: "#F5EBD9",
                            color: "#8A5A1A",
                            borderColor: "rgba(138,90,26,0.18)",
                          }}
                        >
                          {r.fastingHours ?? 8}h
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </span>
                    {/* Categoría */}
                    <span className="truncate text-[12.5px] text-muted-foreground">
                      {r.isPackage
                        ? "Paquetes"
                        : r.category || (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                    </span>
                    {/* Precio */}
                    <span
                      className={`text-right font-mono text-[13.5px] font-medium tabular-nums ${
                        r.active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      ${Number(r.price).toLocaleString("es-MX")}
                    </span>
                    {/* Kebab */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={isPending}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                        aria-label="Acciones"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(r)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </DropdownMenuItem>
                        {!r.isPackage && (
                          <DropdownMenuItem
                            onSelect={() => handleToggle(r)}
                          >
                            <Power className="h-3.5 w-3.5" />
                            {r.active ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() =>
                            r.isPackage
                              ? handleDeletePackage(r)
                              : setToDelete(r)
                          }
                          className="text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                code: editing.code,
                category: editing.category,
                description: editing.description,
                price: editing.price,
                durationMinutes: editing.durationMinutes,
                requiresFasting: editing.requiresFasting,
                fastingHours: editing.fastingHours,
                instructions: editing.instructions,
                active: editing.active,
              }
            : null
        }
        categories={categories.map(([c]) => c).filter((c) => c !== "Sin categoría")}
      />
      <DeleteServiceDialog
        service={
          toDelete
            ? {
                id: toDelete.id,
                name: toDelete.name,
                price: toDelete.price,
                durationMinutes: toDelete.durationMinutes,
                requiresFasting: toDelete.requiresFasting,
                instructions: toDelete.instructions,
                active: toDelete.active,
              }
            : null
        }
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      />
      <PackageFormDialog
        open={pkgOpen}
        onOpenChange={setPkgOpen}
        editing={
          editingPkg
            ? {
                id: editingPkg.id,
                name: editingPkg.name,
                price: editingPkg.price,
                durationMinutes: editingPkg.durationMinutes,
                active: editingPkg.active,
                items: editingPkg.items.map((it) => ({
                  id: it.id,
                  name: it.name,
                  price: it.price,
                })),
              }
            : null
        }
        availableStudies={activeStudies.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price,
          durationMinutes: s.durationMinutes,
          requiresFasting: s.requiresFasting,
          instructions: s.instructions,
          active: s.active,
        }))}
      />
    </div>
  );
}

function FilterRow({
  active,
  onClick,
  label,
  count,
  variant,
  muted,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  variant?: "primary";
  muted?: boolean;
}) {
  const isPrimary = variant === "primary" && active;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-[13px] transition-colors"
      style={{
        background: isPrimary
          ? "#111"
          : active
            ? "rgba(17,17,17,0.04)"
            : "transparent",
        color: isPrimary
          ? "#fff"
          : active
            ? "#111"
            : muted
              ? "#8B8A83"
              : "#52514C",
        fontWeight: active ? 500 : 400,
      }}
    >
      <span>{label}</span>
      <span
        className="font-mono text-[11.5px] tabular-nums"
        style={{
          color: isPrimary
            ? "rgba(255,255,255,0.55)"
            : active
              ? "#8B8A83"
              : "#C7C4BC",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[12.5px] transition-colors"
      style={{
        background: active ? "#111" : "transparent",
        color: active ? "#fff" : "#52514C",
        borderColor: active ? "#111" : "rgba(17,17,17,0.12)",
        fontWeight: active ? 500 : 400,
      }}
    >
      {children}
    </button>
  );
}
