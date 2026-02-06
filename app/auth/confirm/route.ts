import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";

  const getRedirectResponse = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));
  const getErrorRedirectResponse = (message: string) =>
    getRedirectResponse(`/auth/error?error=${encodeURIComponent(message)}`);

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return getRedirectResponse(safeNext);
    }
    return getErrorRedirectResponse(error.message);
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      return getRedirectResponse(safeNext);
    }

    // redirect the user to an error page with some instructions
    return getErrorRedirectResponse(error.message);
  }

  // redirect the user to an error page with some instructions
  return getErrorRedirectResponse("No token hash, type or code");
}
