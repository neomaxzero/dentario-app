import { NextResponse } from "next/server";

import { getUserClinics } from "@/lib/clinics";
import type { ObraSocial } from "@/lib/patients";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type PatientSearchRow = {
  id: number;
  nombre: string;
  apellido: string;
  foto_perfil_url: string | null;
  dni: string | null;
  telefono_principal: string | null;
  obra_social: string | null;
  pacientes_obras_sociales?: { obras_sociales: ObraSocial | ObraSocial[] | null }[] | null;
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
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data: clinics, error } = await getUserClinics(supabase, user.id);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const clinic = (clinics ?? []).find((item) => item.slug === slug);

  if (!clinic) {
    return NextResponse.json({ error: "Clínica no encontrada." }, { status: 404 });
  }

  let adminSupabase;

  try {
    adminSupabase = createAdminClient();
  } catch (clientError) {
    const message =
      clientError instanceof Error
        ? clientError.message
        : "No se pudo inicializar el cliente administrador.";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  const pattern = `%${q}%`;
  const { data: patients, error: patientsError } = await adminSupabase
    .from("pacientes")
    .select(
      "id,nombre,apellido,foto_perfil_url,dni,telefono_principal,obra_social,pacientes_obras_sociales(obras_sociales(id,nombre,logo))",
    )
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

  const mappedPatients = ((patients ?? []) as unknown as PatientSearchRow[]).map((patient) => {
    const firstInsurance = patient.pacientes_obras_sociales
      ?.map((relation) => {
        if (Array.isArray(relation.obras_sociales)) {
          return relation.obras_sociales[0] ?? null;
        }

        return relation.obras_sociales;
      })
      .find((insurance): insurance is ObraSocial => Boolean(insurance));

    return {
      id: patient.id,
      nombre: patient.nombre,
      apellido: patient.apellido,
      foto_perfil_url: patient.foto_perfil_url,
      dni: patient.dni,
      telefono_principal: patient.telefono_principal,
      obra_social: firstInsurance?.nombre ?? patient.obra_social ?? null,
    };
  });

  return NextResponse.json({ patients: mappedPatients });
}
