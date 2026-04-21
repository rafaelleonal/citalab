"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CreditCard, FlaskConical, Settings } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Operaciones",
    items: [
      { href: "/dashboard", label: "Citas", icon: Calendar, exact: true },
    ],
  },
  {
    label: "Configurar",
    items: [
      {
        href: "/dashboard/estudios",
        label: "Estudios",
        icon: FlaskConical,
        exact: false,
      },
      {
        href: "/dashboard/configuracion",
        label: "Configuración",
        icon: Settings,
        exact: false,
      },
      {
        href: "/dashboard/facturacion",
        label: "Facturación",
        icon: CreditCard,
        exact: false,
      },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {NAV_GROUPS.map((group) => (
        <SidebarGroup key={group.label} className="py-1">
          <SidebarGroupLabel className="font-mono text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
