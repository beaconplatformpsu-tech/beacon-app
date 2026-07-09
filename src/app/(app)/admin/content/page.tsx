"use client";

import { useState, useEffect } from "react";
import { Database, Layers, CheckSquare, Briefcase } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";

import { CategoriesManager } from "./_components/CategoriesManager";
import { PathsManager } from "./_components/PathsManager";
import { SkillsManager } from "./_components/SkillsManager";
import { ResourcesManager } from "./_components/ResourcesManager";
import { useT } from "@/i18n/LanguageProvider";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const t = useT();

  const [categories, setCategories] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = 0;
    const check = () => { done++; if (done >= 4) setLoading(false); };

    const unsubCat = onValue(ref(db, "public_content/career_categories"), s => {
      const d = s.val() || {};
      setCategories(Object.keys(d).map(k => ({ id: k, ...d[k] })));
      check();
    });
    const unsubPaths = onValue(ref(db, "public_content/career_paths"), s => {
      const d = s.val() || {};
      setPaths(Object.keys(d).map(k => ({ id: k, ...d[k] })));
      check();
    });
    const unsubSkills = onValue(ref(db, "public_content/skills"), s => {
      const d = s.val() || {};
      setSkills(Object.keys(d).map(k => ({ id: k, ...d[k] })));
      check();
    });
    const unsubRes = onValue(ref(db, "public_content/resources"), s => {
      const d = s.val() || {};
      setResources(Object.keys(d).map(k => ({ id: k, ...d[k] })));
      check();
    });

    return () => { unsubCat(); unsubPaths(); unsubSkills(); unsubRes(); };
  }, []);

  const tabs = [
    { id: "categories", label: t.adminContent.categories, icon: Layers },
    { id: "paths", label: t.adminContent.careerPaths, icon: Briefcase },
    { id: "skills", label: t.adminContent.skillsLibrary, icon: CheckSquare },
    { id: "resources", label: t.adminContent.resources, icon: Database },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t.adminContent.title}</h1>
        <p className="text-muted-foreground mt-1">{t.adminContent.subtitle}</p>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 hide-scrollbar">
        <div className="flex bg-muted/40 p-1.5 rounded-2xl border border-border/50 gap-1 w-max sm:w-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-20 w-full bg-card rounded-xl border border-border" />)}
          </div>
        ) : (
          <>
            {activeTab === "categories" && <CategoriesManager categories={categories} />}
            {activeTab === "paths" && <PathsManager paths={paths} categories={categories} skills={skills} resources={resources} />}
            {activeTab === "skills" && <SkillsManager skills={skills} paths={paths} resources={resources} categories={categories} />}
            {activeTab === "resources" && <ResourcesManager resources={resources} paths={paths} skills={skills} categories={categories} />}
          </>
        )}
      </div>
    </div>
  );
}

