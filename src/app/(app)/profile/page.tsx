"use client";

import Image from "next/image";
import { User as UserIcon, BookOpen, GraduationCap, Github, Linkedin, ExternalLink, Wrench, Target, Brain, Briefcase, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useStudentProfile, useStudentSkills } from "@/lib/db/services/studentDataService";
import { usePublicCareerPaths } from "@/lib/db/services/publicContentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage, useT } from "@/i18n/LanguageProvider";
import { StudentPageContainer, StudentPageHeader } from "@/components/shared/student";

export default function ProfilePage() {
  const { currentUser, profile: authProfile } = useAuth();
  const { dir } = useLanguage();
  const t = useT();
  const { profile, loading } = useStudentProfile(currentUser?.uid);
  const { skills } = useStudentSkills(currentUser?.uid);
  const { careerPaths } = usePublicCareerPaths();

  if (loading) {
    return (
      <StudentPageContainer>
        <StudentPageHeader
          title={t.profile?.myProfile || "My Profile"}
          description={t.profile?.manageInfo || "View your public profile information."}
          icon={<UserIcon className="w-5 h-5" />}
        />
        <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      </StudentPageContainer>
    );
  }

  const resolvedCareerPath = careerPaths.find(p => p.id === profile?.preferredCareerPathId)?.title;

  return (
    <StudentPageContainer>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <StudentPageHeader
          title={t.profile?.myProfile || "My Profile"}
          description={t.profile?.manageInfo || "View your public profile information."}
          icon={<UserIcon className="w-5 h-5" />}
        />
        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Link href="/settings" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2 bg-background border-border shadow-sm">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              Edit Settings
            </Button>
          </Link>
          <Link href={`/portfolio/${currentUser?.uid}`} target="_blank" className="flex-1 sm:flex-none">
            <Button variant="default" className="w-full gap-2 shadow-glow">
              <ExternalLink className="h-4 w-4" />
              {t.profile?.publicPortfolio || "Public Portfolio"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border shadow-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-sm overflow-hidden shrink-0">
                <Image 
                  src={(profile?.photoURL || currentUser?.photoURL) || "/default-avatar.svg"} 
                  alt={`${authProfile?.displayName || "User"}'s profile avatar`} 
                  width={96} 
                  height={96} 
                  className="h-full w-full object-cover bg-white" 
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{authProfile?.displayName || "Anonymous Student"}</h2>
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                {profile?.academicStage && (
                  <p className="text-sm font-medium mt-1 text-primary capitalize">{profile.academicStage.replace("_", " ")}</p>
                )}
              </div>
              {profile?.completionPercentage !== undefined && (
                <div className="w-full pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Profile Completion</span>
                    <span className="text-xs font-bold text-primary">{profile.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all" 
                      style={{ width: `${profile.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Connect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.links?.github && (
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              )}
              {profile?.links?.linkedin && (
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              )}
              {profile?.links?.portfolio && (
                <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="h-4 w-4" /> Portfolio
                </a>
              )}
              {!profile?.links?.github && !profile?.links?.linkedin && !profile?.links?.portfolio && (
                <p className="text-sm text-muted-foreground italic">No professional links added.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.bio ? (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  This student hasn't written a bio yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Academic & Career Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Study Program</h4>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary/70" /> 
                    {profile?.studyProgram || "Not specified"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Preferred Career Path</h4>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary/70" /> 
                    {resolvedCareerPath || "Not specified"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Primary Goal</h4>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary/70" /> 
                  {profile?.primaryGoal || "Not specified"}
                </p>
              </div>
              {profile?.secondaryGoals && profile.secondaryGoals.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Secondary Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.secondaryGoals.map((g, i) => (
                      <span key={i} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">{g}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Interests & Target Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" /> Technical Interests
                </h4>
                {profile?.technicalInterestIds && profile.technicalInterestIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.technicalInterestIds.map((interest, i) => (
                      <span key={i} className="px-2.5 py-1 border border-border text-foreground text-xs rounded-md">{interest}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No technical interests specified.</p>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Target Skills
                </h4>
                {profile?.targetSkillIds && profile.targetSkillIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.targetSkillIds.map((targetSkill, i) => (
                      <span key={i} className="px-2.5 py-1 border border-primary/20 bg-primary/5 text-primary text-xs rounded-md">{targetSkill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No target skills specified.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Verified Skills</CardTitle>
              <CardDescription>Skills acquired through platform learning and assessments.</CardDescription>
            </CardHeader>
            <CardContent>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <div key={skill.id} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
                      {skill.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No verified skills yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentPageContainer>
  );
}
