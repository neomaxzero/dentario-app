import type { SupabaseClient } from "@supabase/supabase-js";

export type ClinicRole = "admin" | "staff";

export type UserClinic = {
  id: number;
  nombre: string | null;
  logo: string | null;
  slug: string | null;
  role: ClinicRole;
};

type UserClinicLinkRow = {
  clinica_id: number | null;
  role: ClinicRole | null;
};

export async function getUserClinics(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: UserClinic[] | null; error: string | null }> {
  const { data: links, error: linksError } = await supabase
    .from("usuarios_clinica")
    .select("clinica_id,role")
    .eq("user_id", userId);

  if (linksError) {
    return { data: null, error: linksError.message };
  }

  const normalizedLinks = ((links ?? []) as UserClinicLinkRow[]).filter(
    (row): row is { clinica_id: number; role: ClinicRole } =>
      typeof row.clinica_id === "number" &&
      (row.role === "admin" || row.role === "staff")
  );

  const clinicIds = Array.from(new Set(normalizedLinks.map((row) => row.clinica_id)));

  if (clinicIds.length === 0) {
    return { data: [], error: null };
  }

  const { data: clinics, error: clinicsError } = await supabase
    .from("clinicas")
    .select("id,nombre,logo,slug")
    .in("id", clinicIds);

  if (clinicsError) {
    return { data: null, error: clinicsError.message };
  }

  const clinicsById = new Map(
    (clinics ?? []).map((clinic) => [clinic.id as number, clinic])
  );

  // If RLS blocks rows in `clinicas`, keep association IDs so user is not treated as unlinked.
  const normalized = normalizedLinks.map(({ clinica_id, role }) => {
    const clinic = clinicsById.get(clinica_id);

    return {
      id: clinica_id,
      nombre: clinic?.nombre ?? null,
      logo: clinic?.logo ?? null,
      slug: clinic?.slug ?? null,
      role,
    };
  });

  return { data: normalized, error: null };
}

export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<{ isAdmin: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("usuarios_clinica")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .limit(1);

  if (error) {
    return { isAdmin: false, error: error.message };
  }

  return { isAdmin: (data ?? []).length > 0, error: null };
}
