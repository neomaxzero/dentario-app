import type { ReactNode } from "react";

const AUTH_IMAGE_URL = "/splash-auth.jpg";
const LOGO_IMAGE_URL = "/logo-white.png";

type AuthSplitLayoutProps = {
  children: ReactNode;
};

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full ">
        <div className="grid min-h-svh w-full items-stretch gap-10 rounded-2xl bg-background p-6 shadow-sm md:grid-cols-2 md:gap-12 md:p-8">
          <div className="w-full max-w-sm mx-auto mt-28">
            <div className="space-y-8">{children}</div>
          </div>
          <div className="hidden md:block">
            <div
              className="h-full min-h-[520px] w-full rounded-2xl bg-cover bg-center"
              style={{
                backgroundImage: `url(${LOGO_IMAGE_URL}), url(${AUTH_IMAGE_URL})`,
                backgroundPosition: "bottom 24px right 24px, center",
                backgroundRepeat: "no-repeat, no-repeat",
                backgroundSize: "60px auto, cover",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
