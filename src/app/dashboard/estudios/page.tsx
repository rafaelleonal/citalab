import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { packageItems, services } from "@/db/schema";
import { requireLab } from "@/lib/auth-helpers";
import { Catalog } from "./_components/catalog";

export default async function EstudiosPage() {
  const lab = await requireLab();

  const allRows = await db
    .select({
      id: services.id,
      name: services.name,
      code: services.code,
      category: services.category,
      description: services.description,
      price: services.price,
      durationMinutes: services.durationMinutes,
      requiresFasting: services.requiresFasting,
      fastingHours: services.fastingHours,
      instructions: services.instructions,
      active: services.active,
      isPackage: services.isPackage,
    })
    .from(services)
    .where(eq(services.labId, lab.id))
    .orderBy(asc(services.name));

  const packageIds = allRows.filter((r) => r.isPackage).map((r) => r.id);
  const itemLinks = packageIds.length
    ? await db
        .select({
          packageId: packageItems.packageId,
          serviceId: packageItems.serviceId,
          serviceName: services.name,
          serviceCode: services.code,
          servicePrice: services.price,
        })
        .from(packageItems)
        .innerJoin(services, eq(services.id, packageItems.serviceId))
        .where(inArray(packageItems.packageId, packageIds))
    : [];

  const itemsByPkg = new Map<
    string,
    { id: string; name: string; code: string | null; price: string }[]
  >();
  for (const link of itemLinks) {
    const list = itemsByPkg.get(link.packageId) ?? [];
    list.push({
      id: link.serviceId,
      name: link.serviceName,
      code: link.serviceCode,
      price: link.servicePrice,
    });
    itemsByPkg.set(link.packageId, list);
  }

  const rows = allRows.map((r) => ({
    ...r,
    items: r.isPackage ? itemsByPkg.get(r.id) ?? [] : [],
  }));

  return <Catalog rows={rows} labSlug={lab.slug} />;
}
