import { NextResponse } from "next/server";

import { getUserClinics } from "@/lib/clinics";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const AVATAR_BUCKET = "patient-avatars";

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export async function POST(request: Request, context: RouteContext) {
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

  const formData = await request.formData();
  const fileEntry = Array.from(formData.values()).find(
    (value): value is File => value instanceof File
  );

  if (!fileEntry) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!fileEntry.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }

  if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image size must be 5MB or smaller." },
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

  const extension = fileEntry.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${clinic.id}/${user.id}/${crypto.randomUUID()}.${sanitizeFileName(extension)}`;

  const { error: uploadError } = await adminSupabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, fileEntry, {
      contentType: fileEntry.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = adminSupabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  return NextResponse.json({ path: filePath, publicUrl }, { status: 201 });
}
