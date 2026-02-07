import { notFound, redirect } from "next/navigation";

import { AppDashboardShell } from "@/components/app-dashboard-shell";
import { getUserClinics } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";

type ClinicLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ClinicLayout({ children, params }: ClinicLayoutProps) {
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
  const isAdmin = (clinics ?? []).some((item) => item.role === "admin");

  if (!clinic) {
    notFound();
  }

  const userName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Dentario User";

  return (
    <AppDashboardShell
      clinic={clinic}
      clinics={clinics ?? []}
      isAdmin={isAdmin}
      user={{
        name: userName,
        email: user.email ?? "",
        avatar: user.user_metadata?.avatar_url ?? "",
      }}
    >
      {children}
    </AppDashboardShell>
  );
}
