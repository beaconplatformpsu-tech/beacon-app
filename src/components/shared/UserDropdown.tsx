"use client";

import Link from "next/link";
import { User as UserIcon, LogOut, ChevronDown, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/i18n/LanguageProvider";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface UserDropdownProps {
  buttonClassName?: string;
  textClassName?: string;
  iconClassName?: string;
  bellClassName?: string;
}

export function UserDropdown({ buttonClassName, textClassName, iconClassName, bellClassName }: UserDropdownProps) {
  const { currentUser: session, logout } = useAuth();
  const t = useT();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      setShowSignOutConfirm(false);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  if (!session) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <button className={bellClassName || "h-9 w-9 flex items-center justify-center rounded-full border border-primary-foreground/10 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20"}>
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={buttonClassName || "flex items-center gap-2 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 pl-1 pr-3 py-1 hover:bg-primary-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 rtl:pl-3 rtl:pr-1"}>
              <Avatar className="h-7 w-7 border border-primary-foreground/20">
                <AvatarImage src={session.photoURL || ""} alt={session.displayName || "User Avatar"} />
                <AvatarFallback className="bg-primary/80 text-primary-foreground text-xs font-semibold">
                  {session.displayName ? session.displayName.charAt(0).toUpperCase() : <UserIcon className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
              <span className={textClassName || "text-sm font-medium text-primary-foreground max-w-[120px] truncate hidden sm:inline-block"}>
                {session.displayName || t.nav.profile}
              </span>
              <ChevronDown className={iconClassName || "h-4 w-4 text-primary-foreground/60 shrink-0"} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile" className="flex items-center gap-2 w-full">
                <UserIcon className="h-4 w-4" />
                {t.nav.profile}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={() => setShowSignOutConfirm(true)}
            >
              <LogOut className="h-4 w-4 rtl:rotate-180" />
              {t.layout?.signOut || "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title={t.actions?.confirmSignOut || "Are you sure you want to sign out?"}
        description={(t.actions as any)?.signOutDesc || "You will be redirected to the login page."}
        confirmText={t.layout?.signOut || "Sign Out"}
        cancelText={t.actions?.cancel || "Cancel"}
        variant="destructive"
      />
    </>
  );
}
