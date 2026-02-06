"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
  activeTeamId,
  canAddClinic,
  addClinicUrl,
}: {
  teams: {
    id: number;
    name: string;
    logo: React.ElementType;
    logoUrl?: string | null;
    plan: string;
    url: string;
  }[];
  activeTeamId: number;
  canAddClinic: boolean;
  addClinicUrl: string;
}) {
  const { isMobile } = useSidebar();

  const selectedTeam =
    teams.find((team) => team.id === activeTeamId) ?? teams[0];
  const [activeTeam, setActiveTeam] = React.useState(selectedTeam);

  React.useEffect(() => {
    setActiveTeam(selectedTeam);
  }, [selectedTeam]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="peer/menu-button overflow-hidden p-2 transition-[width,height,padding] group-data-[collapsible=icon]:p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg border">
                {activeTeam.logoUrl ? (
                  <img
                    src={activeTeam.logoUrl}
                    alt={activeTeam.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <activeTeam.logo className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Clinicas
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
                asChild
              >
                <a href={team.url}>
                  <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <team.logo className="size-3.5 shrink-0" />
                    )}
                  </div>
                  <span>{team.name}</span>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </a>
              </DropdownMenuItem>
            ))}
            {canAddClinic ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2" asChild>
                  <a href={addClinicUrl}>
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium ">Agregar clinica</div>
                  </a>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
