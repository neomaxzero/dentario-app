import { NextResponse } from "next/server";

import { getUserClinics } from "@/lib/clinics";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string; patientId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug, patientId } = await context.params;
  const parsedPatientId = /^\d+$/.test(patientId)
    ? Number.parseInt(patientId, 10)
    : Number.NaN;

  if (!Number.isInteger(parsedPatientId) || parsedPatientId <= 0) {
    return NextResponse.json({ error: "ID de paciente inválido." }, { status: 400 });
  }

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

  const { data: patient, error: patientError } = await adminSupabase
    .from("pacientes")
    .select(
      "id,clinica_id,foto_perfil_url,nombre,apellido,dni,email,obra_social,plan_obra_social,especialidad,numero_interno,sexo,fecha_nacimiento,ciudad,direccion,telefono_principal,telefono_alternativo,observaciones,created_at",
    )
    .eq("id", parsedPatientId)
    .eq("clinica_id", clinic.id)
    .maybeSingle();

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 500 });
  }

  if (!patient) {
    return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ patient });
}
