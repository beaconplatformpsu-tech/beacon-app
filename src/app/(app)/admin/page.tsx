"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, FileText, Database, ShieldCheck, MessageSquare, Activity, ChevronRight, Server, Cloud } from "lucide-react";
import { ref, get, query, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersSnap, resSnap, msgSnap] = await Promise.all([
          get(query(ref(db, "users"), limitToLast(100))),
          get(query(ref(db, "public_content/resources"), limitToLast(100))),
          get(query(ref(db, "support_messages"), limitToLast(100)))
        ]);

        setUsersCount(usersSnap.exists() ? Object.keys(usersSnap.val()).length : 0);
        setResourcesCount(resSnap.exists() ? Object.keys(resSnap.val()).length : 0);
        setMessagesCount(msgSnap.exists() ? Object.keys(msgSnap.val()).length : 0);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { label: t.admin.totalUsers, value: loading ? "-" : usersCount, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/20", gradient: "from-blue-500/10 to-transparent" },
    { label: t.admin.activeResources, value: loading ? "-" : resourcesCount, icon: Database, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20", gradient: "from-emerald-500/10 to-transparent" },
    { label: t.admin.userFeedback, value: loading ? "-" : messagesCount, icon: FileText, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/20", gradient: "from-amber-500/10 to-transparent" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">{t.admin.overviewTitle}</h1>
          <p className="mt-2 text-muted-foreground text-lg">{t.admin.overviewSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          {t.admin.systemOnline}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, idx) => (
          <div key={idx} className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-${stat.color.split('-')[1]}-500/30`}>
            {/* Subtle Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                  {typeof stat.value === 'number' && stat.value >= 100 && (
                    <span className="ml-2 text-[10px] font-normal lowercase tracking-normal text-muted-foreground opacity-70 bg-muted px-1.5 py-0.5 rounded-full">
                      limited for perf
                    </span>
                  )}
                </p>
                {loading ? (
                  <div className="h-10 w-16 bg-muted rounded animate-pulse mt-2"></div>
                ) : (
                  <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">
                    {stat.value}{typeof stat.value === 'number' && stat.value >= 100 ? "+" : ""}
                  </p>
                )}
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                <stat.icon className="h-7 w-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* System Health */}
        <div className="md:col-span-5 rounded-3xl border border-border/60 bg-card p-7 shadow-sm transition-all hover:shadow-md">
          <h2 className="font-display font-semibold text-2xl flex items-center gap-3 mb-6">
            <Activity className="h-6 w-6 text-primary" /> {t.admin.systemHealth}
          </h2>
          <div className="space-y-5">
            {[
              { name: t.admin.firebaseAuth, icon: ShieldCheck, status: t.admin.operational, color: "emerald" },
              { name: t.admin.realtimeDb, icon: Database, status: t.admin.operational, color: "emerald" },
              { name: t.admin.cloudStorage, icon: Cloud, status: t.admin.operational, color: "emerald" },
              { name: t.admin.apiServers, icon: Server, status: t.admin.operational, color: "emerald" },
            ].map((item, i) => (
              <div key={i} className="group flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground transition-colors shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold text-${item.color}-600 bg-${item.color}-500/10 px-3 py-1 rounded-full border border-${item.color}-500/20`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-7 rounded-3xl border border-border/60 bg-card p-7 shadow-sm transition-all hover:shadow-md">
          <h2 className="font-display font-semibold text-2xl mb-6">{t.admin.quickActions}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/users" className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-md">
                  <Users className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t.admin.manageUsers}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.admin.manageUsersDesc}</p>
              </div>
            </Link>
            
            <Link href="/admin/content" className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-emerald-500/5 to-transparent p-6 hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md">
                  <Database className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t.admin.manageContent}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.admin.manageContentDesc}</p>
              </div>
            </Link>

            <Link href="/admin/messages" className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-amber-500/5 to-transparent p-6 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300 sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t.admin.supportMessages}</h3>
                    <p className="text-sm text-muted-foreground">{t.admin.supportMessagesDesc}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
