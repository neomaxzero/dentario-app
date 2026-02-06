import type { SupabaseClient } from "@supabase/supabase-js";

export type UserClinic = {
  id: number;
  nombre: string | null;
  logo: string | null;
  slug: string | null;
};

type UserClinicLinkRow = {
  clinica_id: number | null;
};

export async function getUserClinics(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: UserClinic[] | null; error: string | null }> {
  const { data: links, error: linksError } = await supabase
    .from("usuarios_clinica")
    .select("clinica_id")
    .eq("user_id", userId);

  if (linksError) {
    return { data: null, error: linksError.message };
  }

  const clinicIds = Array.from(
    new Set(
      ((links ?? []) as UserClinicLinkRow[])
        .map((row) => row.clinica_id)
        .filter((id): id is number => typeof id === "number")
    )
  );

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
  const normalized = clinicIds.map((id) => {
    const clinic = clinicsById.get(id);

    return {
      id,
      nombre: clinic?.nombre ?? null,
      logo: clinic?.logo ?? null,
      slug: clinic?.slug ?? null,
    };
  });

  return { data: normalized, error: null };
}
