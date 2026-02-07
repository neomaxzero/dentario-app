"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/lib/hooks/use-patients";

function getInitials(name: string, lastName: string) {
  const fullName = `${name} ${lastName}`.trim();

  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function PatientsListPage({ clinicSlug }: { clinicSlug: string }) {
  const { data: patients, isPending, error } = usePatients(clinicSlug);

  if (isPending) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <p className="text-sm text-muted-foreground">Cargando pacientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <p className="text-sm text-destructive">{error.message}</p>
      </div>
    );
  }

  if (!patients?.length) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center rounded-xl border border-dashed border-border/70 bg-card p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Agrega tu primer paciente</h1>
          <div className="mt-4">
            <Button asChild>
              <Link href={`/app/${encodeURIComponent(clinicSlug)}/pacientes/nuevo`}>
                Agregar paciente
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <Button asChild>
          <Link href={`/app/${encodeURIComponent(clinicSlug)}/pacientes/nuevo`}>
            Agregar paciente
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-2 font-medium">Foto</th>
              <th className="pb-2 pr-2 font-medium">Nombre</th>
              <th className="pb-2 pr-2 font-medium">DNI</th>
              <th className="pb-2 pr-2 font-medium">Obra social</th>
              <th className="pb-2 pr-2 font-medium">Telefono principal</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b border-border/60">
                <td className="py-2 pr-2">
                  <Avatar className="h-9 w-9 rounded-lg">
                    {patient.foto_perfil_url ? (
                      <AvatarImage
                        src={patient.foto_perfil_url}
                        alt={`${patient.nombre} ${patient.apellido}`}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-sidebar-accent text-[11px] font-semibold">
                      {getInitials(patient.nombre, patient.apellido)}
                    </AvatarFallback>
                  </Avatar>
                </td>
                <td className="py-2 pr-2">{patient.nombre} {patient.apellido}</td>
                <td className="py-2 pr-2">{patient.dni}</td>
                <td className="py-2 pr-2">{patient.obra_social}</td>
                <td className="py-2 pr-2">{patient.telefono_principal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
