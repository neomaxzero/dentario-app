import { NextResponse } from "next/server";

import { getUserClinics } from "@/lib/clinics";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

  const { data: obrasSociales, error: insurancesError } = await adminSupabase
    .from("obras_sociales")
    .select("id,nombre,logo")
    .order("nombre", { ascending: true });

  if (insurancesError) {
    return NextResponse.json({ error: insurancesError.message }, { status: 500 });
  }

  return NextResponse.json({ obrasSociales: obrasSociales ?? [] });
}
