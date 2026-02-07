"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { PatientAvatarUploader } from "@/components/patients/patient-avatar-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePatient, useSocialInsurances } from "@/lib/hooks/use-patients";
import type { CreatePatientInput, PatientSpecialty } from "@/lib/patients";

const SPECIALTIES: { value: PatientSpecialty; label: string }[] = [
  { value: "ortopedia", label: "Ortopedia" },
  { value: "ortodoncia", label: "Ortodoncia" },
];

export function CreatePatientForm({ clinicSlug }: { clinicSlug: string }) {
  const router = useRouter();
  const createPatient = useCreatePatient(clinicSlug);
  const { data: socialInsurances = [], isPending: isLoadingSocialInsurances } = useSocialInsurances(clinicSlug);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreatePatientInput>({
    defaultValues: {
      sexo: "",
      obraSocialIds: [],
      especialidad: [],
      fechaNacimiento: "",
    },
  });
  const selectedSpecialties = watch("especialidad") ?? [];
  const socialInsuranceOptions = useMemo(
    () =>
      socialInsurances.map((insurance) => ({
        value: String(insurance.id),
        label: insurance.nombre,
      })),
    [socialInsurances],
  );

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
      const { patient } = await createPatient.mutateAsync({
        ...values,
        fotoPerfilUrl: avatarUrl,
        sexo: values.sexo || "",
        obraSocialIds: values.obraSocialIds ?? [],
        especialidad: values.especialidad ?? [],
      });

      router.push(`/app/${encodeURIComponent(clinicSlug)}/pacientes/${patient.id}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el paciente.";
      setSubmitError(message);
    }
  });

  return (
    <div className="mx-auto w-full max-w-4xl rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Nuevo paciente</h1>
          <p className="text-sm text-muted-foreground">
            Completá la información para crear la ficha del paciente.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/app/${encodeURIComponent(clinicSlug)}/pacientes`}>Cancelar</Link>
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
            <Label htmlFor="dni">DNI</Label>
            <Input id="dni" {...register("dni")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label>Obras sociales</Label>
            <Controller
              control={control}
              name="obraSocialIds"
              render={({ field }) => (
                <MultiSelect
                  options={socialInsuranceOptions}
                  value={(field.value ?? []).map((id) => String(id))}
                  onValueChange={(selectedValues) => {
                    const next = selectedValues
                      .map((value) => Number.parseInt(value, 10))
                      .filter((id): id is number => Number.isInteger(id) && id > 0);
                    field.onChange(next);
                  }}
                  placeholder={
                    isLoadingSocialInsurances
                      ? "Cargando obras sociales..."
                      : "Seleccioná una o más obras sociales"
                  }
                  searchPlaceholder="Buscar obra social..."
                  emptyIndicator="No se encontraron obras sociales."
                />
              )}
            />
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
          <Button type="submit" disabled={createPatient.isPending}>
            {createPatient.isPending ? "Guardando..." : "Agregar paciente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
