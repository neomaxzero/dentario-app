import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLogo } from "@/components/auth-logo";
import { AuthSplitLayout } from "@/components/auth-split-layout";

export default function Page() {
  return (
    <AuthSplitLayout>
      <AuthLogo />
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">¡Gracias por registrarte!</CardTitle>
            <CardDescription>Revisa tu correo para confirmar</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Te registraste correctamente. Revisa tu correo para confirmar tu
              cuenta antes de iniciar sesión.
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthSplitLayout>
  );
}
