"use client";

import { type ReactNode } from "react";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSignup = pathname?.includes("register");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[60vh] w-[120vw] -translate-x-1/2">
        <div className="absolute left-1/2 top-0 h-full w-[50vw] bg-beam animate-beam blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-50 rtl:right-auto rtl:left-6">
        <LanguageToggle />
      </div>

      <div className="relative mx-auto flex min-h-screen flex-col px-6 py-10 justify-center transition-all duration-500 w-full max-w-md">

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 transition-all duration-500 mx-auto w-full">
          <div className="mb-1 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-background shadow-sm border border-border/50 p-1.5 overflow-hidden">
              <BrandLogo showText={false} imageClass="h-12 w-12 rounded-full ring-0 shadow-none object-cover" />
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
