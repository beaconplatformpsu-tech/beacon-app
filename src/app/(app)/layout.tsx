"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, CheckSquare, BookOpen, GraduationCap, HeartHandshake, LockKeyhole, User as UserIcon, LogOut, Settings, MessageSquare, Home, Menu, X, Newspaper, CalendarDays, Mountain, Handshake, Image as ImageIcon, Images, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT, useLanguage } from "@/i18n/LanguageProvider";
import logo from "@/assets/beacon-logo.jpg";
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

  // ── Auth gate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    // Not logged in → go to login
    if (!session) {
      toast.warning(t.layout.authRequired, t.layout.pleaseLogin);
      router.push("/auth/login");
      return;
    }

    // Logged in but email not verified → go to verify page
    if (!isEmailVerified) {
      router.push("/auth/verify-email");
      return;
    }
  }, [session, loading, isEmailVerified, router, toast, t.layout]);

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

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50 dark:bg-slate-950" />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-primary px-4 md:px-6 shadow-md transition-all">
        {/* Left Side: Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 sm:p-2 -ml-1 rtl:ml-0 rtl:-mr-1 hover:bg-primary-foreground/10 text-primary-foreground rounded-xl transition-all active:scale-95 shrink-0"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="hidden lg:flex items-center">
            <BrandLogo textClass="text-primary-foreground text-xl md:text-2xl font-bold truncate" imageClass="h-10 w-10 md:h-12 md:w-12 shrink-0" />
          </div>
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center">
            <BrandLogo textClass="text-primary-foreground text-lg font-bold truncate" imageClass="h-10 w-10 shrink-0" />
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0 text-primary-foreground">
          <div className="[&_button]:text-primary-foreground [&_button]:hover:bg-primary-foreground/10 [&_svg]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70">
            <NotificationsDropdown />
          </div>
          <UserDropdown 
            buttonClassName="flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 pl-1 pr-2 sm:pr-3 py-1 hover:bg-primary-foreground/20 hover:shadow-md transition-all focus:outline-none rtl:pl-2 sm:rtl:pl-3 rtl:pr-1 cursor-pointer"
            textClassName="text-sm font-bold text-primary-foreground max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline-block"
            iconClassName="h-4 w-4 text-primary-foreground shrink-0"
          />
          <LanguageToggle className="hidden md:flex text-primary-foreground border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20" />
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 start-0 z-50 lg:z-30 ${isCollapsed ? 'w-20' : 'w-64'} bg-primary text-primary-foreground shadow-2xl lg:shadow-none transition-all duration-300 ease-out pt-0 lg:pt-16 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:translate-x-0"}`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -end-3 top-20 bg-background text-foreground rounded-full p-1 border shadow-sm z-50 hover:bg-accent transition-transform"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 rtl:rotate-180" /> : <ChevronLeft className="w-4 h-4 rtl:rotate-180" />}
        </button>
        <div className="lg:hidden flex h-16 items-center px-4 shrink-0 bg-primary border-b border-primary-foreground/10 relative">
          <BrandLogo textClass="text-primary-foreground text-xl font-bold truncate" imageClass="h-10 w-10 shrink-0" />
          <button 
            onClick={() => setSidebarOpen(false)}
            className="absolute end-4 top-1/2 -translate-y-1/2 p-2 hover:bg-primary-foreground/10 rounded-xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pt-6 scrollbar-hide">
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
                className={`group flex items-center ${isCollapsed ? 'justify-center mx-2 px-0' : 'gap-3 ms-4 px-4'} py-3 text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? `bg-slate-50 dark:bg-slate-950 text-primary ${isCollapsed ? 'rounded-2xl' : 'rounded-s-2xl rounded-e-none'} shadow-sm` 
                    : `text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground ${isCollapsed ? 'rounded-2xl' : 'rounded-s-2xl rounded-e-none'}`
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform duration-300 shrink-0 relative z-10 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                {!isCollapsed && <span className="relative z-10 truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-primary-foreground/10 shrink-0">
          <Button variant="ghost" onClick={() => setShowSignOutConfirm(true)} className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3 px-4'} rounded-2xl text-primary-foreground/80 hover:text-white hover:bg-destructive font-bold transition-all`}>
            <LogOut className="h-5 w-5 shrink-0 rtl:rotate-180" />
            {!isCollapsed && <span className="truncate">{t.layout.signOut}</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col pt-16 ${isCollapsed ? 'lg:ps-20 rtl:lg:ps-0 rtl:lg:pe-20' : 'lg:ps-64 rtl:lg:ps-0 rtl:lg:pe-64'} transition-all duration-300 relative z-10 min-h-screen`}>
        <div className="p-4 md:p-6 lg:p-8 flex-1">
          {children}
        </div>
        <div className="mt-auto w-full">
          <SiteFooter />
        </div>
      </main>
      <ConfirmDialog
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title={t.actions?.confirmSignOut || "Are you sure you want to sign out?"}
        description="You will need to sign in again to access your dashboard."
        confirmText={t.actions?.signOut || "Sign Out"}
        cancelText={t.actions?.cancel || "Cancel"}
      />
      {!isAdmin && <FeedbackModal />}
    </div>
  );
}
