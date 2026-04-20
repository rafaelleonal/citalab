"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  ChevronDown,
  Columns3,
  Download,
  Plus,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateYMD, formatTime12h, parseYMD } from "@/lib/hours";
import {
  AppointmentsTable,
  type AppointmentRow,
} from "./appointments-table";
import {
  ManualAppointmentDialog,
  type ServiceOption,
} from "./manual-appointment-dialog";

type Range = "today" | "tomorrow" | "week" | "date";

type RecentActivity = {
  id: string;
  patientName: string;
  status: string;
  date: string;
  time: string;
  at: string;
  isNew: boolean;
};

type Props = {
  lab: { slug: string; name: string };
  rows: AppointmentRow[];
  stats: { total: number; pending: number; projectedRevenue: number };
  labServices: ServiceOption[];
  range: Range;
  selectedDate: string;
  rangeLabel: string;
  recentActivity: RecentActivity[];
};

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

export function CitasView({
  rows,
  stats,
  labServices,
  range,
  selectedDate,
  rangeLabel,
  recentActivity,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [studyFilter, setStudyFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const showDateCol = range === "week";

  // Client-side filtering by status + study
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (
        studyFilter !== "all" &&
        !r.services.some((s) => s.id === studyFilter)
      )
        return false;
      return true;
    });
  }, [rows, statusFilter, studyFilter]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === filteredRows.length) return new Set();
      return new Set(filteredRows.map((r) => r.id));
    });
  }

  function setRange(next: Range, date?: string) {
    const params = new URLSearchParams();
    params.set("range", next);
    if (next === "date" && date) params.set("date", date);
    router.push(`${pathname}?${params.toString()}`);
    setSelected(new Set());
  }

  // For agenda panel: only today's pending/confirmed, time-sorted
  const agendaItems = rows
    .filter((r) => r.status !== "cancelled" && r.status !== "no_show")
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Operaciones · Agenda
            </p>
            <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Citas
            </h1>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              {range === "week"
                ? "Próximos 7 días"
                : range === "today"
                  ? "Agenda de hoy"
                  : range === "tomorrow"
                    ? "Agenda de mañana"
                    : format(parseYMD(selectedDate), "EEEE d 'de' MMMM", {
                        locale: es,
                      })}
              {stats.total > 0 && (
                <>
                  {" "}— {stats.total}{" "}
                  {stats.total === 1 ? "cita" : "citas"}
                  {stats.pending > 0 &&
                    `, ${stats.pending} ${stats.pending === 1 ? "pendiente" : "pendientes"}`}
                  .
                </>
              )}
            </p>
          </div>
          <ManualAppointmentDialog
            services={labServices}
            defaultDate={selectedDate}
          />
        </div>

        {/* Summary strip with Ver reportes */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-card px-4 py-3.5">
          <SummaryItem value={stats.total.toString()} label="citas" />
          <SummaryDivider />
          <SummaryItem
            value={stats.pending.toString()}
            label="pendientes de atender"
          />
          <SummaryDivider />
          <SummaryItem
            value={`$${stats.projectedRevenue.toLocaleString("es-MX")}`}
            unit="MXN"
            label="proyectado"
          />
          <Link
            href="/dashboard/reportes"
            className="ml-auto inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver reportes
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Filter chip bar */}
        <div className="flex flex-wrap items-center gap-2">
          <RangeChip
            active={range === "today"}
            onClick={() => setRange("today")}
          >
            Hoy
          </RangeChip>
          <RangeChip
            active={range === "tomorrow"}
            onClick={() => setRange("tomorrow")}
          >
            Mañana
          </RangeChip>
          <RangeChip
            active={range === "week"}
            onClick={() => setRange("week")}
          >
            Esta semana
          </RangeChip>
          <DateRangeChip
            active={range === "date"}
            date={selectedDate}
            onPick={(ymd) => setRange("date", ymd)}
            rangeLabel={range === "date" ? rangeLabel : undefined}
          />

          <span
            className="mx-1 hidden h-5 w-px sm:block"
            style={{ background: "rgba(17,17,17,0.1)" }}
            aria-hidden
          />

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] text-foreground transition-colors hover:bg-muted">
              <span className="text-muted-foreground">Estado:</span>
              <span>{STATUS_LABEL[statusFilter]}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((s) => (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => setStatusFilter(s)}
                >
                  {STATUS_LABEL[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Study filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] text-foreground transition-colors hover:bg-muted">
              <span className="text-muted-foreground">Estudio:</span>
              <span className="max-w-[120px] truncate">
                {studyFilter === "all"
                  ? "Cualquiera"
                  : labServices.find((s) => s.id === studyFilter)?.name ||
                    "Cualquiera"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-72 overflow-auto">
              <DropdownMenuItem onSelect={() => setStudyFilter("all")}>
                Cualquiera
              </DropdownMenuItem>
              {labServices.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onSelect={() => setStudyFilter(s.id)}
                >
                  {s.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-dashed border-border bg-transparent px-2.5 text-[12.5px] text-muted-foreground transition-colors hover:border-solid hover:bg-card hover:text-foreground"
            aria-label="Agregar filtro"
            onClick={() => {
              /* placeholder */
            }}
          >
            <Plus className="h-3 w-3" />
            Filtro
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              Exportar
            </button>
            <button
              type="button"
              disabled
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <Columns3 className="h-3 w-3" />
              Columnas
            </button>
          </div>
        </div>

        {/* Selected banner */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px]">
            <span className="text-muted-foreground">
              {selected.size}{" "}
              {selected.size === 1 ? "cita seleccionada" : "citas seleccionadas"}
            </span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Limpiar
            </button>
          </div>
        )}

        <AppointmentsTable
          rows={filteredRows}
          selected={selected}
          onToggle={toggleRow}
          onToggleAll={toggleAll}
          showDate={showDateCol}
        />
      </div>

      {/* Right sidebar */}
      <aside className="hidden min-w-0 space-y-5 xl:block">
        <AgendaPanel items={agendaItems} />
        <ActivityPanel activity={recentActivity} />
      </aside>
    </div>
  );
}

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "Todos",
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Atendido",
  cancelled: "Cancelado",
};

function SummaryItem({
  value,
  unit,
  label,
}: {
  value: string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
    </div>
  );
}

function SummaryDivider() {
  return <span className="hidden h-[22px] w-px bg-border sm:block" />;
}

function RangeChip({
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
      className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] transition-colors"
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

function DateRangeChip({
  active,
  date,
  onPick,
  rangeLabel,
}: {
  active: boolean;
  date: string;
  onPick: (ymd: string) => void;
  rangeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = parseYMD(date);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] transition-colors"
        style={{
          background: active ? "#111" : "transparent",
          color: active ? "#fff" : "#52514C",
          borderColor: active ? "#111" : "rgba(17,17,17,0.12)",
          fontWeight: active ? 500 : 400,
        }}
      >
        <CalendarIcon className="h-3 w-3" />
        {active && rangeLabel ? rangeLabel : "Fecha…"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={current}
          onSelect={(d) => {
            if (d) {
              onPick(formatDateYMD(d));
              setOpen(false);
            }
          }}
          locale={es}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}

function AgendaPanel({ items }: { items: AppointmentRow[] }) {
  const next = items.find(
    (i) => i.status === "pending" || i.status === "confirmed"
  );
  return (
    <div className="rounded-xl border border-border bg-card">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "0.5px solid rgba(17,17,17,0.08)" }}
      >
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Agenda del día
        </p>
        {next && (
          <span className="font-mono text-[10.5px] text-muted-foreground">
            Próxima · {formatTime12h(next.time.slice(0, 5))}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          Sin citas para hoy.
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: "rgba(17,17,17,0.05)" }}>
          {items.slice(0, 8).map((i) => {
            const color =
              i.status === "confirmed"
                ? "#2C5A8F"
                : i.status === "completed"
                  ? "#0B6E4F"
                  : "#C7A03A";
            return (
              <li
                key={i.id}
                className="grid grid-cols-[58px_6px_1fr] items-center gap-2.5 px-4 py-2.5"
              >
                <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
                  {formatTime12h(i.time.slice(0, 5))}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: color }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-foreground">
                    {i.patientName}
                  </p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {i.services.map((s) => s.name).join(" · ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ActivityPanel({ activity }: { activity: RecentActivity[] }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div
        className="px-4 py-3"
        style={{ borderBottom: "0.5px solid rgba(17,17,17,0.08)" }}
      >
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Actividad reciente
        </p>
      </div>
      {activity.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          Sin actividad aún.
        </div>
      ) : (
        <ul
          className="divide-y"
          style={{ borderColor: "rgba(17,17,17,0.05)" }}
        >
          {activity.map((a) => (
            <li key={a.id + a.at} className="px-4 py-3">
              <div className="flex items-center gap-2 text-[12.5px]">
                <span
                  className="inline-block rounded-[5px] px-1.5 py-px font-mono text-[10.5px]"
                  style={{
                    background: a.isNew ? "#E6F2EC" : "#F5F1EA",
                    color: a.isNew ? "#0B6E4F" : "#52514C",
                  }}
                >
                  {a.isNew ? "Nueva" : statusLabelFor(a.status)}
                </span>
                <span className="truncate text-foreground">
                  {a.patientName}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {format(parseYMD(a.date), "d MMM", { locale: es })} ·{" "}
                {formatTime12h(a.time.slice(0, 5))}
                {" · "}
                {relativeTime(a.at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function statusLabelFor(status: string): string {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmada";
    case "completed":
      return "Atendida";
    case "no_show":
      return "No asistió";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days} d`;
  return format(new Date(iso), "d MMM", { locale: es });
}

