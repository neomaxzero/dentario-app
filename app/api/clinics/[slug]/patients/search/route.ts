import { NextResponse } from "next/server";

import { getUserClinics } from "@/lib/clinics";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function sanitizeSearchValue(value: string) {
  return value.trim().replace(/[^\p{L}\p{N}\s@._-]/gu, "");
}

export async function GET(request: Request, context: RouteContext) {
  const requestUrl = new URL(request.url);
  const q = sanitizeSearchValue(requestUrl.searchParams.get("q") ?? "");
  const rawLimit = Number.parseInt(requestUrl.searchParams.get("limit") ?? "8", 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 20) : 8;

  if (q.length < 2) {
    return NextResponse.json({ patients: [] });
  }

  const { slug } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: clinics, error } = await getUserClinics(supabase, user.id);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const clinic = (clinics ?? []).find((item) => item.slug === slug);

  if (!clinic) {
    return NextResponse.json({ error: "Clinic not found." }, { status: 404 });
  }

  let adminSupabase;

  try {
    adminSupabase = createAdminClient();
  } catch (clientError) {
    const message =
      clientError instanceof Error
        ? clientError.message
        : "Failed to initialize admin client.";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  const pattern = `%${q}%`;
  const { data: patients, error: patientsError } = await adminSupabase
    .from("pacientes")
    .select("id,nombre,apellido,foto_perfil_url,dni,telefono_principal,obra_social")
    .eq("clinica_id", clinic.id)
    .or(
      [
        `nombre.ilike.${pattern}`,
        `apellido.ilike.${pattern}`,
        `dni.ilike.${pattern}`,
      ].join(","),
    )
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true })
    .limit(limit);

  if (patientsError) {
    return NextResponse.json({ error: patientsError.message }, { status: 500 });
  }

  return NextResponse.json({ patients: patients ?? [] });
}
