import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/header";
import { getUserClinics } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";

type ClinicPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: clinics, error } = await getUserClinics(supabase, user.id);

  if (error) {
    notFound();
  }

  const clinic = (clinics ?? []).find((item) => item.slug === slug);

  if (!clinic) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-12 items-center">
        <Header clinic={clinic} />
        <div className="flex-1 w-full max-w-5xl p-5 mt-20">
          <h1 className="text-2xl font-semibold">{clinic.nombre ?? "Clinica"}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Bienvenido a la clinica /{clinic.slug}
          </p>
        </div>
      </div>
    </main>
  );
}
