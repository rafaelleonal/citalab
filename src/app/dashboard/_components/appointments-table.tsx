"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AppointmentStatusBadge,
  type AppointmentStatus,
} from "@/components/appointment-status-badge";
import { formatTime12h } from "@/lib/hours";
import { updateAppointmentStatus } from "../actions";

export type AppointmentRow = {
  id: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  status: string;
  services: { id: string; name: string; requiresFasting: boolean }[];
  total: number;
  /** Prior appointments before today for the same phone in this lab. */
  priorVisits: number;
};

type Props = {
  rows: AppointmentRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  showDate?: boolean;
};

function refFromId(id: string) {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const head = clean.slice(0, 3);
  const tail = clean.slice(3, 8);
  return `${head}-${tail}`;
}

export function AppointmentsTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  showDate = false,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(
    id: string,
    status: AppointmentStatus,
    label: string
  ) {
    startTransition(async () => {
      const res = await updateAppointmentStatus({ appointmentId: id, status });
      if (res.ok) {
        toast.success(label);
      } else {
        toast.error("No se pudo actualizar la cita.");
      }
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          Sin citas para este periodo
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Los nuevos agendados aparecerán aquí.
        </p>
      </div>
    );
  }

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0 && !allSelected;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow
            className="hover:bg-transparent"
            style={{ background: "#FCFAF5" }}
          >
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onToggleAll}
                aria-label="Seleccionar todas"
              />
            </TableHead>
            <TableHead className="w-20 font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
              Hora
            </TableHead>
            <TableHead className="font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
              Paciente
            </TableHead>
            <TableHead className="font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
              Estudios
            </TableHead>
            <TableHead className="hidden w-28 font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground md:table-cell">
              Ref
            </TableHead>
            <TableHead className="w-32 font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
              Estado
            </TableHead>
            <TableHead className="w-24 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
              Total
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isRowPending = row.status === "pending";
            const isRowConfirmed = row.status === "confirmed";
            const hasFasting = row.services.some((s) => s.requiresFasting);
            const isTerminated =
              row.status === "cancelled" || row.status === "no_show";
            const isRecurring = row.priorVisits > 0;
            const isChecked = selected.has(row.id);
            return (
              <TableRow
                key={row.id}
                data-state={isChecked ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onToggle(row.id)}
                    aria-label={`Seleccionar cita de ${row.patientName}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-[12px] font-medium tabular-nums">
                  <div>{formatTime12h(row.time.slice(0, 5))}</div>
                  {showDate && (
                    <div className="mt-0.5 font-mono text-[10.5px] font-normal text-muted-foreground">
                      {row.date.slice(5).replace("-", "/")}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">
                    {row.patientName}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
                    <a
                      href={`tel:${row.patientPhone.replace(/\s/g, "")}`}
                      className="tabular-nums hover:text-foreground"
                    >
                      {row.patientPhone}
                    </a>
                    <span
                      className="inline-block rounded-[5px] px-1.5 py-px font-mono text-[10.5px]"
                      style={{
                        background: isRecurring ? "#F5F1EA" : "#EEF3F9",
                        color: isRecurring ? "#52514C" : "#2C5A8F",
                      }}
                    >
                      {isRecurring
                        ? `Recurrente (${row.priorVisits + 1})`
                        : "1ª visita"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[12.5px] text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span>
                      {row.services.map((s) => s.name).join(" · ")}
                    </span>
                    {hasFasting && (
                      <span
                        className="inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-px font-mono text-[11px]"
                        style={{
                          background: "#F5EBD9",
                          color: "#8A5A1A",
                          borderColor: "rgba(138,90,26,0.18)",
                        }}
                      >
                        Ayuno
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span
                    className="inline-block rounded-[5px] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                    style={{ background: "#F5F1EA" }}
                  >
                    {refFromId(row.id)}
                  </span>
                </TableCell>
                <TableCell>
                  <AppointmentStatusBadge status={row.status} />
                </TableCell>
                <TableCell
                  className={`text-right font-mono text-[12.5px] tabular-nums ${
                    isTerminated ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  ${row.total.toLocaleString("es-MX")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={isPending}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                      aria-label="Acciones"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isRowPending && (
                        <DropdownMenuItem
                          onSelect={() =>
                            handleStatusChange(
                              row.id,
                              "confirmed",
                              "Cita confirmada"
                            )
                          }
                        >
                          Marcar como confirmada
                        </DropdownMenuItem>
                      )}
                      {(isRowPending || isRowConfirmed) && (
                        <>
                          <DropdownMenuItem
                            onSelect={() =>
                              handleStatusChange(
                                row.id,
                                "completed",
                                "Cita marcada como atendida"
                              )
                            }
                          >
                            Marcar como atendida
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              handleStatusChange(
                                row.id,
                                "no_show",
                                "Cita marcada como no asistida"
                              )
                            }
                          >
                            Marcar como no asistió
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() =>
                              handleStatusChange(
                                row.id,
                                "cancelled",
                                "Cita cancelada"
                              )
                            }
                            className="text-destructive"
                          >
                            Cancelar cita
                          </DropdownMenuItem>
                        </>
                      )}
                      {!isRowPending && !isRowConfirmed && (
                        <DropdownMenuItem
                          onSelect={() =>
                            handleStatusChange(
                              row.id,
                              "pending",
                              "Cita restaurada a pendiente"
                            )
                          }
                        >
                          Restaurar a pendiente
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
