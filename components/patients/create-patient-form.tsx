"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { PatientAvatarUploader } from "@/components/patients/patient-avatar-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePatient } from "@/lib/hooks/use-patients";
import type { CreatePatientInput } from "@/lib/patients";

export function CreatePatientForm({ clinicSlug }: { clinicSlug: string }) {
  const router = useRouter();
  const createPatient = useCreatePatient(clinicSlug);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePatientInput>({
    defaultValues: {
      sexo: "",
      especialidad: "",
      fechaNacimiento: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await createPatient.mutateAsync({
        ...values,
        fotoPerfilUrl: avatarUrl,
        sexo: values.sexo || "",
      });

      router.push(`/app/${encodeURIComponent(clinicSlug)}/pacientes`);
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
            <Label htmlFor="especialidad">Especialidades</Label>
            <select
              id="especialidad"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("especialidad")}
            >
              <option value="">Seleccionar</option>
              <option value="ortopedia">Ortopedia</option>
              <option value="ortodoncia">Ortodoncia</option>
            </select>
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
          <Button type="submit" disabled={createPatient.isPending}>
            {createPatient.isPending ? "Guardando..." : "Agregar paciente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
