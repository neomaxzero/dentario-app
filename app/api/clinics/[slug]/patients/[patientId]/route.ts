import { NextResponse } from "next/server";

import { getUserClinics } from "@/lib/clinics";
import type { CreatePatientInput } from "@/lib/patients";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string; patientId: string }>;
};

function required(value: string | null | undefined) {
  return (value ?? "").trim();
}

const allowedSpecialties = new Set(["ortopedia", "ortodoncia"] as const);

function normalizeSpecialties(value: unknown) {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string" && value
      ? [value]
      : [];

  const filtered = rawValues.filter(
    (item): item is "ortopedia" | "ortodoncia" =>
      typeof item === "string" && allowedSpecialties.has(item as "ortopedia" | "ortodoncia"),
  );

  const unique = [...new Set(filtered)];
  return unique.length > 0 ? unique : null;
}

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

export async function PATCH(request: Request, context: RouteContext) {
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

  let body: CreatePatientInput;

  try {
    body = (await request.json()) as CreatePatientInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const nombre = required(body.nombre);
  const apellido = required(body.apellido);
  const dni = required(body.dni) || null;
  const obraSocial = required(body.obraSocial) || null;
  const planObraSocial = required(body.planObraSocial) || null;
  const fechaNacimiento = required(body.fechaNacimiento);
  const telefonoPrincipal = required(body.telefonoPrincipal) || null;
  const email = required(body.email) || null;
  const numeroInterno = required(body.numeroInterno) || null;
  const ciudad = required(body.ciudad) || null;
  const direccion = required(body.direccion) || null;
  const telefonoAlternativo = required(body.telefonoAlternativo) || null;
  const observaciones = required(body.observaciones) || null;
  const fotoPerfilUrl = required(body.fotoPerfilUrl) || null;
  const sexo = body.sexo === "femenino" || body.sexo === "masculino" || body.sexo === "otro"
    ? body.sexo
    : null;
  const especialidad = normalizeSpecialties(body.especialidad);

  if (!nombre || !apellido || !fechaNacimiento) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
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

  const { data: patient, error: updateError } = await adminSupabase
    .from("pacientes")
    .update({
      foto_perfil_url: fotoPerfilUrl,
      nombre,
      apellido,
      dni,
      email,
      obra_social: obraSocial,
      plan_obra_social: planObraSocial,
      especialidad,
      numero_interno: numeroInterno,
      sexo,
      fecha_nacimiento: fechaNacimiento,
      ciudad,
      direccion,
      telefono_principal: telefonoPrincipal,
      telefono_alternativo: telefonoAlternativo,
      observaciones,
    })
    .eq("id", parsedPatientId)
    .eq("clinica_id", clinic.id)
    .select(
      "id,clinica_id,foto_perfil_url,nombre,apellido,dni,email,obra_social,plan_obra_social,especialidad,numero_interno,sexo,fecha_nacimiento,ciudad,direccion,telefono_principal,telefono_alternativo,observaciones,created_at",
    )
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!patient) {
    return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ patient });
}
