"use client";

import { useState } from "react";

type ServiceItem = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  requiresFasting: boolean;
};

const INITIAL_VISIBLE = 8;

export function ServicesList({ services }: { services: ServiceItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? services : services.slice(0, INITIAL_VISIBLE);
  const hasMore = services.length > INITIAL_VISIBLE;

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {visible.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              i !== visible.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-medium text-foreground truncate">
                  {s.name}
                </span>
                {s.requiresFasting && (
                  <span
                    className="shrink-0 rounded-full border px-1.5 py-px text-[10px] font-medium"
                    style={{
                      background: "#F5EBD9",
                      color: "#8A5A1A",
                      borderColor: "rgba(138,90,26,0.18)",
                    }}
                  >
                    Ayuno 8h
                  </span>
                )}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 4.8V8l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {s.durationMinutes} min
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-mono text-[14px] font-semibold tabular-nums text-foreground">
                ${Number(s.price).toLocaleString("es-MX")}
              </span>
              <span className="ml-1 text-[10px] text-muted-foreground">MXN</span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded
            ? "Ver menos"
            : `Ver los ${services.length} estudios →`}
        </button>
      )}
    </div>
  );
}
