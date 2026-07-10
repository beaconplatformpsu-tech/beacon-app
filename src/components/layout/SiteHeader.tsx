import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserRound,
  Users,
  X,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import logo from "@/assets/beacon-logo.jpg";
import { Button } from "@/components/ui/button";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useT } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { NotificationsDropdown } from "@/components/shared/NotificationsDropdown";
import { XIcon } from "@/components/icons/XIcon";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type NavItem = { href: string; label: string; icon?: LucideIcon };

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");
  const { session, role, loading } = useCurrentUserRole();
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    setActiveHash(window.location.hash || "#home");
    const handleHashChange = () => setActiveHash(window.location.hash || "#home");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Close menu on resize to lg+
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const guestNav: NavItem[] = [
    { href: "#home", label: t.nav.home },
    { href: "#about", label: t.nav.about },
    { href: "#contact", label: t.nav.contact },
    { href: "#features", label: t.nav.features },
  ];
  const studentNav: NavItem[] = [
    { href: "/", label: t.nav.home },
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/tasks", label: t.nav.academicTasks },
    { href: "/skills", label: t.nav.skillsCareers },
    { href: "/support", label: t.nav.support },
  ];
  const adminNav: NavItem[] = [
    { href: "/", label: t.nav.home },
    { href: "/admin", label: t.nav.adminDashboard, icon: LayoutDashboard },
    { href: "/admin/users", label: t.nav.manageUsers, icon: Users },
    { href: "/admin/content", label: t.nav.contentResources },
    { href: "/admin/messages", label: t.nav.viewFeedback },
    { href: "/admin/settings", label: t.nav.platformSettings, icon: Settings },
  ];
  const nav = session ? (role === "admin" ? adminNav : studentNav) : guestNav;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(auth);
      setMenuOpen(false);
      router.push("/auth/login");
    } finally {
      setSigningOut(false);
    }
  };

  /** Social icons row - shared between desktop top bar and mobile dropdown footer */
  const SocialIcons = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <a href="#" aria-label="Instagram" className="bg-white text-primary rounded-full p-1.5 hover:bg-white/90 transition-colors shadow-sm"><Instagram className="h-3.5 w-3.5" /></a>
      <a href="#" aria-label="X / Twitter" className="bg-white text-primary rounded-full p-1.5 hover:bg-white/90 transition-colors shadow-sm"><XIcon className="h-3.5 w-3.5" /></a>
      <a href="#" aria-label="LinkedIn" className="bg-white text-primary rounded-full p-1.5 hover:bg-white/90 transition-colors shadow-sm"><Linkedin className="h-3.5 w-3.5" /></a>
      <a href="#" aria-label="YouTube" className="bg-white text-primary rounded-full p-1.5 hover:bg-white/90 transition-colors shadow-sm"><Youtube className="h-3.5 w-3.5" /></a>
      <a href="#" aria-label="Facebook" className="bg-white text-primary rounded-full p-1.5 hover:bg-white/90 transition-colors shadow-sm"><Facebook className="h-3.5 w-3.5" /></a>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full flex flex-col shadow-sm">

      {/* ── TOP BAR: desktop-only primary brand strip ── */}
      <div className="hidden md:block bg-primary text-primary-foreground">
        <div className="mx-auto flex py-2 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logo}
              alt="Beacon"
              priority
              width={64}
              height={64}
              className="h-16 w-16 object-cover rounded-full"
            />
            <span className="font-sans font-bold text-2xl tracking-widest">Beacon</span>
          </Link>
          <SocialIcons />
        </div>
      </div>

      {/* ── MAIN NAV BAR: unified across all screen sizes ── */}
      <div className="border-b border-border/40 max-md:bg-primary md:bg-background/80 backdrop-blur-lg md:supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">

          {/* Left: Logo (mobile only - desktop shows logo in top bar) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 md:hidden">
              <Image
                src={logo}
                alt="Beacon"
                priority
                width={48}
                height={48}
                className="h-12 w-12 object-cover rounded-full"
              />
              <span className="font-sans font-bold text-lg tracking-widest text-primary-foreground">Beacon</span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-8 md:ms-2" aria-label="Main navigation">
              {nav.map(({ href, label }) => {
                const isActive = activeHash === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    prefetch={true}
                    onClick={() => href.startsWith("#") && setActiveHash(href)}
                    className={`relative whitespace-nowrap py-1 text-[14px] font-medium transition-all duration-200 ${isActive
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground"
                      }`}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Sign-in + Language - desktop/tablet (sm+) */}
            <div className="hidden sm:flex items-center gap-2">
              {!loading && (
                session ? (
                  <div className="flex items-center gap-2">
                    <NotificationsDropdown />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full border max-md:border-primary-foreground/30 md:border-border/50 max-md:bg-primary-foreground/10 md:bg-background pl-2 pr-3 py-1 max-md:hover:bg-primary-foreground/20 md:hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={session.photoURL || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {session.displayName?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium max-md:text-primary-foreground md:text-foreground max-w-[100px] truncate">
                            {session.displayName || "Student"}
                          </span>
                          <ChevronDown className="h-3 w-3 max-md:text-primary-foreground/70 md:text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 mt-2">
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/profile" className="flex items-center gap-2 w-full">
                            <UserRound className="h-4 w-4" />
                            <span>{t.nav.profile}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowSignOutConfirm(true)} disabled={signingOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>{t.actions.signOut}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Button
                    onClick={() => router.push("/auth/login")}
                    size="sm"
                    className="rounded-full px-5 font-medium shadow-sm"
                  >
                    {t.actions.signIn}
                  </Button>
                )
              )}
            </div>

            {/* Hamburger - mobile/tablet (below lg) */}
            <button
              className={`lg:hidden flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${menuOpen
                  ? "max-md:bg-primary-foreground/20 max-md:text-primary-foreground md:bg-primary/10 md:text-primary"
                  : "max-md:text-primary-foreground/90 max-md:hover:bg-primary-foreground/10 max-md:hover:text-primary-foreground md:text-foreground/70 md:hover:bg-accent md:hover:text-foreground"
                }`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Language Toggle - Far Right */}
            <LanguageToggle className="max-md:border-primary-foreground/30 max-md:text-primary-foreground/90 max-md:hover:text-primary-foreground md:border-border/60 md:text-foreground/70 md:hover:text-foreground" />
          </div>

        </div>
      </div>

      {/* ── MOBILE DROPDOWN ── */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-lg px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto max-w-7xl flex flex-col gap-0.5">

            {/* Nav links */}
            {nav.map(({ href, label, icon: Icon }) => {
              const isActive = activeHash === href;
              return (
                <Link
                  key={label}
                  href={href}
                  prefetch={true}
                  onClick={() => {
                    if (href.startsWith("#")) setActiveHash(href);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
                  {label}
                  {isActive && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-2 border-t border-border/50" />

            {/* Profile (mobile only) */}
            {session && (
              <Link
                href="/profile"
                prefetch={true}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeHash === "/profile"
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <UserRound className="h-4 w-4 shrink-0 text-primary" />
                {t.nav.profile}
              </Link>
            )}

            {/* Auth - mobile only */}
            <div className="sm:hidden flex items-center justify-center gap-4 px-1 pb-2 pt-2">
              {!loading && (
                session ? (
                  <div className="w-32 flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSignOutConfirm(true)}
                      isLoading={signingOut}
                      loadingText={t.actions.signOut}
                      className="w-full rounded-full gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t.actions.signOut}
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 flex justify-center">
                    <Button 
                      className="w-full rounded-xl shadow-md"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/auth/login");
                      }}
                    >
                      {t.actions.signIn}
                    </Button>
                  </div>
                )
              )}
            </div>

            {/* Social icons - mobile only (desktop has them in top bar) */}
            <div className="md:hidden pt-1 pb-2 flex justify-center">
              <SocialIcons />
            </div>

          </div>
        </nav>
      )}

      <ConfirmDialog
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title={t.actions.confirmSignOut || "Are you sure you want to sign out?"}
        description={t.actions.warning || "You will need to sign in again to access your dashboard."}
        confirmText={t.actions.signOut || "Sign Out"}
        cancelText={t.actions.cancel || "Cancel"}
        isLoading={signingOut}
      />
    </header>
  );
}
