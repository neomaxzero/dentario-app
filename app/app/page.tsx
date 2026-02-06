import { redirect } from "next/navigation";

import { getUserClinics } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppPage() {
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
    redirect("/auth/login");
  }

  const preferredClinic = (clinics ?? []).find((clinic) => clinic.slug);

  if (!preferredClinic?.slug) {
    redirect("/auth/login");
  }

  redirect(`/app/${preferredClinic.slug}`);
}
