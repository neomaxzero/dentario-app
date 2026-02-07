"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { UserClinic } from "@/lib/clinics";
import { AppSidebar } from "@/components/app-sidebar";
import { PatientTypeaheadSearch } from "@/components/patients/patient-typeahead-search";
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
  const clinicSlug = clinic.slug ?? "";
  const encodedClinicSlug = encodeURIComponent(clinicSlug);
  const patientsPath = `/app/${encodedClinicSlug}/pacientes`;
  const patientDetailPrefix = `${patientsPath}/`;
  const isEditPatientPage =
    pathname.startsWith(patientDetailPrefix) && pathname.endsWith("/editar");
  const isPatientsPage = pathname === patientsPath;
  const isNewPatientPage = pathname === `${patientsPath}/nuevo`;
  const isPatientDetailPage =
    pathname.startsWith(patientDetailPrefix) && !isNewPatientPage && !isEditPatientPage;

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
        <header className="flex shrink-0 flex-col gap-2 bg-background/95 py-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-auto md:h-16 md:flex-row md:items-center md:gap-2 md:py-0 group-has-data-[collapsible=icon]/sidebar-wrapper:md:h-12">
          <div className="flex w-full min-w-0 items-center gap-2 px-4 md:w-auto">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb className="min-w-0">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/app/${encodedClinicSlug}`}>Dentario</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {isPatientsPage || isNewPatientPage || isPatientDetailPage || isEditPatientPage ? (
                    <BreadcrumbLink href={patientsPath}>Pacientes</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{clinic.nombre ?? "Panel de clínica"}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {isNewPatientPage ? (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Nuevo paciente</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : null}
                {isPatientDetailPage ? (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Detalle del paciente</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : null}
                {isEditPatientPage ? (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Editar paciente</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : null}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="w-full px-4 md:hidden">
            <PatientTypeaheadSearch clinicSlug={clinicSlug} />
          </div>
          <div className="hidden w-full max-w-sm px-4 md:ml-auto md:block">
            <PatientTypeaheadSearch clinicSlug={clinicSlug} />
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
