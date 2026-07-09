"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, Timer, Zap, CheckCircle2, Volume2, VolumeX, Play, Pause, RotateCcw, BookMarked, ExternalLink, Search, Filter } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT } from "@/i18n/LanguageProvider";


export default function SupportPage() {
  const toast = useCustomToast();
  const t = useT();
  
  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Academic Resources State
  const [academicResources, setAcademicResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const resourcesRef = ref(db, "public_content/resources");
    const unsubscribe = onValue(resourcesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allRes = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setAcademicResources(allRes.filter(r => r.academicCategoryIds && r.academicCategoryIds.length > 0));
      } else {
        setAcademicResources([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      if (soundEnabled) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.connect(ctx.destination);
          osc.frequency.value = 800;
          osc.start();
          setTimeout(() => osc.stop(), 500);
        } catch (e) {
          console.error("Audio playback failed");
        }
      }
      
      if (!isBreak) {
        toast.success(t.support.toastFocusComplete, t.support.toastFocusCompleteDesc);
        setTimeLeft(5 * 60);
        setIsBreak(true);
      } else {
        toast.info(t.support.toastBreakOver, t.support.toastBreakOverDesc);
        setTimeLeft(25 * 60);
        setIsBreak(false);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, soundEnabled, toast, t]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progressValue = isBreak 
    ? 100 - ((timeLeft / (5 * 60)) * 100) 
    : 100 - ((timeLeft / (25 * 60)) * 100);

  // Derived state for filtering
  const uniqueCategories = [t.support.all, ...Array.from(new Set(academicResources.map((r) => r.category || t.support.general).filter(Boolean)))];
  
  const filteredResources = academicResources.filter(res => {
    const matchesSearch = (res.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                          (res.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                          (res.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === t.support.all || res.category === selectedCategory || (!res.category && selectedCategory === t.support.general);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t.support.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.support.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pomodoro Timer */}
        <Card className="border-border bg-card shadow-glow overflow-hidden relative">
          <div className={`absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none ${isBreak ? 'from-emerald-500 to-sky-500' : 'from-primary to-rose-500'}`} />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" /> {t.support.focusTimer}
              </CardTitle>
              <Button aria-label="Toggle sound" variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className="h-8 w-8 text-muted-foreground">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
            <CardDescription>{isBreak ? t.support.restRecharge : t.support.deepWork}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-7xl font-display font-bold tracking-tighter mb-8 tabular-nums">
              {formatTime(timeLeft)}
            </div>
            
            <Progress value={progressValue} className="h-2 w-full max-w-xs mb-8" />
            
            <div className="flex gap-4">
              <Button aria-label="Toggle timer" size="lg" className="rounded-full w-16 h-16 shadow-glow" onClick={toggleTimer}>
                {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>
              <Button aria-label="Reset timer" size="lg" variant="outline" className="rounded-full w-16 h-16" onClick={resetTimer}>
                <RotateCcw className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="mt-8 flex gap-2">
              <Button variant={!isBreak && !isActive && timeLeft === 25*60 ? "default" : "secondary"} size="sm" onClick={() => { setIsBreak(false); setIsActive(false); setTimeLeft(25 * 60); }}>
                {t.support.focus25m}
              </Button>
              <Button variant={isBreak && !isActive && timeLeft === 5*60 ? "default" : "secondary"} size="sm" onClick={() => { setIsBreak(true); setIsActive(false); setTimeLeft(5 * 60); }}>
                {t.support.break5m}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mental Wellbeing */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Heart className="h-5 w-5" /> {t.support.dailyReassurance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-foreground leading-relaxed italic">
                &quot;{t.support.wellnessTips[new Date().getDay() % t.support.wellnessTips.length]}&quot;
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" /> {t.support.productivityHacks}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{t.support.hack1Title}</p>
                  <p className="text-sm text-muted-foreground">{t.support.hack1Desc}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{t.support.hack2Title}</p>
                  <p className="text-sm text-muted-foreground">{t.support.hack2Desc}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{t.support.hack3Title}</p>
                  <p className="text-sm text-muted-foreground">{t.support.hack3Desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-8 border-t border-border space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <BookMarked className="h-8 w-8 text-indigo-500" /> {t.support.academicResources}
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              {t.support.resourcesDesc}
            </p>
          </div>
        </div>
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              aria-label={t.support.searchPlaceholder}
              className="pl-10 bg-background shadow-sm border-border/50 w-full" 
              placeholder={t.support.searchPlaceholder} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 bg-background p-1.5 rounded-xl border border-border/50 shadow-sm shrink-0">
            {uniqueCategories.map(cat => (
              <Badge 
                key={cat} 
                variant={selectedCategory === cat ? "default" : "outline"} 
                className={`cursor-pointer px-4 py-1.5 transition-colors ${selectedCategory === cat ? 'bg-indigo-500 hover:bg-indigo-600 shadow-glow shadow-indigo-500/20' : 'hover:bg-indigo-500/10 hover:text-indigo-500'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-48 bg-card border border-border rounded-2xl animate-pulse" />
             ))}
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res: any, idx: number) => (
              <a href={res.url} target="_blank" rel="noreferrer" key={idx} className="group flex flex-col bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-glow hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 h-full">
                {res.imageUrl && (
                  <div className="w-full h-36 overflow-hidden relative border-b border-border/50">
                    <Image src={res.imageUrl} alt={res.title} fill className="object-cover transition-transform group-hover:scale-105 duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-xs font-semibold flex items-center gap-1.5">{t.support.openResource} <ExternalLink className="h-3 w-3" /></span>
                    </div>
                  </div>
                )}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                       <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">{res.category || t.support.general}</Badge>
                       {!res.imageUrl && <ExternalLink className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity group-hover:text-indigo-500" />}
                    </div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-500 transition-colors">{res.title}</h3>
                    {res.subject && <div className="text-xs font-medium text-indigo-500/80 mt-1">{res.subject}</div>}
                    <p className="text-sm text-foreground/70 mt-3 line-clamp-3 leading-relaxed">{res.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center text-center py-24 bg-card/30 rounded-3xl border border-dashed border-border/60 shadow-inner">
             <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
             <h3 className="text-xl font-display font-medium text-foreground">{t.support.noResources}</h3>
             <p className="text-muted-foreground mt-1">{t.support.tryAdjusting}</p>
           </div>
        )}
      </div>

    </div>
  );
}
