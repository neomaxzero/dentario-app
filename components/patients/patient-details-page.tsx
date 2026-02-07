"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePatient } from "@/lib/hooks/use-patients";
import type { Patient } from "@/lib/patients";

function getInitials(name: string, lastName: string) {
  const fullName = `${name} ${lastName}`.trim();

  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "P"
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sin dato";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatAge(value: string) {
  const birthDate = new Date(`${value}T00:00:00`);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
    return "Sin dato";
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return "Sin dato";
  }

  const yearsLabel = years === 1 ? "año" : "años";
  // Solo mostrar los meses si NO es 0
  if (months === 0) {
    return `${years} ${yearsLabel}`;
  } else {
    const monthsLabel = months === 1 ? "mes" : "meses";
    return `${years} ${yearsLabel}, ${months} ${monthsLabel}`;
  }
}

function showValue(value: string | null, fallback = "Sin dato") {
  const normalized = (value ?? "").trim();
  return normalized ? normalized : fallback;
}

function formatSpecialty(value: Patient["especialidad"]) {
  const values = value ?? [];

  if (values.length === 0) {
    return "Sin especialidad";
  }

  return values
    .map((specialty) => {
      if (specialty === "ortopedia") {
        return "Ortopedia";
      }

      if (specialty === "ortodoncia") {
        return "Ortodoncia";
      }

      return "Sin especialidad";
    })
    .join(", ");
}

function buildBasicData(patient: Patient) {
  return [
    { label: "DNI", value: showValue(patient.dni) },
    {
      label: "Fecha de nacimiento",
      value: formatDate(patient.fecha_nacimiento),
    },
    {
      label: "Teléfono principal",
      value: showValue(patient.telefono_principal),
    },
    { label: "Obra social", value: showValue(patient.obra_social) },
  ];
}

function buildAdditionalData(patient: Patient) {
  return [
    { label: "Sexo", value: showValue(patient.sexo) },
    { label: "Correo electrónico", value: showValue(patient.email) },
    {
      label: "Teléfono alternativo",
      value: showValue(patient.telefono_alternativo),
    },
    {
      label: "Plan de obra social",
      value: showValue(patient.plan_obra_social),
    },
    { label: "Número de afiliado", value: showValue(patient.numero_interno) },
    { label: "Ciudad", value: showValue(patient.ciudad) },
    { label: "Dirección", value: showValue(patient.direccion) },
  ];
}

export function PatientDetailsPage({
  clinicSlug,
  patientId,
}: {
  clinicSlug: string;
  patientId: string;
}) {
  const parsedPatientId = /^\d+$/.test(patientId)
    ? Number.parseInt(patientId, 10)
    : Number.NaN;
  const isValidPatientId =
    Number.isInteger(parsedPatientId) && parsedPatientId > 0;
  const {
    data: patient,
    isPending,
    error,
  } = usePatient(clinicSlug, isValidPatientId ? parsedPatientId : null);
  const patientsPath = `/app/${encodeURIComponent(clinicSlug)}/pacientes`;
  const editPath = `${patientsPath}/${patientId}/editar`;

  if (!isValidPatientId) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h1 className="text-xl font-semibold">Detalle del paciente</h1>
        <p className="mt-2 text-sm text-destructive">
          El ID del paciente no es válido.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={patientsPath}>Volver a pacientes</Link>
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 animate-pulse rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-7 w-56 animate-pulse rounded bg-muted" />
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`field-loading-${index}`} className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h1 className="text-xl font-semibold">Detalle del paciente</h1>
        <p className="mt-2 text-sm text-destructive">{error.message}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={patientsPath}>Volver a pacientes</Link>
        </Button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <h1 className="text-xl font-semibold">Detalle del paciente</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No se encontró el paciente.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={patientsPath}>Volver a pacientes</Link>
        </Button>
      </div>
    );
  }

  const fullName = `${patient.nombre} ${patient.apellido}`.trim();
  const basicData = buildBasicData(patient);
  const additionalData = buildAdditionalData(patient);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border/60 bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-24 w-24 rounded-xl">
            {patient.foto_perfil_url ? (
              <AvatarImage
                src={patient.foto_perfil_url}
                alt={fullName || "Foto de perfil del paciente"}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="rounded-xl bg-sidebar-accent text-lg font-semibold">
              {getInitials(patient.nombre, patient.apellido)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">
              {fullName || "Paciente sin nombre"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Edad: {formatAge(patient.fecha_nacimiento)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Especialidad:
              </span>
              <Badge variant={patient.especialidad ? "secondary" : "outline"}>
                {formatSpecialty(patient.especialidad)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={editPath}>Editar paciente</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={patientsPath}>Volver a pacientes</Link>
          </Button>
        </div>
      </div>

      <Collapsible>
        <Card className="border-border/60 shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Resumen del paciente</CardTitle>
            <CollapsibleTrigger className="group rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <span className="sr-only">Mostrar más datos</span>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {basicData.map((field) => (
                <div key={field.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm font-medium">{field.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CollapsibleContent className="border-t border-border/60 px-6 pb-6 pt-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {additionalData.map((field) => (
                <div key={field.label}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm font-medium">{field.value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Observaciones
                </p>
                <p className="mt-1 text-sm font-medium">
                  {showValue(patient.observaciones, "Sin observaciones")}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
