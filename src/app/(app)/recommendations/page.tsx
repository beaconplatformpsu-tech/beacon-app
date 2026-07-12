"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Sparkles, ArrowRight, Target, BrainCircuit, BookMarked, Lightbulb, AlertTriangle, RefreshCw, Trash2, Clock, Plus } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { ref, get, push, set, onValue, remove, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase/config";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT } from "@/i18n/LanguageProvider";
import type { UserSkill, Task } from "@/lib/types";

type Recommendation = {
  id?: string;
  title: string;
  description: string;
  type: "Skill" | "Career" | "Academic" | "Productivity";
  actionLink: string;
  actionText: string;
  createdAt?: number;
};

const getIconForType = (type: string) => {
  switch (type) {
    case "Skill": return <BrainCircuit className="h-5 w-5 text-indigo-500" />;
    case "Career": return <Target className="h-5 w-5 text-emerald-500" />;
    case "Productivity": return <Sparkles className="h-5 w-5 text-amber-500" />;
    default: return <BookMarked className="h-5 w-5 text-blue-500" />;
  }
};

export default function RecommendationsPage() {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const t = useT();
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch Saved Recommendations from Firebase
  useEffect(() => {
    if (!session?.uid) return;
    
    const recsRef = ref(db, `user_private/${session.uid}/recommendations`);
    const unsubscribe = onValue(recsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const recList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a: Recommendation, b: Recommendation) => (b.createdAt || 0) - (a.createdAt || 0));
        setRecommendations(recList);
      } else {
        setRecommendations([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [session?.uid]);

  // 2. Generate New AI Recommendations & Save to DB
  const generateNewRecommendations = useCallback(async () => {
    if (!session?.uid) return;
    setGenerating(true);
    setError("");
    
    try {

      // Fetch user context
      const userSnap = await get(ref(db, `users/${session.uid}`));
      const userData = userSnap.val() || {};
      const preferredCareerPathId = userData.preferredCareerPathId;

      if (!preferredCareerPathId) {
        throw new Error("Please set a career goal in your profile first to get tailored recommendations.");
      }

      // Safe local fallback: Query learning paths and projects matching the user's career path
      const pathsSnap = await get(ref(db, `indexes/learning_paths_by_career_path/${preferredCareerPathId}`));
      const projectsSnap = await get(ref(db, `indexes/projects_by_career_path/${preferredCareerPathId}`));
      
      const newRecs: Recommendation[] = [];

      if (pathsSnap.exists()) {
        const pathIds = Object.keys(pathsSnap.val()).slice(0, 2);
        for (const pid of pathIds) {
          const pDataSnap = await get(ref(db, `public_content/learning_paths/${pid}`));
          if (pDataSnap.exists()) {
            const pathData = pDataSnap.val();
            newRecs.push({
              title: `Complete: ${pathData.title}`,
              description: `Recommended learning path to build your core skills. ${pathData.description}`,
              type: "Academic",
              actionLink: `/learning-paths/${pid}`,
              actionText: "View Path"
            });
          }
        }
      }

      if (projectsSnap.exists()) {
        const projIds = Object.keys(projectsSnap.val()).slice(0, 2);
        for (const pid of projIds) {
          const pDataSnap = await get(ref(db, `public_content/projects/${pid}`));
          if (pDataSnap.exists()) {
            const projectData = pDataSnap.val();
            newRecs.push({
              title: `Project: ${projectData.title}`,
              description: `Build a portfolio project to demonstrate your skills. ${projectData.description}`,
              type: "Career",
              actionLink: `/projects/${pid}`,
              actionText: "View Project"
            });
          }
        }
      }

      if (newRecs.length === 0) {
        newRecs.push({
          title: "Explore the Resource Library",
          description: "Browse the resource library to find documentation and courses to boost your skills.",
          type: "Productivity",
          actionLink: "/resources",
          actionText: "Browse Library"
        });
      }
      
      // Save to Firebase
      const recsRef = ref(db, `user_private/${session.uid}/recommendations`);
      for (const rec of newRecs) {
        const newRef = push(recsRef);
        await set(newRef, {
          ...rec,
          createdAt: serverTimestamp()
        });
      }
      
      toast.success(t.recommendations.success, t.recommendations.generatedSuccess);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || t.recommendations.failedGenerate);
      toast.error(t.recommendations.error, t.recommendations.couldNotGenerate);
    } finally {
      setGenerating(false);
    }
  }, [session?.uid, toast, t.recommendations]);

  const deleteRecommendation = async (id: string) => {
    if (!session?.uid) return;
    try {
      await remove(ref(db, `user_private/${session.uid}/recommendations/${id}`));
      toast.success(t.recommendations.removed, t.recommendations.dismissed);
    } catch (e) {
      console.error(e);
      toast.error(t.recommendations.error, t.recommendations.failedDelete);
    }
  };

  const createTaskFromRecommendation = async (rec: Recommendation) => {
    if (!session?.uid) return;
    try {
      const newTask = {
        title: rec.title,
        description: rec.description,
        status: "Pending",
        priority: "Medium",
        progress: 0,
        estimatedHours: 2,
        courseName: "Career Prep",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      await push(ref(db, `user_private/${session.uid}/tasks`), newTask);
      toast.success(t.recommendations.taskCreated, t.recommendations.taskAdded);
      // Auto-dismiss the recommendation
      if (rec.id) {
        await remove(ref(db, `user_private/${session.uid}/recommendations/${rec.id}`));
      }
    } catch (e) {
      console.error(e);
      toast.error(t.recommendations.error, t.recommendations.failedTask);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            {t.recommendations.title}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            {t.recommendations.subtitle}
          </p>
        </div>
        <Button variant="default" onClick={generateNewRecommendations} disabled={generating || loading} className="gap-2 shadow-glow">
          <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? t.recommendations.generating : t.recommendations.generateInsights}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t.recommendations.error}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {[1,2,3].map(i => (
             <Card key={i} className="animate-pulse border-border shadow-sm">
               <CardHeader className="space-y-2"><div className="h-5 bg-muted rounded w-1/3"></div><div className="h-4 bg-muted rounded w-3/4"></div></CardHeader>
               <CardContent><div className="h-20 bg-muted rounded w-full"></div></CardContent>
             </Card>
           ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="flex flex-col border-border shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 group bg-card/50 backdrop-blur-sm overflow-hidden relative">
              {/* Subtle gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 opacity-70"></div>
              
              <CardHeader className="pb-4 relative z-10 pt-6">
                <Button 
                  aria-label="Delete recommendation"
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteRecommendation(rec.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-background rounded-2xl shadow-sm ring-1 ring-border group-hover:ring-primary/30 transition-all">
                    {getIconForType(rec.type)}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold leading-tight">
                      {rec.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        {rec.type}
                      </Badge>
                      {rec.createdAt && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" />
                          {new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 relative z-10">
                <CardDescription className="text-[15px] text-foreground/80 leading-relaxed font-medium">
                  {rec.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-2 pb-6 relative z-10 flex gap-3">
                <Button 
                  aria-label={t.recommendations.addAsTask}
                  variant="outline" 
                  className="w-10 px-0 shrink-0 bg-background/50 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                  onClick={() => createTaskFromRecommendation(rec)}
                  title={t.recommendations.addAsTask}
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Link href={rec.actionLink || "/dashboard"} className="flex-1">
                  <Button className="w-full justify-between group/btn bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all">
                    <span className="font-semibold">{rec.actionText}</span>
                    <ArrowRight className="h-4 w-4 opacity-80 group-hover/btn:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !error && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/50 flex flex-col items-center justify-center">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium text-foreground">{t.recommendations.noRecommendations}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto mb-6">
            {t.recommendations.clickToGenerate}
          </p>
          <Button onClick={generateNewRecommendations} disabled={generating} className="gap-2">
            <Sparkles className="h-4 w-4" /> {t.recommendations.getFirstInsights}
          </Button>
        </div>
      )}
    </div>
  );
}
