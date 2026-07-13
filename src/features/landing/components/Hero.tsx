import Link from "next/link";
import Image from "next/image";
import heroMain from "@/assets/hero-main.jpg";
import heroSide from "@/assets/hero-side.jpg";
import { useT } from "@/i18n/LanguageProvider";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";

export function Hero() {
  const t = useT();
  const { session, role, loading } = useCurrentUserRole();
  return (
    <section id="home" className="relative scroll-mt-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_60%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[80vh] w-[120vw] -translate-x-1/2 opacity-60">
        <div className="absolute left-1/2 top-0 h-full w-[60vw] bg-beam animate-beam blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-6 pb-8 md:pt-10 md:pb-10">
        <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7 text-center lg:text-start order-2 lg:order-1">

            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-balance leading-tight tracking-tight">
              {t.hero.titleA} <span className="bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent">{t.hero.academic}</span>{" "}
              {t.hero.and} <span className="bg-gradient-to-br from-primary to-purple-500 bg-clip-text text-transparent">{t.hero.career}</span> {t.hero.titleB}
            </h1>

            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-base md:text-lg text-muted-foreground text-balance leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className={`mt-8 flex flex-wrap items-center justify-center ${session ? 'w-full' : 'lg:justify-start'} gap-3`}>
              {!loading && (
                <Link
                  href={session ? (role === "admin" ? "/admin" : "/dashboard") : "/auth/login"}
                  className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow shadow-primary/30"
                >
                  {session ? t.nav.dashboard : t.actions.startJourney}
                </Link>
              )}
              {!session && (
                <a
                  href="#features"
                  className="rounded-full border border-border/50 bg-background/50 backdrop-blur-md px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  {t.actions.explore}
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl ring-1 ring-border shadow-glow">
                <Image
                  src={heroMain}
                  alt="Computer science student focused on her work with Beacon"
                  priority
                  width={1280}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="aspect-[16/10] w-full object-cover object-center"
                  placeholder="blur"
                />
              </div>

              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 hidden sm:block w-32 md:w-40 lg:w-48 rotate-[-4deg] overflow-hidden rounded-xl md:rounded-2xl ring-1 ring-border bg-card shadow-glow">
                <Image
                  src={heroSide}
                  alt="Beacon dashboard preview"
                  width={960}
                  height={640}
                  loading="lazy"
                  sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                  placeholder="blur"
                  className="aspect-video w-full object-cover"
                />
              </div>

              <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 hidden md:flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur px-3 py-2 text-xs font-medium text-foreground shadow-glow">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t.hero.sideLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
