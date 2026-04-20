"use client";

import { Copy } from "lucide-react";
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
import { DAY_LABELS_ES, type DayKey } from "@/lib/hours";

const ORDERED_DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const opts: { value: string; label: string }[] = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const period = h < 12 ? "AM" : "PM";
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
      opts.push({ value, label });
    }
  }
  return opts;
})();

export type HoursEditorProps = {
  value: WeeklyHours;
  onChange: (next: WeeklyHours) => void;
};

export function HoursEditor({ value, onChange }: HoursEditorProps) {
  function toggleDay(day: DayKey, open: boolean) {
    onChange({
      ...value,
      [day]: open ? { open: "08:00", close: "19:00" } : null,
    });
  }

  function setRange(day: DayKey, field: "open" | "close", time: string) {
    const current = value[day];
    if (!current) return;
    onChange({ ...value, [day]: { ...current, [field]: time } });
  }

  function copyMondayToAll() {
    const monday = value.monday;
    if (!monday) return;
    const next: WeeklyHours = { ...value };
    for (const d of ORDERED_DAYS) {
      if (value[d]) next[d] = { ...monday };
    }
    onChange(next);
  }

  const hasMonday = !!value.monday;

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-border rounded-lg border border-border bg-background">
        {ORDERED_DAYS.map((day) => {
          const range = value[day];
          const enabled = !!range;
          return (
            <li
              key={day}
              className="flex flex-wrap items-center gap-3 px-3 py-2 sm:flex-nowrap"
            >
              <div className="flex min-w-[6.5rem] items-center gap-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={enabled}
                  onCheckedChange={(v) => toggleDay(day, !!v)}
                />
                <Label
                  htmlFor={`day-${day}`}
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  {DAY_LABELS_ES[day]}
                </Label>
              </div>

              {enabled && range ? (
                <div className="flex flex-1 items-center gap-2">
                  <Select
                    value={range.open}
                    onValueChange={(v) => v && setRange(day, "open", v)}
                  >
                    <SelectTrigger className="h-8 w-[7.5rem]">
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
                    value={range.close}
                    onValueChange={(v) => v && setRange(day, "close", v)}
                  >
                    <SelectTrigger className="h-8 w-[7.5rem]">
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
              ) : (
                <span className="flex-1 text-xs text-muted-foreground">
                  Cerrado
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={copyMondayToAll}
          disabled={!hasMonday}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <Copy className="h-3 w-3" />
          Copiar Lunes a toda la semana
        </Button>
      </div>
    </div>
  );
}

export function defaultWeeklyHours(): WeeklyHours {
  return {
    monday: { open: "08:00", close: "19:00" },
    tuesday: { open: "08:00", close: "19:00" },
    wednesday: { open: "08:00", close: "19:00" },
    thursday: { open: "08:00", close: "19:00" },
    friday: { open: "08:00", close: "19:00" },
    saturday: null,
    sunday: null,
  };
}

export function hasAnyOpenDay(hours: WeeklyHours): boolean {
  return (Object.values(hours) as Array<unknown>).some((v) => v !== null);
}
