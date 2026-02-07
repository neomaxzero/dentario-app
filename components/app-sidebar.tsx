"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  HeartPulse,
  Settings2,
  Stethoscope,
  Users,
} from "lucide-react";

import type { UserClinic } from "@/lib/clinics";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const clinicIcons = [Building2, Stethoscope, HeartPulse, Activity];

export function AppSidebar({
  clinics,
  activeClinic,
  user,
  isAdmin,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  clinics: UserClinic[];
  activeClinic: UserClinic;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const teams = React.useMemo(
    () =>
      clinics.map((clinic, index) => ({
        id: clinic.id,
        name: clinic.nombre ?? `Clinic ${clinic.id}`,
        logo: clinicIcons[index % clinicIcons.length],
        logoUrl: clinic.logo,
        plan: "Dentario",
        url: clinic.slug ? `/app/${clinic.slug}/pacientes` : "#",
      })),
    [clinics],
  );

  const navMain = React.useMemo(() => {
    const patientsUrl = activeClinic.slug
      ? `/app/${encodeURIComponent(activeClinic.slug)}/pacientes`
      : "#";

    return [
      {
        title: "Administrar",
        url: patientsUrl,
        icon: Users,
        isActive: pathname.startsWith(patientsUrl),
        items: [{ title: "Pacientes", url: patientsUrl }],
      },
      {
        title: "Configuracion",
        url: "#",
        icon: Settings2,
        items: [
          { title: "Clinica", url: "#" },
          { title: "Equipo", url: "#" },
        ],
      },
    ];
  }, [activeClinic.slug, pathname]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={teams}
          activeTeamId={activeClinic.id}
          canAddClinic={isAdmin}
          addClinicUrl={
            activeClinic.slug
              ? `/app/${activeClinic.slug}/pacientes?createClinic=1`
              : "#"
          }
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
