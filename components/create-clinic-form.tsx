"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CreateClinicResponse = {
  clinic?: {
    id: number;
    slug: string | null;
  };
  error?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateClinicForm({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatedSlug = useMemo(() => slugify(name), [name]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: name,
          slug: slug || generatedSlug,
          logo,
        }),
      });

      const data = (await response.json()) as CreateClinicResponse;

      if (!response.ok) {
        setError(data.error ?? "No se pudo crear la clínica.");
        return;
      }

      setMessage("Clínica creada correctamente.");
      setName("");
      setSlug("");
      setLogo("");

      if (data.clinic?.slug) {
        window.location.href = `/app/${data.clinic.slug}`;
        return;
      }

      router.refresh();
    } catch {
      setError("Error de red al crear la clínica.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor="clinic-name">Nombre de la clínica</Label>
        <Input
          id="clinic-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Clínica Dentario Norte"
          required
          autoFocus
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="clinic-slug">Slug</Label>
        <Input
          id="clinic-slug"
          value={slug}
          onChange={(event) => setSlug(slugify(event.target.value))}
          placeholder={generatedSlug || "clinica-dentario-norte"}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="clinic-logo">URL del logo (opcional)</Label>
        <Input
          id="clinic-logo"
          type="url"
          value={logo}
          onChange={(event) => setLogo(event.target.value)}
          placeholder="https://..."
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <Button type="submit" disabled={isSubmitting || !name.trim()}>
        {isSubmitting ? "Creando..." : "Crear clínica"}
      </Button>
    </form>
  );
}
