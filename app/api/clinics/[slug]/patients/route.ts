import { NextResponse } from "next/server";

import { getUserClinics } from "@/lib/clinics";
import type { CreatePatientInput, ObraSocial, Patient } from "@/lib/patients";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type PatientInsuranceJoin = {
  obra_social_id: number;
  obras_sociales: ObraSocial | null;
};

type PatientRow = Omit<Patient, "obras_sociales"> & {
  pacientes_obras_sociales?: PatientInsuranceJoin[] | null;
};

const patientSelect = [
  "id",
  "clinica_id",
  "foto_perfil_url",
  "nombre",
  "apellido",
  "dni",
  "email",
  "obra_social",
  "plan_obra_social",
  "especialidad",
  "numero_interno",
  "sexo",
  "fecha_nacimiento",
  "ciudad",
  "direccion",
  "telefono_principal",
  "telefono_alternativo",
  "observaciones",
  "created_at",
  "pacientes_obras_sociales(obra_social_id,obras_sociales(id,nombre,logo))",
].join(",");

function required(value: string | null | undefined) {
  return (value ?? "").trim();
}

function mapPatientWriteError(errorMessage: string | undefined, fallbackMessage: string) {
  if (errorMessage?.includes('pacientes_clinica_dni_unique')) {
    return {
      message: "Ya existe un paciente con ese DNI en esta clínica.",
      status: 409,
    };
  }

  return {
    message: errorMessage ?? fallbackMessage,
    status: 500,
  };
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

function normalizeSocialInsuranceIds(value: unknown) {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "number" || typeof value === "string"
      ? [value]
      : [];

  const parsed = rawValues
    .map((item) => {
      if (typeof item === "number") {
        return Number.isInteger(item) ? item : Number.NaN;
      }

      if (typeof item === "string" && /^\d+$/.test(item.trim())) {
        return Number.parseInt(item.trim(), 10);
      }

      return Number.NaN;
    })
    .filter((item) => Number.isInteger(item) && item > 0);

  return [...new Set(parsed)];
}

function mapPatientRow(row: PatientRow): Patient {
  const insuranceMap = new Map<number, ObraSocial>();

  for (const relation of row.pacientes_obras_sociales ?? []) {
    const insurance = relation.obras_sociales;

    if (!insurance || typeof insurance.id !== "number") {
      continue;
    }

    insuranceMap.set(insurance.id, insurance);
  }

  const obrasSociales = [...insuranceMap.values()];
  const fallbackObraSocial = obrasSociales[0]?.nombre ?? row.obra_social ?? null;

  return {
    ...row,
    obra_social: fallbackObraSocial,
    obras_sociales: obrasSociales,
  };
}

async function fetchValidSocialInsurances(adminSupabase: ReturnType<typeof createAdminClient>, ids: number[]) {
  if (ids.length === 0) {
    return [] as ObraSocial[];
  }

  const { data, error } = await adminSupabase
    .from("obras_sociales")
    .select("id,nombre,logo")
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  const insurances = (data ?? []) as ObraSocial[];
  return ids
    .map((id) => insurances.find((insurance) => insurance.id === id))
    .filter((insurance): insurance is ObraSocial => Boolean(insurance));
}

async function replacePatientSocialInsurances(
  adminSupabase: ReturnType<typeof createAdminClient>,
  patientId: number,
  insuranceIds: number[],
) {
  const { error: deleteError } = await adminSupabase
    .from("pacientes_obras_sociales")
    .delete()
    .eq("paciente_id", patientId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (insuranceIds.length === 0) {
    return;
  }

  const rows = insuranceIds.map((insuranceId) => ({
    paciente_id: patientId,
    obra_social_id: insuranceId,
  }));

  const { error: insertError } = await adminSupabase
    .from("pacientes_obras_sociales")
    .insert(rows);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function fetchPatientById(
  adminSupabase: ReturnType<typeof createAdminClient>,
  clinicId: number,
  patientId: number,
) {
  const { data, error } = await adminSupabase
    .from("pacientes")
    .select(patientSelect)
    .eq("id", patientId)
    .eq("clinica_id", clinicId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapPatientRow(data as unknown as PatientRow) : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const requestUrl = new URL(_request.url);
  const rawPage = Number.parseInt(requestUrl.searchParams.get("page") ?? "1", 10);
  const rawPageSize = Number.parseInt(requestUrl.searchParams.get("pageSize") ?? "10", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0
    ? Math.min(rawPageSize, 100)
    : 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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

  const { data: patients, count, error: patientsError } = await adminSupabase
    .from("pacientes")
    .select(patientSelect, { count: "exact" })
    .eq("clinica_id", clinic.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (patientsError) {
    return NextResponse.json({ error: patientsError.message }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({
    patients: (patients ?? []).map((patient) => mapPatientRow(patient as unknown as PatientRow)),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
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

  let body: CreatePatientInput;

  try {
    body = (await request.json()) as CreatePatientInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const nombre = required(body.nombre);
  const apellido = required(body.apellido);
  const dni = required(body.dni) || null;
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
  const obraSocialIds = normalizeSocialInsuranceIds(body.obraSocialIds);

  if (!nombre || !apellido || !fechaNacimiento) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
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

  let selectedInsurances: ObraSocial[] = [];

  try {
    selectedInsurances = await fetchValidSocialInsurances(adminSupabase, obraSocialIds);
  } catch (validationError) {
    const message =
      validationError instanceof Error
        ? validationError.message
        : "No se pudieron validar las obras sociales.";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (selectedInsurances.length !== obraSocialIds.length) {
    return NextResponse.json(
      { error: "Hay obras sociales seleccionadas que no existen." },
      { status: 400 },
    );
  }

  const primaryInsurance = selectedInsurances[0]?.nombre ?? null;
  const { data: insertedPatient, error: insertError } = await adminSupabase
    .from("pacientes")
    .insert({
      clinica_id: clinic.id,
      foto_perfil_url: fotoPerfilUrl,
      nombre,
      apellido,
      dni,
      email,
      obra_social: primaryInsurance,
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
    .select("id")
    .single();

  if (insertError || !insertedPatient) {
    const mappedError = mapPatientWriteError(insertError?.message, "No se pudo crear el paciente.");
    return NextResponse.json({ error: mappedError.message }, { status: mappedError.status });
  }

  try {
    await replacePatientSocialInsurances(adminSupabase, insertedPatient.id, obraSocialIds);
    const patient = await fetchPatientById(adminSupabase, clinic.id, insertedPatient.id);

    if (!patient) {
      return NextResponse.json({ error: "No se encontró el paciente creado." }, { status: 500 });
    }

    return NextResponse.json({ patient }, { status: 201 });
  } catch (relationError) {
    await adminSupabase.from("pacientes").delete().eq("id", insertedPatient.id);

    const message =
      relationError instanceof Error
        ? relationError.message
        : "No se pudieron guardar las obras sociales del paciente.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
