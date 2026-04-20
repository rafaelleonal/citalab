import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "neutral" | "info" | "success" | "danger";
};

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <p className="text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
