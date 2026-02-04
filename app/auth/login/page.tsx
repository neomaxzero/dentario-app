import { AuthLogo } from "@/components/auth-logo";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <AuthSplitLayout>
      <AuthLogo />
      <LoginForm />
    </AuthSplitLayout>
  );
}
