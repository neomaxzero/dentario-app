import type { ReactNode } from "react";

const AUTH_IMAGE_URL =
  "https://pngmagic.com/webp_images/abstract-blue-gradient-background-images-for-free-download_MHZ.webp";

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
                backgroundImage: `url(${AUTH_IMAGE_URL})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
