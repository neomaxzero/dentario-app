import { NextResponse } from "next/server";

import { getUserClinics, isUserAdmin } from "@/lib/clinics";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CreateClinicBody = {
  nombre?: string;
  logo?: string;
  slug?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data, error }, { isAdmin, error: roleError }] = await Promise.all([
    getUserClinics(supabase, user.id),
    isUserAdmin(supabase, user.id),
  ]);

  if (error || roleError) {
    return NextResponse.json({ error: error ?? roleError }, { status: 500 });
  }

  return NextResponse.json({ clinics: data ?? [], isAdmin });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { isAdmin, error: roleError } = await isUserAdmin(supabase, user.id);

  if (roleError) {
    return NextResponse.json({ error: roleError }, { status: 500 });
  }

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Only admin users can add clinics." },
      { status: 403 }
    );
  }

  let body: CreateClinicBody;

  try {
    body = (await request.json()) as CreateClinicBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const nombre = body.nombre?.trim() ?? "";
  const logo = body.logo?.trim() || null;
  const desiredSlug = (body.slug?.trim() || slugify(nombre)).toLowerCase();

  if (!nombre) {
    return NextResponse.json(
      { error: "Clinic name is required." },
      { status: 400 }
    );
  }

  if (!desiredSlug) {
    return NextResponse.json(
      { error: "A valid slug is required." },
      { status: 400 }
    );
  }

  let adminSupabase;

  try {
    adminSupabase = createAdminClient();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialize admin client.";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: clinic, error: clinicError } = await adminSupabase
    .from("clinicas")
    .insert({ nombre, logo, slug: desiredSlug })
    .select("id,nombre,logo,slug")
    .single();

  if (clinicError) {
    const isDuplicateSlug = clinicError.code === "23505";

    return NextResponse.json(
      {
        error: isDuplicateSlug
          ? "Slug already exists. Use a different slug or clinic name."
          : clinicError.message,
      },
      { status: isDuplicateSlug ? 409 : 500 }
    );
  }

  const { error: membershipError } = await adminSupabase
    .from("usuarios_clinica")
    .insert({
      user_id: user.id,
      clinica_id: clinic.id,
      role: "admin",
    });

  if (membershipError) {
    await adminSupabase.from("clinicas").delete().eq("id", clinic.id);

    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      clinic,
      message: "Clinic created successfully.",
    },
    { status: 201 }
  );
}
