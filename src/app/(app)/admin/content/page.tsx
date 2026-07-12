"use client";

import { useState, useEffect } from "react";
import { Database, Layers, CheckSquare, Briefcase } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";

import { CategoriesManager } from "./_components/CategoriesManager";
import { PathsManager } from "./_components/PathsManager";
import { SkillsManager } from "./_components/SkillsManager";
import { ResourcesManager } from "./_components/ResourcesManager";
import { LearningPathsManager } from "./_components/LearningPathsManager";
import { PracticeTasksManager } from "./_components/PracticeTasksManager";
import { ProjectsManager } from "./_components/ProjectsManager";
import { QuizzesManager } from "./_components/QuizzesManager";
import { AnnouncementsManager } from "./_components/AnnouncementsManager";
import { useT } from "@/i18n/LanguageProvider";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const t = useT();

  const [careerCategories, setCareerCategories] = useState<any[]>([]);
  const [academicCategories, setAcademicCategories] = useState<any[]>([]);
  const [skillCategories, setSkillCategories] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [practiceTasks, setPracticeTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = 0;
    const totalToLoad = 11;
    const check = () => { done++; if (done >= totalToLoad) setLoading(false); };

    const subs = [
      onValue(ref(db, "public_content/career_categories"), s => { const d = s.val() || {}; setCareerCategories(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/academic_categories"), s => { const d = s.val() || {}; setAcademicCategories(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/skill_categories"), s => { const d = s.val() || {}; setSkillCategories(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/career_paths"), s => { const d = s.val() || {}; setPaths(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/skills"), s => { const d = s.val() || {}; setSkills(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/resources"), s => { const d = s.val() || {}; setResources(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/learning_paths"), s => { const d = s.val() || {}; setLearningPaths(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/practice_tasks"), s => { const d = s.val() || {}; setPracticeTasks(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/projects"), s => { const d = s.val() || {}; setProjects(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/quizzes"), s => { const d = s.val() || {}; setQuizzes(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
      onValue(ref(db, "public_content/announcements"), s => { const d = s.val() || {}; setAnnouncements(Object.keys(d).map(k => ({ id: k, ...d[k] }))); check(); }),
    ];

    return () => subs.forEach(unsub => unsub());
  }, []);

  const tContent = t.adminContent as any;
  const tabs = [
    { id: "categories", label: tContent?.categories || "Categories", icon: Layers },
    { id: "paths", label: tContent?.careerPaths || "Career Paths", icon: Briefcase },
    { id: "skills", label: tContent?.skillsLibrary || "Skills", icon: CheckSquare },
    { id: "resources", label: tContent?.resources || "Resources", icon: Database },
    { id: "learning_paths", label: tContent?.learningPaths || "Learning Paths", icon: Layers },
    { id: "practice_tasks", label: tContent?.practiceTasks || "Practice Tasks", icon: CheckSquare },
    { id: "projects", label: tContent?.projects || "Projects", icon: Briefcase },
    { id: "quizzes", label: tContent?.quizzes || "Quizzes", icon: CheckSquare },
    { id: "announcements", label: tContent?.announcements || "Announcements", icon: Database },
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
            {activeTab === "categories" && <CategoriesManager careerCategories={careerCategories} academicCategories={academicCategories} skillCategories={skillCategories} />}
            {activeTab === "paths" && <PathsManager paths={paths} categories={careerCategories} skills={skills} resources={resources} />}
            {activeTab === "skills" && <SkillsManager skills={skills} paths={paths} resources={resources} categories={skillCategories} />}
            {activeTab === "resources" && <ResourcesManager resources={resources} paths={paths} skills={skills} categories={academicCategories} />}
            {activeTab === "learning_paths" && <LearningPathsManager learningPaths={learningPaths} paths={paths} resources={resources} practiceTasks={practiceTasks} projects={projects} quizzes={quizzes} />}
            {activeTab === "practice_tasks" && <PracticeTasksManager practiceTasks={practiceTasks} skills={skills} />}
            {activeTab === "projects" && <ProjectsManager projects={projects} skills={skills} paths={paths} />}
            {activeTab === "quizzes" && <QuizzesManager quizzes={quizzes} skills={skills} />}
            {activeTab === "announcements" && <AnnouncementsManager announcements={announcements} />}
          </>
        )}
      </div>
    </div>
  );
}

