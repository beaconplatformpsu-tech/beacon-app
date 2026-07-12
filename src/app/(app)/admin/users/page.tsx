"use client";

import { useState, useEffect, useMemo } from "react";
import { Shield, ShieldOff, Search, MoreVertical, Ban, CheckCircle2, Loader2, Mail, GraduationCap } from "lucide-react";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { adminService } from "@/features/admin/services/adminService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/i18n/LanguageProvider";

type UserData = {
  uid: string;
  email: string;
  displayName: string;
  role: "student" | "admin";
  createdAt: string;
  major?: string;
  accountStatus?: "active" | "suspended";
};

// Helper to generate a consistent gradient avatar based on the user's name
const getAvatarGradient = (name: string) => {
  const hash = Array.from(name).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 40%))`;
};

const getInitials = (name: string, fallback: string) => {
  if (!name || name === fallback) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function AdminUsersPage() {
  const { session } = useCurrentUserRole();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useCustomToast();
  const t = useT();

  useEffect(() => {
    const usersRef = ref(db, "users");
    const metaRef = ref(db, "user_admin_meta");
    let usersData: any = null;
    let metaData: any = null;

    const processUsers = () => {
      if (usersData && metaData) {
        const usersList = Object.keys(usersData).map(key => {
          const profile = usersData[key] || {};
          const meta = metaData[key] || {};
          return {
            uid: key,
            ...profile,
            ...meta
          };
        }) as UserData[];
        
        // Sort admins first, then newest
        usersList.sort((a, b) => {
          if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        
        setUsers(usersList);
        setLoading(false);
      } else if (usersData !== null && metaData !== null && (Object.keys(usersData).length === 0 || Object.keys(metaData).length === 0)) {
        setUsers([]);
        setLoading(false);
      }
    };

    const unsubUsers = onValue(usersRef, (snapshot) => {
      usersData = snapshot.val() || {};
      processUsers();
    }, (error) => {
      console.error("Error fetching users:", error);
      toast.error("Failed to load user data");
      setLoading(false);
    });

    const unsubMeta = onValue(metaRef, (snapshot) => {
      metaData = snapshot.val() || {};
      processUsers();
    });

    return () => {
      unsubUsers();
      unsubMeta();
    };
  }, [toast]);

  const toggleUserRole = async (user: UserData) => {
    if (!session?.uid) return;
    const newRole = user.role === "admin" ? "student" : "admin";
    try {
      // TODO: Super Admin role elevations require Firebase Admin SDK / Cloud Function to set custom claims securely.
      // Currently, this updates `user_admin_meta` which is sufficient for UI but not fully secure against custom client modifications without custom claims.
      await adminService.updateUserRole(session.uid, user.uid, newRole);
      toast.success(t.adminUsers.roleUpdated, `${user.displayName || user.email} ${t.adminUsers.nowRole} ${newRole}.`);
    } catch (err) {
      toast.error(t.adminUsers.updateFailed, t.adminUsers.couldNotChangeRole);
    }
  };

  const toggleAccountStatus = async (user: UserData) => {
    if (!session?.uid) return;
    const newStatus = user.accountStatus === "suspended" ? "active" : "suspended";
    try {
      await adminService.updateAccountStatus(session.uid, user.uid, newStatus);
      toast.info(t.adminUsers.statusUpdated, t.adminUsers.accountNowStatus.replace("{email}", user.email).replace("{status}", newStatus));
    } catch (err) {
      toast.error(t.adminUsers.updateFailed, t.adminUsers.couldNotChangeStatus);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.displayName || "").toLowerCase().includes(search.toLowerCase()) || 
      (u.email || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card border border-border/60 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">{t.adminUsers.title}</h1>
          <p className="text-muted-foreground mt-1">{t.adminUsers.subtitle.replace("{count}", users.length.toString())}</p>
        </div>
        
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            aria-label={t.adminUsers.searchPlaceholder}
            className="pl-10 h-12 bg-background border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-xl shadow-inner transition-all text-base" 
            placeholder={t.adminUsers.searchPlaceholder} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">{t.adminUsers.loading}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border/80 rounded-3xl bg-card/30">
              <ShieldOff className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-medium text-foreground">{t.adminUsers.noUsers}</h3>
              <p className="text-muted-foreground mt-2">{t.adminUsers.adjustSearch}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.map((user) => {
                const name = user.displayName || t.adminUsers.unknownName;
                const isSuspended = user.accountStatus === "suspended";
                const isAdmin = user.role === "admin";

                return (
                  <div 
                    key={user.uid} 
                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                      isSuspended ? "bg-red-500/5 border-red-500/20" : "bg-card border-border/60 hover:border-primary/30"
                    }`}
                  >
                    {/* Left side: Avatar + Identity */}
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div 
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner text-white font-bold text-lg"
                          style={{ background: getAvatarGradient(name) }}
                        >
                          {getInitials(name, t.adminUsers.unknownName)}
                        </div>
                        {isAdmin && (
                          <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-0.5 shadow-sm">
                            <div className="bg-primary text-primary-foreground rounded-full p-1 border border-primary/20">
                              <Shield className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className={`font-semibold text-lg tracking-tight ${isSuspended ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                          <span className="hidden sm:inline text-border">•</span>
                          <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> {user.major || t.adminUsers.noMajor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Status Badges + Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border/50">
                      
                      <div className="flex gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          isAdmin 
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-muted text-muted-foreground border-border"
                        }`}>
                          {isAdmin ? t.adminUsers.administrator : t.adminUsers.student}
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                          isSuspended 
                            ? "bg-red-500/10 text-red-600 border-red-500/20" 
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}>
                          {isSuspended ? <Ban className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                          {isSuspended ? t.adminUsers.suspended : t.adminUsers.active}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-label="User actions" variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted text-muted-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                          <DropdownMenuLabel className="font-semibold">{t.adminUsers.userActions}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => toggleUserRole(user)} className="cursor-pointer py-2.5">
                            {isAdmin ? <ShieldOff className="mr-3 h-4 w-4 text-amber-500" /> : <Shield className="mr-3 h-4 w-4 text-primary" />}
                            <span className="font-medium">{isAdmin ? t.adminUsers.revokeAdmin : t.adminUsers.makeAdmin}</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => toggleAccountStatus(user)} className={`cursor-pointer py-2.5 ${isSuspended ? "focus:bg-emerald-500/10" : "focus:bg-red-500/10"}`}>
                            {isSuspended ? <CheckCircle2 className="mr-3 h-4 w-4 text-emerald-600" /> : <Ban className="mr-3 h-4 w-4 text-red-600" />}
                            <span className={`font-medium ${isSuspended ? "text-emerald-600" : "text-red-600"}`}>
                              {isSuspended ? t.adminUsers.reactivate : t.adminUsers.suspend}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
