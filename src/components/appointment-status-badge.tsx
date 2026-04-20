export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "no_show"
  | "cancelled";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; dot: string; text: string }
> = {
  pending: {
    label: "Pendiente",
    dot: "#C7A03A",
    text: "#6B4E1A",
  },
  confirmed: {
    label: "Confirmada",
    dot: "#2C5A8F",
    text: "#2C5A8F",
  },
  completed: {
    label: "Atendido",
    dot: "#0B6E4F",
    text: "#0B6E4F",
  },
  no_show: {
    label: "No asistió",
    dot: "#A43D3D",
    text: "#A43D3D",
  },
  cancelled: {
    label: "Cancelado",
    dot: "#C7C4BC",
    text: "#8B8A83",
  },
};

export function AppointmentStatusBadge({ status }: { status: string }) {
  const config =
    STATUS_CONFIG[status as AppointmentStatus] ?? STATUS_CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[12px] font-medium"
      style={{ color: config.text }}
    >
      <span
        className="h-[7px] w-[7px] rounded-full"
        style={{ background: config.dot }}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
