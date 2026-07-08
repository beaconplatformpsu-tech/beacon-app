"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, CheckSquare, BookOpen, GraduationCap, HeartHandshake, LockKeyhole, User as UserIcon, LogOut, Settings, MessageSquare, Home, Menu, X } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT, useLanguage } from "@/i18n/LanguageProvider";
import logo from "@/assets/beacon-logo.jpg";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/shared/FeedbackModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LanguageToggle } from "@/components/shared/LanguageToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, role, loading } = useCurrentUserRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const toast = useCustomToast();
  const t = useT();
  useEffect(() => {
    if (!loading && !session) {
      toast.warning(t.layout.authRequired, t.layout.pleaseLogin);
      router.push("/auth");
    }
  }, [session, loading, router, toast]);
  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success(t.actions?.signOut || "Signed out successfully", "See you next time!");
    router.push("/");
  };

  const navItems = role === "admin" ? [
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
    <div className="flex min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Link href="/" className="flex h-16 items-center gap-3 border-b border-primary-foreground/10 bg-primary text-primary-foreground px-6 hover:bg-primary/90 transition-colors">
          <Image src={logo} alt="Beacon" className="h-8 w-8 rounded-md ring-1 ring-primary-foreground/20" />
          <span className="font-display text-xl tracking-wide">Beacon</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 h-[calc(100vh-8rem)]">
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-glow" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-border p-4">
          <Button variant="ghost" onClick={() => setShowSignOutConfirm(true)} className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            {t.layout.signOut}
          </Button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        {/* Global Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between lg:justify-end bg-primary text-primary-foreground px-4 md:px-8 shadow-md">
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-md transition-colors"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Image src={logo} alt="Beacon" className="h-8 w-8 rounded-md ring-1 ring-primary-foreground/20" />
              <span className="font-sans font-bold text-lg tracking-widest hidden sm:inline-block">Beacon</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/profile" className="h-9 w-9 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 overflow-hidden flex items-center justify-center hover:ring-2 ring-white/50 transition-all">
              {session?.photoURL ? (
                <Image src={session.photoURL} alt="Profile" width={36} height={36} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-4 w-4 text-primary-foreground/80" />
              )}
            </Link>
            <LanguageToggle />
          </div>
        </header>

        <div className="p-6 md:p-8">
          {children}
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
      {role !== "admin" && <FeedbackModal />}
    </div>
  );
}
