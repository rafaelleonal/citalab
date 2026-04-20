"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WeeklyHours } from "@/db/schema";

type DayRange = { open: string; close: string };

type StepHoursProps = {
  defaults?: WeeklyHours;
  onNext: (data: { hours: WeeklyHours }) => void;
  onBack: () => void;
};

const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const opts: { value: string; label: string }[] = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}`;
      const period = h < 12 ? "AM" : "PM";
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
      opts.push({ value, label });
    }
  }
  return opts;
})();

function TimeRangePicker({
  value,
  onChange,
  ariaLabel,
}: {
  value: DayRange;
  onChange: (v: DayRange) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label={ariaLabel}
    >
      <Select
        value={value.open}
        onValueChange={(v) => v && onChange({ ...value, open: v })}
      >
        <SelectTrigger className="w-32" aria-label={`${ariaLabel}: apertura`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs text-muted-foreground">a</span>
      <Select
        value={value.close}
        onValueChange={(v) => v && onChange({ ...value, close: v })}
      >
        <SelectTrigger className="w-32" aria-label={`${ariaLabel}: cierre`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function fromWeekdays(defaults?: WeeklyHours): DayRange {
  const src =
    defaults?.monday ??
    defaults?.tuesday ??
    defaults?.wednesday ??
    defaults?.thursday ??
    defaults?.friday ??
    null;
  return src ?? { open: "08:00", close: "19:00" };
}

export function StepHours({ defaults, onNext, onBack }: StepHoursProps) {
  const [weekdays, setWeekdays] = useState<DayRange>(fromWeekdays(defaults));
  const [satEnabled, setSatEnabled] = useState(!!defaults?.saturday);
  const [sat, setSat] = useState<DayRange>(
    defaults?.saturday ?? { open: "08:00", close: "14:00" }
  );
  const [sunEnabled, setSunEnabled] = useState(!!defaults?.sunday);
  const [sun, setSun] = useState<DayRange>(
    defaults?.sunday ?? { open: "09:00", close: "13:00" }
  );
  const [error, setError] = useState("");

  function isInvalid(r: DayRange) {
    return r.open >= r.close;
  }

  function handleNext() {
    if (isInvalid(weekdays)) {
      setError("La hora de apertura debe ser antes del cierre.");
      return;
    }
    if (satEnabled && isInvalid(sat)) {
      setError("El horario de sábado es inválido.");
      return;
    }
    if (sunEnabled && isInvalid(sun)) {
      setError("El horario de domingo es inválido.");
      return;
    }
    setError("");
    const hours: WeeklyHours = {
      monday: { ...weekdays },
      tuesday: { ...weekdays },
      wednesday: { ...weekdays },
      thursday: { ...weekdays },
      friday: { ...weekdays },
      saturday: satEnabled ? { ...sat } : null,
      sunday: sunEnabled ? { ...sun } : null,
    };
    onNext({ hours });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 md:p-7">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Lunes a viernes
          </p>
          <TimeRangePicker
            value={weekdays}
            onChange={setWeekdays}
            ariaLabel="Horario lunes a viernes"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sat"
              checked={satEnabled}
              onCheckedChange={(v) => setSatEnabled(!!v)}
            />
            <Label htmlFor="sat" className="cursor-pointer">
              También sábados
            </Label>
          </div>
          {satEnabled && (
            <div className="pl-6">
              <TimeRangePicker
                value={sat}
                onChange={setSat}
                ariaLabel="Horario de sábado"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sun"
              checked={sunEnabled}
              onCheckedChange={(v) => setSunEnabled(!!v)}
            />
            <Label htmlFor="sun" className="cursor-pointer">
              También domingos
            </Label>
          </div>
          {sunEnabled && (
            <div className="pl-6">
              <TimeRangePicker
                value={sun}
                onChange={setSun}
                ariaLabel="Horario de domingo"
              />
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button onClick={handleNext}>Siguiente</Button>
        </div>
      </div>
    </section>
  );
}
