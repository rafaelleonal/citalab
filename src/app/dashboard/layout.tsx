import { UserButton } from "@clerk/nextjs";
import { Bell, ExternalLink, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { requireLab } from "@/lib/auth-helpers";
import { SidebarNav } from "./_components/sidebar-nav";
import { DashboardBreadcrumb } from "./_components/dashboard-breadcrumb";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lab = await requireLab();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-3 pb-2.5">
          <Logo size={17} />
          <button
            type="button"
            className="mt-2 flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors hover:bg-muted"
          >
            <div
              className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md text-[12px] font-semibold tracking-tight text-background"
              style={{ background: "#111" }}
              aria-hidden="true"
            >
              {lab.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                {lab.name}
              </p>
              <p className="truncate font-mono text-[10.5px] leading-tight text-muted-foreground">
                cita/lab.mx/{lab.slug}
              </p>
            </div>
          </button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav />
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <UserButton appearance={{ elements: { avatarBox: "h-6 w-6" } }} />
            <span className="text-xs text-muted-foreground">Cuenta</span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-5 backdrop-blur md:px-6">
          <SidebarTrigger className="md:hidden" />
          <DashboardBreadcrumb />
          <div className="ml-4 hidden h-8 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px] text-muted-foreground md:flex md:max-w-[320px]">
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="flex-1 truncate">Buscar paciente, código…</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-px font-mono text-[10.5px]">
              ⌘K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={`/${lab.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 font-mono text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              <span className="text-muted-foreground/70">citalab.mx/</span>
              <span className="text-foreground">{lab.slug}</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
            <button
              type="button"
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notificaciones"
            >
              <Bell className="h-3.5 w-3.5" />
              <span
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                style={{ background: "#A43D3D" }}
                aria-hidden
              />
            </button>
          </div>
        </header>

        <main className="flex-1 bg-background p-5 md:p-8">{children}</main>
      </SidebarInset>

      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
