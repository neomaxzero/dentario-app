"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { Menu, X } from "lucide-react";

import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "./env-var-warning";
import { AuthButton } from "./auth-button";

type HeaderClinic = {
  id: number;
  nombre: string | null;
  logo: string | null;
  slug: string | null;
};

type HeaderProps = {
  clinic?: HeaderClinic;
};

export function Header({ clinic }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clinicName = clinic?.nombre ?? "Dentario";
  const clinicHref = clinic?.slug ? `/app/${clinic.slug}` : "/app";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={clinicHref} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary overflow-hidden">
              {clinic?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clinic.logo}
                  alt={clinicName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary-foreground"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              )}
            </div>
            <span className="text-xl font-bold text-foreground">{clinicName}</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm font-medium">{clinicName}</p>
            <div className="pt-3 flex flex-col gap-2">
              {!hasEnvVars ? (
                <EnvVarWarning />
              ) : (
                <Suspense>
                  <AuthButton />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
