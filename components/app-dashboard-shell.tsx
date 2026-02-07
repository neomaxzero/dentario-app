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
  children,
}: {
  clinic: UserClinic;
  clinics: UserClinic[];
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isAdmin: boolean;
  children: React.ReactNode;
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
          {children}
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
