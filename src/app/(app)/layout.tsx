"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, CheckSquare, BookOpen, GraduationCap, HeartHandshake,
  LockKeyhole, LogOut, Settings, MessageSquare, Menu, X,
  Newspaper, Mountain, Users, ChevronLeft, ChevronRight,
  Sparkles, Calendar, Code2, FolderGit2, Map, FileSearch,
  BookMarked, FileText, LayoutTemplate, Bell, ChevronDown,
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
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase/config";

// ─── Type Definitions ────────────────────────────────────────────────────────
type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  exactMatch?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

// ─── NavLink ─────────────────────────────────────────────────────────────────
function NavLink({
  item,
  pathname,
  isCollapsed,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
  onClick?: () => void;
}) {
  const isActive = item.exactMatch
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      prefetch={true}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={[
        "group flex items-center py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
        isCollapsed ? "justify-center px-0 mx-1" : "gap-3 px-3",
        isActive
          ? "bg-slate-50 dark:bg-slate-950 text-primary shadow-sm"
          : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground",
      ].join(" ")}
    >
      <item.icon
        className={[
          "h-[18px] w-[18px] transition-transform duration-200 shrink-0",
          isActive ? "scale-110 text-primary" : "group-hover:scale-105",
          isActive && !isCollapsed ? "text-primary" : "",
        ].join(" ")}
      />
      {!isCollapsed && (
        <span className="truncate leading-snug">{item.label}</span>
      )}
    </Link>
  );
}

// ─── NavGroupSection ─────────────────────────────────────────────────────────
function NavGroupSection({
  group,
  pathname,
  isCollapsed,
  onNavClick,
}: {
  group: NavGroup;
  pathname: string;
  isCollapsed: boolean;
  onNavClick: () => void;
}) {
  return (
    <div className="space-y-0.5">
      {!isCollapsed && (
        <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/40 select-none">
          {group.label}
        </p>
      )}
      {isCollapsed && (
        <div className="mx-auto w-6 h-px bg-primary-foreground/20 my-3" />
      )}
      {group.items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          isCollapsed={isCollapsed}
          onClick={onNavClick}
        />
      ))}
    </div>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────
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

  // ── Profile-completion guard (students only) ───────────────────────────────
  useEffect(() => {
    if (loading || !session || !isEmailVerified) return;
    if (role === "admin") return;

    get(ref(db, `users/${session.uid}/profileCompleted`)).then((snap) => {
      const isCompleted = snap.exists() && snap.val() === true;
      if (!isCompleted && pathname !== "/complete-profile") {
        router.push("/complete-profile");
      } else if (isCompleted && pathname === "/complete-profile") {
        router.push("/dashboard");
      }
    }).catch(() => {
      // Cannot read — don't block the user
    });
  }, [session, loading, isEmailVerified, role, pathname, router]);

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

  const isAdmin = role === "admin";

  // ── Admin nav (flat list, no groups) ──────────────────────────────────────
  const adminNavItems: NavItem[] = [
    { label: t.nav.adminDashboard, href: "/admin", icon: LayoutDashboard, exactMatch: true },
    { label: t.nav.manageUsers, href: "/admin/users", icon: Users },
    { label: t.nav.adminTasks, href: "/admin/tasks", icon: CheckSquare },
    { label: t.nav.adminSkills, href: "/admin/skills", icon: BookOpen },
    { label: t.nav.adminCareer, href: "/admin/career", icon: GraduationCap },
    { label: t.nav.adminSupport, href: "/admin/support", icon: HeartHandshake },
    { label: t.nav.adminContent, href: "/admin/content", icon: Mountain },
    { label: t.nav.adminAnalytics, href: "/admin/analytics", icon: Newspaper },
    { label: t.nav.adminMessages, href: "/admin/messages", icon: MessageSquare },
    { label: t.nav.platformSettings, href: "/admin/settings", icon: Settings },
  ];

  // ── Student nav (grouped) ─────────────────────────────────────────────────
  const studentNavGroups: NavGroup[] = [
    {
      label: t.nav.groupOverview,
      items: [
        { label: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard, exactMatch: true },
        { label: t.nav.recommendations, href: "/recommendations", icon: Sparkles },
        { label: t.nav.notifications, href: "/notifications", icon: Bell },
      ],
    },
    {
      label: t.nav.groupAcademic,
      items: [
        { label: t.nav.academicTasks, href: "/tasks", icon: CheckSquare },
        { label: t.nav.planner, href: "/planner", icon: Calendar },
        { label: t.nav.practiceTasks, href: "/practice-tasks", icon: Code2 },
        { label: t.nav.projects, href: "/projects", icon: FolderGit2 },
      ],
    },
    {
      label: t.nav.groupSkills,
      items: [
        { label: t.nav.skillsCareers, href: "/skills", icon: BookOpen },
        { label: t.nav.learningPaths, href: "/learning-paths", icon: Map },
        { label: t.nav.resources, href: "/resources", icon: FileSearch },
      ],
    },
    {
      label: t.nav.groupCareer,
      items: [
        { label: t.nav.career, href: "/career", icon: GraduationCap },
      ],
    },
    {
      label: t.nav.groupTools,
      items: [
        { label: t.nav.privateNotes, href: "/notes", icon: LockKeyhole },
        { label: t.nav.bookmarks, href: "/bookmarks", icon: BookMarked },
        { label: t.nav.cvBuilder, href: "/cv-builder", icon: FileText },
        { label: t.nav.portfolio, href: "/portfolio", icon: LayoutTemplate },
        { label: t.nav.settings, href: "/settings", icon: Settings },
      ],
    },
    {
      label: t.nav.groupHelp,
      items: [
        { label: t.nav.support, href: "/support", icon: HeartHandshake },
      ],
    },
  ];

  // ── Sidebar width ─────────────────────────────────────────────────────────
  const sidebarW = isCollapsed ? "w-[4.5rem]" : "w-64";

  // Mobile slide direction: LTR → slide from left, RTL → slide from right
  const sidebarVisibility = sidebarOpen
    ? "translate-x-0"
    : dir === "rtl"
      ? "translate-x-full"
      : "-translate-x-full";

  // Collapse toggle icon
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

      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
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

          {/* Logo */}
          <div className="flex items-center min-w-0">
            <BrandLogo
              textClass="text-primary-foreground text-xl md:text-2xl font-bold truncate hidden lg:inline-block"
              imageClass="h-10 w-10 md:h-12 md:w-12 shrink-0"
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
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex absolute -end-5 top-24 bg-background text-foreground rounded-full p-1.5 border shadow-sm z-50 hover:bg-accent transition-colors"
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

        {/* Nav — scrollable */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-4 px-2 scrollbar-thin scrollbar-thumb-primary-foreground/20"
          aria-label="Student navigation"
        >
          {isAdmin ? (
            // Admin: flat list
            <div className="space-y-0.5 pt-2">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </div>
          ) : (
            // Student: grouped
            <div className="space-y-0">
              {studentNavGroups.map((group) => (
                <NavGroupSection
                  key={group.label}
                  group={group}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  onNavClick={() => setSidebarOpen(false)}
                />
              ))}
            </div>
          )}
        </nav>

        {/* Sign-out footer */}
        <div className="mt-auto p-3 border-t border-primary-foreground/10 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setShowSignOutConfirm(true)}
            className={[
              "w-full rounded-xl text-primary-foreground/75 hover:text-white hover:bg-destructive font-semibold transition-all",
              isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
            ].join(" ")}
            title={isCollapsed ? t.layout.signOut : undefined}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0 rtl:rotate-180" />
            {!isCollapsed && <span className="truncate">{t.layout.signOut}</span>}
          </Button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
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
