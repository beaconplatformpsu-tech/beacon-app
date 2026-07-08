"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { Database, AlertTriangle, ShieldCheck, Copy } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminSeedMonitorPage() {
  const { role, loading: roleLoading } = useCurrentUserRole();
  const t = useT();
  const [stats, setStats] = useState({
    lastSeededAt: "Unknown",
    resourcesCount: 0,
    skillsCount: 0,
    careerPathsCount: 0,
    status: "Checking..."
  });



  useEffect(() => {
    async function fetchStats() {
      try {
        const [metaSnap, resourcesSnap, skillsSnap, pathsSnap] = await Promise.all([
          get(ref(db, "seed_meta/lastOrchestratorRunAt")),
          get(ref(db, "resources")),
          get(ref(db, "skills")),
          get(ref(db, "career_paths"))
        ]);

        setStats({
          lastSeededAt: metaSnap.exists() ? new Date(metaSnap.val()).toLocaleString() : "Never",
          resourcesCount: resourcesSnap.exists() ? Object.keys(resourcesSnap.val()).length : 0,
          skillsCount: skillsSnap.exists() ? Object.keys(skillsSnap.val()).length : 0,
          careerPathsCount: pathsSnap.exists() ? Object.keys(pathsSnap.val()).length : 0,
          status: metaSnap.exists() ? "Healthy" : "Needs Seeding"
        });
      } catch (error) {
        setStats(s => ({ ...s, status: "Error connecting to DB" }));
      }
    }

    if (role === "admin") {
      fetchStats();
    }
  }, [role]);

  if (roleLoading) return <div className="p-8 text-center animate-pulse">Checking Permissions...</div>;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    alert(`Copied: ${cmd}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <Database className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Database Seeding Monitor</h1>
          <p className="text-muted-foreground">Client-side writes disabled for security. Use local CLI tools.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Live Seed Status
            </CardTitle>
            <CardDescription>Realtime counts from Firebase Database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Overall Status</span>
              <span className={`font-semibold ${stats.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>{stats.status}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Last Seeded</span>
              <span className="font-mono text-sm">{stats.lastSeededAt}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Resources Seeded</span>
              <span className="font-mono">{stats.resourcesCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Skills Seeded</span>
              <span className="font-mono">{stats.skillsCount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Career Paths Seeded</span>
              <span className="font-mono">{stats.careerPathsCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              How to Seed Data
            </CardTitle>
            <CardDescription>Run these commands locally in your terminal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              For security, massive multi-node AI enrichment and bulk database seeding is now entirely isolated to your local environment. 
              <strong> Never expose your Service Account in the browser!</strong>
            </p>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">1. Preview Payload in Memory</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-background p-2 rounded text-sm border font-mono">npm run seed:dry</code>
                <Button variant="outline" size="icon" onClick={() => copyCommand('npm run seed:dry')}><Copy className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">2. Write to Firebase</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-background p-2 rounded text-sm border font-mono text-destructive">npm run seed:write</code>
                <Button variant="outline" size="icon" onClick={() => copyCommand('npm run seed:write')}><Copy className="w-4 h-4" /></Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">3. Verify Integrity</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-background p-2 rounded text-sm border font-mono">npm run seed:verify</code>
                <Button variant="outline" size="icon" onClick={() => copyCommand('npm run seed:verify')}><Copy className="w-4 h-4" /></Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
