"use client";

import { useMemo, useState } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import type { WeeklyHours } from "@/db/schema";
import { Calendar } from "@/components/ui/calendar";
import {
  generateSlots,
  formatDateYMD,
  isDayOpen,
  type Slot,
} from "@/lib/hours";
import type { ServiceItem } from "./step-services";

export type PatientFormData = {
  name: string;
  phone: string;
  email: string;
};

type TakenAppointment = { date: string; time: string };

type StepDatetimeProps = {
  labHours: WeeklyHours;
  selectedServices: ServiceItem[];
  takenAppointments: TakenAppointment[];
  onBack: () => void;
  onNext: (date: string, time: string) => void;
};

export function StepDatetime({
  labHours,
  selectedServices,
  takenAppointments,
  onBack,
  onNext,
}: StepDatetimeProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [timeError, setTimeError] = useState("");

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const takenByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const t of takenAppointments) {
      const set = map.get(t.date) ?? new Set<string>();
      set.add(t.time);
      map.set(t.date, set);
    }
    return map;
  }, [takenAppointments]);

  const slots: Slot[] = useMemo(() => {
    if (!date) return [];
    const ymd = formatDateYMD(date);
    const taken = takenByDate.get(ymd) ?? new Set<string>();
    return generateSlots(labHours, date, taken, new Date());
  }, [date, labHours, takenByDate]);

  const morningSlots = slots.filter((s) => {
    const h = parseInt(s.time.split(":")[0]);
    return h < 12;
  });
  const afternoonSlots = slots.filter((s) => {
    const h = parseInt(s.time.split(":")[0]);
    return h >= 12;
  });

  const hasFasting = selectedServices.some((s) => s.requiresFasting);
  const total = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

  function handleNext() {
    if (!date) return;
    if (!time) {
      setTimeError("Selecciona un horario para continuar.");
      return;
    }
    onNext(formatDateYMD(date), time);
  }

  const SlotButton = ({ slot }: { slot: Slot }) => {
    const sel = slot.time === time;
    return (
      <button
        type="button"
        disabled={!slot.available}
        onClick={() => {
          setTime(slot.time);
          setTimeError("");
        }}
        className="flex h-9 items-center justify-center rounded-lg text-[13px] font-medium tabular-nums transition-colors"
        style={{
          border: `0.5px solid ${sel ? "#111" : "rgba(17,17,17,0.12)"}`,
          background: sel ? "#111" : slot.available ? "#fff" : "transparent",
          color: sel ? "#fff" : slot.available ? "#111" : "#C7C4BC",
          textDecoration: slot.available ? "none" : "line-through",
          boxShadow: sel ? "0 2px 8px rgba(17,17,17,0.15)" : "none",
          cursor: slot.available ? "pointer" : "not-allowed",
        }}
      >
        {slot.label}
      </button>
    );
  };

  return (
    <div>
      {/* Calendar */}
      <div className="mb-3.5 overflow-hidden rounded-xl border border-border bg-card p-4">
        <div className="rounded-lg border border-border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setTime(null);
              setTimeError("");
            }}
            disabled={(d) => d < todayStart || !isDayOpen(labHours, d)}
            locale={es}
            className="p-3"
          />
        </div>

        {/* Legend */}
        {date && (
          <div className="mt-3 flex gap-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#0B6E4F" }} />
              Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-[3px]"
                style={{ background: "#111" }}
              />
              Seleccionado
            </span>
            <span className="flex items-center gap-1.5 line-through">
              Ocupado
            </span>
          </div>
        )}
      </div>

      {/* Time slots */}
      {date && (
        <div className="mb-3.5 rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-foreground">
                {format(date, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {slots.filter((s) => s.available).length} horarios disponibles
              </p>
            </div>
          </div>

          {slots.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No hay horarios disponibles ese día.
            </p>
          ) : (
            <>
              {morningSlots.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                      Mañana
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {morningSlots.map((s) => (
                      <SlotButton key={s.time} slot={s} />
                    ))}
                  </div>
                </div>
              )}
              {afternoonSlots.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                      Tarde
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {afternoonSlots.map((s) => (
                      <SlotButton key={s.time} slot={s} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {timeError && (
            <p role="alert" className="mt-3 text-[12px] text-destructive">
              {timeError}
            </p>
          )}
        </div>
      )}

      {/* Fasting warning */}
      {hasFasting && date && time && (
        <div
          className="mb-3.5 flex items-start gap-2.5 rounded-xl p-3.5"
          style={{
            background: "#F5EBD9",
            border: "0.5px solid rgba(138,90,26,0.18)",
          }}
        >
          <svg
            className="mt-0.5 shrink-0"
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            style={{ color: "#8A5A1A" }}
          >
            <path d="M8 2l6.5 11.5h-13L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M8 6.5v3M8 11.4v.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "#8A5A1A" }}>
            <strong className="font-semibold">Ayuno de 8 horas requerido.</strong>{" "}
            Deja de comer 8 horas antes de tu cita. Agua sí está permitida.
          </p>
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
        <div
          className="pointer-events-auto rounded-xl border border-border bg-card p-3.5"
          style={{ boxShadow: "0 10px 30px rgba(17,17,17,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1">
              {date && time ? (
                <>
                  <p className="text-[11px] text-muted-foreground">
                    {format(date, "EEE d MMM", { locale: es })} ·{" "}
                    {slots.find((s) => s.time === time)?.label}
                  </p>
                  <p className="text-[15px] font-semibold tracking-tight text-foreground">
                    {selectedServices.length} estudio
                    {selectedServices.length !== 1 ? "s" : ""} · $
                    {total.toLocaleString("es-MX")}
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-muted-foreground">
                  {!date ? "Elige una fecha" : "Elige un horario"}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleNext}
              disabled={!date || !time}
              className="flex h-10 items-center gap-1.5 rounded-lg px-4 text-[14px] font-medium text-background transition-opacity disabled:opacity-40"
              style={{ background: "#111" }}
            >
              Tus datos
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed footer */}
      <div className="h-32" />
    </div>
  );
}
