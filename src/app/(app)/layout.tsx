"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, CheckSquare, BookOpen, GraduationCap, HeartHandshake, LockKeyhole, User as UserIcon, LogOut, Settings, MessageSquare, Home, Menu, X } from "lucide-react";
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
    { label: t.nav.manageUsers, href: "/admin/users", icon: UserIcon },
    { label: t.nav.contentResources, href: "/admin/content", icon: BookOpen },
    { label: t.nav.viewFeedback, href: "/admin/messages", icon: MessageSquare },
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
      {/* Gamified Aurora Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px] animate-pulse duration-10000" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-emerald-500/15 blur-[100px] animate-pulse duration-10000" style={{ animationDelay: '4s' }} />
      </div>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-4 start-4 z-50 w-64 rounded-3xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-[120%] rtl:translate-x-[120%]"}`}>
        <div className="flex h-16 items-center border-b border-border/50 px-6 mt-2">
          <BrandLogo textClass="text-foreground text-2xl md:text-3xl font-bold" imageClass="h-12 w-12 md:h-14 md:w-14" />
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto p-4 h-[calc(100vh-10rem)] scrollbar-hide">
          {navItems.map((item) => {
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-glow shadow-primary/30" 
                    : "text-muted-foreground hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-foreground shadow-sm hover:shadow-md"
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110 group-hover:text-primary"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 border-t border-border/50 pt-4">
          <Button variant="ghost" onClick={() => setShowSignOutConfirm(true)} className="w-full justify-start gap-3 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold hover:scale-[1.02] transition-all">
            <LogOut className="h-5 w-5 rtl:rotate-180" />
            {t.layout.signOut}
          </Button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:pl-72 rtl:lg:pl-0 rtl:lg:pr-72 relative z-10">
        {/* Global Floating Header */}
        <div className="p-4 md:p-6 lg:p-8 pb-0">
          <header className="sticky top-4 z-40 flex h-16 items-center justify-between lg:justify-end rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 px-4 md:px-6 shadow-lg shadow-black/5 transition-all">
            <div className="flex items-center gap-2 sm:gap-3 lg:hidden flex-1 min-w-0">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 rtl:-mr-1 sm:rtl:-mr-2 rtl:ml-0 hover:bg-primary/10 text-primary rounded-xl transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <BrandLogo textClass="text-foreground text-xl sm:text-2xl font-bold truncate" imageClass="h-12 w-12 sm:h-14 sm:w-14 shrink-0" />
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0">
              <NotificationsDropdown />
              <UserDropdown 
                buttonClassName="flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/10 bg-primary/5 pl-1 pr-2 sm:pr-3 py-1 hover:bg-primary/10 hover:shadow-md hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 rtl:pl-2 sm:rtl:pl-3 rtl:pr-1 cursor-pointer"
                textClassName="text-sm font-bold text-foreground max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline-block"
                iconClassName="h-4 w-4 text-primary shrink-0"
              />
              <LanguageToggle className="hidden md:flex hover:scale-110 transition-all border-primary/10 bg-primary/5 text-primary hover:bg-primary/10" />
            </div>
          </header>
        </div>

        <div className="p-4 md:p-6 lg:p-8 flex-1">
          {children}
        </div>
        <div className="mt-auto px-4 md:px-6 lg:px-8 pb-4">
          <SiteFooter />
        </div>
      </main>

      <ConfirmDialog
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title={t.actions?.confirmSignOut || "Are you sure you want to sign out?"}
        description={t.actions?.warning || "You will need to sign in again to access your dashboard."}
        confirmText={t.actions?.signOut || "Sign Out"}
        cancelText={t.actions?.cancel || "Cancel"}
      />
      {!isAdmin && <FeedbackModal />}
    </div>
  );
}
