const SIDEBAR_ITEMS = [
  { t: "Citas", active: true },
  { t: "Estudios" },
  { t: "Pacientes" },
  { t: "Horarios" },
  { t: "Configuración" },
];

const STATS = [
  { lbl: "Citas", val: "18", delta: "+3 vs ayer", deltaClass: "text-leaf" },
  { lbl: "Ingresos", val: "$9,840", delta: "+12%", deltaClass: "text-leaf" },
  {
    lbl: "No asistió",
    val: "1",
    delta: "5.5%",
    deltaClass: "text-[#B86464]",
  },
] as const;

const APPOINTMENTS = [
  {
    time: "08:00",
    name: "Rafael Tesét",
    meta: "BH · Química 35",
    status: "Atendido",
    dotClass: "bg-leaf",
    total: "$950",
  },
  {
    time: "08:30",
    name: "Mariana López",
    meta: "Perfil tiroideo",
    status: "Atendido",
    dotClass: "bg-leaf",
    total: "$850",
  },
  {
    time: "09:00",
    name: "Carlos Ramírez",
    meta: "Chequeo anual",
    status: "Pendiente",
    dotClass: "bg-[#C7A03A]",
    total: "$990",
  },
  {
    time: "09:30",
    name: "Sofía Herrera",
    meta: "EGO · BH",
    status: "Pendiente",
    dotClass: "bg-[#C7A03A]",
    total: "$480",
  },
];

const PHONE_STUDIES = [
  { name: "Biometría hemática", price: "$300", checked: true },
  { name: "Química de 35", price: "$650", checked: true },
  { name: "Perfil tiroideo", price: "$850", checked: false },
];

const BROWSER_DOTS = ["bg-[#E06B5D]", "bg-[#E5B740]", "bg-[#6BAE5D]"];

export function HeroMock() {
  return (
    <div className="relative">
      {/* Dashboard mockup */}
      <div
        className="relative overflow-hidden rounded-[14px] border-[0.5px] border-line bg-white"
        style={{
          boxShadow:
            "0 1px 2px rgba(17,17,17,0.04), 0 30px 80px rgba(17,17,17,0.1), 0 10px 30px rgba(17,17,17,0.05)",
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b-[0.5px] border-line bg-surface-alt px-3.5 py-2.5">
          {BROWSER_DOTS.map((c) => (
            <span key={c} className={`h-[9px] w-[9px] rounded-full ${c}`} />
          ))}
          <div className="ml-auto rounded-[5px] border-[0.5px] border-line bg-white px-2.5 py-[3px] font-mono text-[10.5px] text-ink-mute">
            citalab.mx/dashboard
          </div>
        </div>

        {/* Body */}
        <div className="grid min-h-[420px] grid-cols-[180px_1fr]">
          <div className="border-r-[0.5px] border-line bg-[#FCFAF5] px-2.5 py-4">
            {SIDEBAR_ITEMS.map((it) => (
              <div
                key={it.t}
                className={`mb-0.5 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] ${
                  it.active ? "bg-ink text-white" : "bg-transparent text-ink-sub"
                }`}
              >
                <span
                  className={`h-3 w-3 rounded-[3px] ${
                    it.active ? "bg-white/35" : "bg-ink-faint"
                  }`}
                />
                {it.t}
              </div>
            ))}
          </div>

          <div className="px-5 py-4">
            <div className="mb-3.5 flex items-end justify-between">
              <div>
                <h4 className="m-0 text-[18px] font-semibold tracking-[-0.3px]">
                  Hoy, miércoles 22
                </h4>
                <div className="mt-0.5 text-[12px] text-ink-mute">
                  18 citas agendadas
                </div>
              </div>
              <div className="inline-flex h-8 items-center rounded-[7px] border-[0.5px] border-line-strong bg-white px-3 text-[13px] font-medium text-ink">
                + Nueva
              </div>
            </div>

            <div className="mb-3.5 grid grid-cols-3 gap-2.5">
              {STATS.map((k) => (
                <div
                  key={k.lbl}
                  className="rounded-[10px] border-[0.5px] border-line bg-white px-3 py-2.5"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.6px] text-ink-mute">
                    {k.lbl}
                  </div>
                  <div className="mt-0.5 text-[22px] font-semibold tracking-[-0.5px] tabular-nums">
                    {k.val}
                  </div>
                  <div className={`mt-0.5 text-[11px] ${k.deltaClass}`}>
                    {k.delta}
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[10px] border-[0.5px] border-line bg-white">
              <div className="grid grid-cols-[70px_1fr_90px_70px] items-center bg-[#FCFAF5] px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.6px] text-ink-mute">
                <div>Hora</div>
                <div>Paciente</div>
                <div>Estado</div>
                <div>Total</div>
              </div>
              {APPOINTMENTS.map((r) => (
                <div
                  key={r.time}
                  className="grid grid-cols-[70px_1fr_90px_70px] items-center border-t-[0.5px] border-line px-3 py-2.5 text-[13px]"
                >
                  <div className="font-mono text-[12px] tabular-nums">
                    {r.time}
                  </div>
                  <div className="font-medium">
                    {r.name}
                    <div className="mt-px text-[11px] font-normal text-ink-mute">
                      {r.meta}
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-sub">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${r.dotClass}`}
                      />
                      {r.status}
                    </span>
                  </div>
                  <div className="font-mono text-[12px]">{r.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating phone */}
      <div
        className="absolute -bottom-9 -right-8 hidden h-[396px] w-[200px] rounded-[28px] bg-[#111] p-1.5 md:block"
        style={{
          boxShadow: "0 30px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.2)",
          transform: "rotate(6deg)",
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-bg-warm px-3 py-3.5">
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.6px] text-ink-mute">
            Paso 1 de 3 · Estudios
          </div>
          <div className="mb-2.5 text-[17px] font-semibold leading-[1.1] tracking-[-0.4px]">
            ¿Qué estudios vas a realizarte?
          </div>
          {PHONE_STUDIES.map((it) => (
            <div
              key={it.name}
              className="mb-1.5 flex items-center justify-between rounded-[9px] border-[0.5px] border-line bg-white px-2.5 py-2 text-[11px]"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex h-3 w-3 items-center justify-center rounded-[3px] border border-ink ${
                    it.checked ? "bg-ink" : "bg-white"
                  }`}
                >
                  {it.checked && (
                    <svg width="8" height="8" viewBox="0 0 8 8">
                      <path
                        d="M1.5 4l1.5 1.5L6.5 2"
                        stroke="#fff"
                        strokeWidth="1.3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {it.name}
              </div>
              <span
                className={`font-mono ${
                  it.checked ? "text-ink" : "text-ink-mute"
                }`}
              >
                {it.price}
              </span>
            </div>
          ))}
          <div className="absolute bottom-3.5 left-3 right-3 rounded-lg bg-ink py-2 text-center text-[11px] font-medium text-white">
            Fecha y hora →
          </div>
        </div>
      </div>
    </div>
  );
}
