const SUPABASE_AUTH_ERROR_MESSAGES: Array<[pattern: RegExp, translation: string]> = [
  [/invalid login credentials/i, "Correo o contraseña incorrectos."],
  [/email not confirmed/i, "Debes confirmar tu correo antes de iniciar sesión."],
  [/user already registered/i, "Ya existe una cuenta con este correo electrónico."],
  [/password should be at least/i, "La contraseña es demasiado corta."],
  [/signup is disabled/i, "El registro de nuevas cuentas está deshabilitado."],
  [/token has expired|jwt expired|expired/i, "La sesión o enlace expiró. Intenta nuevamente."],
  [/invalid token|token is invalid/i, "El enlace o token no es válido."],
  [/rate limit|too many requests/i, "Demasiados intentos. Intenta de nuevo en unos minutos."],
];

export function translateSupabaseAuthError(error: unknown): string {
  const fallback = "Ocurrió un error inesperado.";

  if (!(error instanceof Error)) {
    return fallback;
  }

  for (const [pattern, translation] of SUPABASE_AUTH_ERROR_MESSAGES) {
    if (pattern.test(error.message)) {
      return translation;
    }
  }

  return error.message || fallback;
}
