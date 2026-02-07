"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PatientAvatarUploader } from "@/components/patients/patient-avatar-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePatient, useUpdatePatient } from "@/lib/hooks/use-patients";
import type { CreatePatientInput, Patient, PatientSpecialty } from "@/lib/patients";

type EditPatientFormProps = {
  clinicSlug: string;
  patientId: string;
};

const SPECIALTIES: { value: PatientSpecialty; label: string }[] = [
  { value: "ortopedia", label: "Ortopedia" },
  { value: "ortodoncia", label: "Ortodoncia" },
];

function mapPatientToFormValues(patient: Patient | null | undefined) {
  if (!patient) {
    return null;
  }

  return {
    nombre: patient.nombre ?? "",
    apellido: patient.apellido ?? "",
    dni: patient.dni ?? "",
    email: patient.email ?? "",
    obraSocial: patient.obra_social ?? "",
    planObraSocial: patient.plan_obra_social ?? "",
    especialidad: patient.especialidad ?? [],
    numeroInterno: patient.numero_interno ?? "",
    sexo: patient.sexo ?? "",
    fechaNacimiento: patient.fecha_nacimiento ?? "",
    ciudad: patient.ciudad ?? "",
    direccion: patient.direccion ?? "",
    telefonoPrincipal: patient.telefono_principal ?? "",
    telefonoAlternativo: patient.telefono_alternativo ?? "",
    observaciones: patient.observaciones ?? "",
  } satisfies CreatePatientInput;
}

export function EditPatientForm({ clinicSlug, patientId }: EditPatientFormProps) {
  const router = useRouter();
  const parsedPatientId = /^\d+$/.test(patientId)
    ? Number.parseInt(patientId, 10)
    : Number.NaN;
  const isValidPatientId = Number.isInteger(parsedPatientId) && parsedPatientId > 0;
  const detailPath = `/app/${encodeURIComponent(clinicSlug)}/pacientes/${patientId}`;
  const patientsPath = `/app/${encodeURIComponent(clinicSlug)}/pacientes`;
  const { data: patient, isPending: isLoadingPatient, error: loadError } = usePatient(
    clinicSlug,
    isValidPatientId ? parsedPatientId : null,
  );
  const updatePatient = useUpdatePatient(clinicSlug, isValidPatientId ? parsedPatientId : 0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePatientInput>({
    defaultValues: {
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      obraSocial: "",
      planObraSocial: "",
      especialidad: [],
      numeroInterno: "",
      sexo: "",
      fechaNacimiento: "",
      ciudad: "",
      direccion: "",
      telefonoPrincipal: "",
      telefonoAlternativo: "",
      observaciones: "",
    },
  });

  useEffect(() => {
    const values = mapPatientToFormValues(patient);

    if (!values) {
      return;
    }

    reset(values);
    setAvatarUrl(patient?.foto_perfil_url ?? null);
  }, [patient, reset]);
  const selectedSpecialties = watch("especialidad") ?? [];

  function toggleSpecialty(specialty: PatientSpecialty, checked: boolean) {
    const current = watch("especialidad") ?? [];
    const next = checked
      ? [...new Set([...current, specialty])]
      : current.filter((item) => item !== specialty);

    setValue("especialidad", next, { shouldDirty: true, shouldTouch: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await updatePatient.mutateAsync({
        ...values,
        fotoPerfilUrl: avatarUrl,
        sexo: values.sexo || "",
        especialidad: values.especialidad ?? [],
      });

      router.push(detailPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el paciente.";
      setSubmitError(message);
    }
  });

  if (!isValidPatientId) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-border/60 bg-card p-6">
        <h1 className="text-xl font-semibold">Editar paciente</h1>
        <p className="mt-2 text-sm text-destructive">El ID del paciente no es válido.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={patientsPath}>Volver a pacientes</Link>
        </Button>
      </div>
    );
  }

  if (isLoadingPatient) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-border/60 bg-card p-6">
        <h1 className="text-xl font-semibold">Editar paciente</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-border/60 bg-card p-6">
        <h1 className="text-xl font-semibold">Editar paciente</h1>
        <p className="mt-2 text-sm text-destructive">{loadError.message}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={detailPath}>Volver al detalle</Link>
        </Button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-border/60 bg-card p-6">
        <h1 className="text-xl font-semibold">Editar paciente</h1>
        <p className="mt-2 text-sm text-muted-foreground">No se encontró el paciente.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={patientsPath}>Volver a pacientes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Editar paciente</h1>
          <p className="text-sm text-muted-foreground">
            Modificá la información del paciente.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={detailPath}>Cancelar</Link>
        </Button>
      </div>

      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <Label>Foto de perfil</Label>
          <PatientAvatarUploader clinicSlug={clinicSlug} value={avatarUrl} onChange={setAvatarUrl} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre*</Label>
            <Input id="nombre" {...register("nombre", { required: "Este campo es obligatorio." })} />
            {errors.nombre ? <p className="text-sm text-destructive">{errors.nombre.message}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apellido">Apellido*</Label>
            <Input id="apellido" {...register("apellido", { required: "Este campo es obligatorio." })} />
            {errors.apellido ? <p className="text-sm text-destructive">{errors.apellido.message}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dni">DNI</Label>
            <Input id="dni" {...register("dni")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="obra-social">Obra Social</Label>
            <Input id="obra-social" {...register("obraSocial")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan-obra-social">Plan de Obra social</Label>
            <Input id="plan-obra-social" {...register("planObraSocial")} />
          </div>

          <div className="grid gap-2">
            <Label>Especialidades</Label>
            <div className="flex flex-wrap gap-4 rounded-md border border-input px-3 py-2">
              {SPECIALTIES.map((specialty) => {
                const id = `especialidad-${specialty.value}`;

                return (
                  <div key={specialty.value} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={selectedSpecialties.includes(specialty.value)}
                      onCheckedChange={(checked) => toggleSpecialty(specialty.value, checked === true)}
                    />
                    <Label htmlFor={id} className="text-sm font-normal">
                      {specialty.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numero-interno">Numero de Afiliado</Label>
            <Input id="numero-interno" {...register("numeroInterno")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sexo">Sexo</Label>
            <select
              id="sexo"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("sexo")}
            >
              <option value="">Seleccionar</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fecha-nacimiento">Fecha de Nacimiento*</Label>
            <Input
              id="fecha-nacimiento"
              type="date"
              {...register("fechaNacimiento", { required: "Este campo es obligatorio." })}
            />
            {errors.fechaNacimiento ? (
              <p className="text-sm text-destructive">{errors.fechaNacimiento.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input id="ciudad" {...register("ciudad")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input id="direccion" {...register("direccion")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefono-principal">Telefono Principal</Label>
            <Input id="telefono-principal" {...register("telefonoPrincipal")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefono-alternativo">Telefono alternativo</Label>
            <Input id="telefono-alternativo" {...register("telefonoAlternativo")} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea id="observaciones" rows={4} {...register("observaciones")} />
        </div>

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={updatePatient.isPending}>
            {updatePatient.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
