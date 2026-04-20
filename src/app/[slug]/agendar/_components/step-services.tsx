"use client";

import { useMemo, useState } from "react";

export type ServiceItem = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  requiresFasting: boolean;
  instructions: string | null;
};

type Filter = "all" | "fasting" | "nofasting";

type StepServicesProps = {
  services: ServiceItem[];
  selectedIds: Set<string>;
  onChangeSelected: (ids: Set<string>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepServices({
  services,
  selectedIds,
  onChangeSelected,
  onNext,
  onBack,
}: StepServicesProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = services;
    if (filter === "fasting") list = list.filter((s) => s.requiresFasting);
    if (filter === "nofasting") list = list.filter((s) => !s.requiresFasting);
    if (!query.trim()) return list;
    const q = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return list.filter((s) =>
      s.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(q)
    );
  }, [services, query, filter]);

  const total = useMemo(
    () =>
      services
        .filter((s) => selectedIds.has(s.id))
        .reduce((sum, s) => sum + Number(s.price), 0),
    [services, selectedIds]
  );

  const totalDuration = useMemo(
    () =>
      services
        .filter((s) => selectedIds.has(s.id))
        .reduce((sum, s) => sum + s.durationMinutes, 0),
    [services, selectedIds]
  );

  function toggle(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChangeSelected(next);
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "nofasting", label: "Sin ayuno" },
    { key: "fasting", label: "Con ayuno" },
  ];

  return (
    <div>
      {/* Search + filters */}
      <div className="pb-3">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3">
          <svg
            className="shrink-0 text-muted-foreground"
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Buscar estudio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar estudio"
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="rounded-full border px-3 py-1 text-[12px] transition-colors"
              style={{
                background: filter === key ? "#111" : "transparent",
                color: filter === key ? "#fff" : "#52514C",
                borderColor: filter === key ? "#111" : "rgba(17,17,17,0.12)",
                fontWeight: filter === key ? 500 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="pb-44">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-12 text-center text-sm text-muted-foreground">
            {query
              ? `Sin resultados para "${query}".`
              : "No hay estudios en esta categoría."}
          </p>
        ) : (
          <>
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "estudio" : "estudios"}
            </p>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {filtered.map((s, i) => {
                const checked = selectedIds.has(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors"
                    style={{
                      borderTop: i > 0 ? "0.5px solid rgba(17,17,17,0.08)" : "none",
                      background: checked ? "rgba(17,17,17,0.025)" : "transparent",
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      className="mt-0.5 flex shrink-0 items-center justify-center rounded-[4px]"
                      style={{
                        width: 18,
                        height: 18,
                        border: `1.2px solid ${checked ? "#111" : "rgba(17,17,17,0.25)"}`,
                        background: checked ? "#111" : "#fff",
                      }}
                    >
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3.5 8.5l3 3 6-6.5"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggle(s.id)}
                      aria-label={s.name}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-foreground">{s.name}</p>
                      <div className="mt-1 flex items-center gap-2.5 text-[11.5px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M8 4.8V8l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                          </svg>
                          {s.durationMinutes} min
                        </span>
                        {s.requiresFasting && (
                          <span className="flex items-center gap-1" style={{ color: "#8A5A1A" }}>
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                              <path d="M8 2l6.5 11.5h-13L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                              <path d="M8 6.5v3M8 11.4v.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                            Requiere ayuno
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
                        ${Number(s.price).toLocaleString("es-MX")}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </>
        )}
      </div>

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
              {selectedIds.size === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  Selecciona al menos un estudio
                </p>
              ) : (
                <>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedIds.size} estudio{selectedIds.size !== 1 ? "s" : ""} ·{" "}
                    {totalDuration} min aprox.
                  </p>
                  <p className="font-mono text-[19px] font-semibold tabular-nums text-foreground">
                    ${total.toLocaleString("es-MX")}{" "}
                    <span className="text-[11px] font-normal text-muted-foreground">MXN</span>
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onNext}
              disabled={selectedIds.size === 0}
              className="flex h-10 items-center gap-1.5 rounded-lg px-4 text-[14px] font-medium text-background transition-opacity disabled:opacity-40"
              style={{ background: "#111" }}
            >
              Fecha y hora
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
    </div>
  );
}
