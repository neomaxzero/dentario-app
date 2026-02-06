"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { UserClinic } from "@/lib/clinics";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CreateClinicForm } from "@/components/create-clinic-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AppDashboardShell({
  clinic,
  clinics,
  user,
  isAdmin,
}: {
  clinic: UserClinic;
  clinics: UserClinic[];
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCreateClinicOpen = isAdmin && searchParams.get("createClinic") === "1";

  const nextQueryWithoutModal = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("createClinic");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  function onOpenChange(open: boolean) {
    if (open) {
      return;
    }

    router.replace(nextQueryWithoutModal, { scroll: false });
  }

  return (
    <SidebarProvider>
      <AppSidebar clinics={clinics} activeClinic={clinic} user={user} isAdmin={isAdmin} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 bg-background/95 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dentario</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{clinic.nombre ?? "Clinic Dashboard"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 ring-primary/10 rounded-xl border border-border/60 p-4 ring-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Active clinic
              </p>
              <p className="mt-2 text-lg font-semibold">
                {clinic.nombre ?? `Clinic ${clinic.id}`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Role: {clinic.role}
              </p>
            </div>
            <div className="bg-muted/50 ring-primary/10 rounded-xl border border-border/60 p-4 ring-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Clinics available
              </p>
              <p className="mt-2 text-3xl font-semibold">{clinics.length}</p>
            </div>
            <div className="bg-muted/50 ring-primary/10 aspect-video rounded-xl border border-border/60 ring-1" />
          </div>
          <div className="bg-muted/40 ring-primary/10 min-h-[50vh] flex-1 rounded-xl border border-border/60 p-4 ring-1 md:min-h-0">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">
                Selecciona una clínica desde el selector lateral.
              </p>
            </div>
          </div>
        </div>
        {isAdmin ? (
          <Dialog open={isCreateClinicOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear clínica</DialogTitle>
                <DialogDescription>
                  Completa los datos para crear una nueva clínica en Dentario.
                </DialogDescription>
              </DialogHeader>
              <CreateClinicForm className="pt-2" />
            </DialogContent>
          </Dialog>
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
}
