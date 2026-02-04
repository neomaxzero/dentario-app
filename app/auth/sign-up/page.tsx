import { AuthLogo } from "@/components/auth-logo";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <AuthSplitLayout>
      <AuthLogo />
      <SignUpForm />
    </AuthSplitLayout>
  );
}
