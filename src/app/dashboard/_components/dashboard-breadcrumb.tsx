"use client";

import { usePathname } from "next/navigation";

const CRUMBS: { match: (p: string) => boolean; group: string; leaf: string }[] =
  [
    {
      match: (p) => p === "/dashboard",
      group: "Operaciones",
      leaf: "Citas",
    },
    {
      match: (p) => p.startsWith("/dashboard/estudios"),
      group: "Configurar",
      leaf: "Estudios",
    },
    {
      match: (p) => p.startsWith("/dashboard/configuracion"),
      group: "Configurar",
      leaf: "Ajustes generales",
    },
  ];

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const crumb = CRUMBS.find((c) => c.match(pathname)) ?? {
    group: "Operaciones",
    leaf: "Dashboard",
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
    >
      <span>{crumb.group}</span>
      <span className="text-border">/</span>
      <span className="font-medium text-foreground">{crumb.leaf}</span>
    </nav>
  );
}
