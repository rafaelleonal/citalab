import { requireLab } from "@/lib/auth-helpers";
import { defaultWeeklyHours } from "@/components/hours-editor";
import { ConfigForm } from "./_components/config-form";

export default async function ConfiguracionPage() {
  const lab = await requireLab();

  return (
    <ConfigForm
      lab={{
        id: lab.id,
        name: lab.name,
        slug: lab.slug,
        address: lab.address ?? "",
        phone: lab.phone ?? "",
        hours: lab.hours ?? defaultWeeklyHours(),
        slotMinutes: lab.slotMinutes,
        minLeadHours: lab.minLeadHours,
      }}
    />
  );
}
