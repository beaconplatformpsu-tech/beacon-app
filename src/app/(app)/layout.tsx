"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, CheckSquare, BookOpen, GraduationCap, HeartHandshake,
  LockKeyhole, LogOut, Settings, MessageSquare, Home, Menu, X,
  Newspaper, Mountain, Users, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT, useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/shared/FeedbackModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { NotificationsDropdown } from "@/components/shared/NotificationsDropdown";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser: session, role, loading, isEmailVerified, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const toast = useCustomToast();
  const t = useT();
  const { dir } = useLanguage();

  // ── Auth gate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (!session) {
      toast.warning(t.layout.authRequired, t.layout.pleaseLogin);
      router.push("/auth/login");
      return;
    }
    if (!isEmailVerified) {
      router.push("/auth/verify-email");
      return;
    }
  }, [session, loading, isEmailVerified, router, toast, t.layout]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // ── Loading / unauthenticated splash ──────────────────────────────────────
  if (loading || !session || !isEmailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Sign-out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await logout();
    toast.success(t.actions?.signOut || "Signed out successfully", "See you next time!");
    router.push("/auth/login");
  };

  // ── Nav items by role ─────────────────────────────────────────────────────
  const isAdmin = role === "admin" || role === "super_admin";

  const navItems = isAdmin ? [
    { label: t.nav.adminDashboard, href: "/admin", icon: LayoutDashboard },
    { label: t.nav.manageUsers, href: "/admin/users", icon: Users },
    { label: t.nav.adminTasks, href: "/admin/tasks", icon: CheckSquare },
    { label: t.nav.adminSkills, href: "/admin/skills", icon: BookOpen },
    { label: t.nav.adminCareer, href: "/admin/career", icon: GraduationCap },
    { label: t.nav.adminSupport, href: "/admin/support", icon: HeartHandshake },
    { label: t.nav.adminContent, href: "/admin/content", icon: Mountain },
    { label: t.nav.adminAnalytics, href: "/admin/analytics", icon: Newspaper },
    { label: t.nav.adminMessages, href: "/admin/messages", icon: MessageSquare },
    { label: t.nav.platformSettings, href: "/admin/settings", icon: Settings },
  ] : [
    { label: t.nav.home, href: "/", icon: Home },
    { label: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { label: t.nav.academicTasks, href: "/tasks", icon: CheckSquare },
    { label: t.nav.skillsCareers, href: "/skills", icon: BookOpen },
    { label: t.nav.career, href: "/career", icon: GraduationCap },
    { label: t.nav.support, href: "/support", icon: HeartHandshake },
    { label: t.nav.privateNotes, href: "/notes", icon: LockKeyhole },
  ];

  // Sidebar width
  const sidebarW = isCollapsed ? "w-[4.5rem]" : "w-64";

  // Sidebar visibility classes for mobile (toggle open/close)
  // In LTR sidebar is on the left (start), slides in from left
  // In RTL sidebar is on the right (start), slides in from right
  const sidebarVisibility = sidebarOpen
    ? "translate-x-0"
    : dir === "rtl"
      ? "translate-x-full"
      : "-translate-x-full";

  // Desktop: sidebar is always visible (translate-x-0)
  // The "start-0" already puts it on the correct edge in both LTR & RTL

  // Collapse chevron icon — flip logic: in LTR, collapsed=ChevronRight (expand), expanded=ChevronLeft (collapse)
  //                                     in RTL,  collapsed=ChevronLeft (expand), expanded=ChevronRight (collapse)
  const CollapseIcon = isCollapsed
    ? (dir === "rtl" ? ChevronLeft : ChevronRight)
    : (dir === "rtl" ? ChevronRight : ChevronLeft);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50 dark:bg-slate-950" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-primary px-4 md:px-6 shadow-md">
        {/* Start Side: Hamburger & Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            className="lg:hidden p-1.5 sm:p-2 hover:bg-primary-foreground/10 text-primary-foreground rounded-xl transition-all active:scale-95 shrink-0"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo: desktop only (sidebar already shows logo) */}
          <div className="hidden lg:flex items-center min-w-0">
            <BrandLogo
              textClass="text-primary-foreground text-xl md:text-2xl font-bold truncate"
              imageClass="h-10 w-10 md:h-12 md:w-12 shrink-0"
            />
          </div>
          {/* Logo: mobile */}
          <div className="flex lg:hidden items-center min-w-0">
            <BrandLogo
              textClass="text-primary-foreground text-lg font-bold truncate"
              imageClass="h-10 w-10 shrink-0"
            />
          </div>
        </div>

        {/* End Side: actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 text-primary-foreground">
          <div className="[&_button]:text-primary-foreground [&_button]:hover:bg-primary-foreground/10 [&_svg]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70">
            <NotificationsDropdown />
          </div>
          <UserDropdown
            buttonClassName="flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 ps-1 pe-2 sm:pe-3 py-1 hover:bg-primary-foreground/20 hover:shadow-md transition-all focus:outline-none cursor-pointer"
            textClassName="text-sm font-bold text-primary-foreground max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline-block"
            iconClassName="h-4 w-4 text-primary-foreground shrink-0"
          />
          <LanguageToggle className="hidden md:flex text-primary-foreground border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20" />
        </div>
      </header>

      {/* ── SIDEBAR ───────────────────────────────────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 start-0 z-50 lg:z-30",
          sidebarW,
          "bg-primary text-primary-foreground shadow-2xl lg:shadow-none",
          "transition-all duration-300 ease-out",
          "pt-0 lg:pt-16",
          "flex flex-col",
          // Mobile: toggle visibility; Desktop: always visible
          "lg:translate-x-0",
          sidebarVisibility,
        ].join(" ")}
      >
        {/* Desktop collapse toggle — anchored outside the sidebar on the trailing edge */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex absolute -end-3 top-20 bg-background text-foreground rounded-full p-1 border shadow-sm z-50 hover:bg-accent transition-colors"
        >
          <CollapseIcon className="w-4 h-4" />
        </button>

        {/* Mobile sidebar header (logo + close) */}
        <div className="lg:hidden flex h-16 items-center px-4 shrink-0 bg-primary border-b border-primary-foreground/10 relative">
          <BrandLogo
            textClass="text-primary-foreground text-xl font-bold truncate"
            imageClass="h-10 w-10 shrink-0"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="absolute end-4 top-1/2 -translate-y-1/2 p-2 hover:bg-primary-foreground/10 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pt-6 pb-4 scrollbar-hide px-2">
          {navItems.map((item) => {
            const isActive = item.href === "/" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={[
                  "group flex items-center py-3 text-sm font-bold rounded-2xl transition-all duration-200",
                  isCollapsed ? "justify-center px-0" : "gap-3 px-4",
                  isActive
                    ? "bg-slate-50 dark:bg-slate-950 text-primary shadow-sm"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                ].join(" ")}
              >
                <item.icon
                  className={[
                    "h-5 w-5 transition-transform duration-200 shrink-0",
                    isActive ? "scale-110" : "group-hover:scale-110",
                  ].join(" ")}
                />
                {!isCollapsed && (
                  <span className="truncate leading-snug">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign-out footer */}
        <div className="mt-auto p-3 border-t border-primary-foreground/10 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setShowSignOutConfirm(true)}
            className={[
              "w-full rounded-2xl text-primary-foreground/80 hover:text-white hover:bg-destructive font-bold transition-all",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-4",
            ].join(" ")}
            title={isCollapsed ? t.layout.signOut : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0 rtl:rotate-180" />
            {!isCollapsed && <span className="truncate">{t.layout.signOut}</span>}
          </Button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      {/*
        Tailwind logical properties:
          ps-* = padding-inline-start  → left in LTR, right in RTL
        So `lg:ps-64` gives left padding on LTR and right padding on RTL.
        When collapsed, `lg:ps-[4.5rem]`.
        No need for extra rtl: overrides — logical properties handle it.
      */}
      <main
        className={[
          "flex-1 flex flex-col pt-16 transition-all duration-300 relative z-10 min-h-screen",
          isCollapsed ? "lg:ps-[4.5rem]" : "lg:ps-64",
        ].join(" ")}
      >
        <div className="p-4 md:p-6 lg:p-8 flex-1 min-w-0">
          {children}
        </div>
        <div className="mt-auto w-full">
          <SiteFooter />
        </div>
      </main>

      {/* Sign-out confirm dialog */}
      <ConfirmDialog
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title={t.actions?.confirmSignOut || "Are you sure you want to sign out?"}
        description={dir === "rtl" ? "ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى لوحة التحكم." : "You will need to sign in again to access your dashboard."}
        confirmText={t.actions?.signOut || "Sign Out"}
        cancelText={t.actions?.cancel || "Cancel"}
      />

      {!isAdmin && <FeedbackModal />}
    </div>
  );
}
