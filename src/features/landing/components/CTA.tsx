import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/beacon-logo.jpg";
import { useT } from "@/i18n/LanguageProvider";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";

export function CTA() {
  const t = useT();
  const { session, role, loading } = useCurrentUserRole();
  return (
    <section id="cta" className="relative py-8 md:py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16 text-center shadow-card">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-beam blur-3xl opacity-70" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
          <Image src={logo} alt="Beacon" className="relative mx-auto h-16 w-16 rounded-xl object-cover ring-1 ring-border shadow-glow" />
          <h2 className="relative mt-6 font-display text-4xl md:text-5xl text-balance leading-[1.05]">
            {t.cta.title}
          </h2>
          <p className="relative mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.cta.subtitle}
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            {!loading && (
              <Link
                href={session ? (role === "admin" ? "/admin" : "/dashboard") : "/auth"}
                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow"
              >
                {session ? t.nav.dashboard : t.actions.createAccount}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
