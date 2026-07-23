"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, CheckCircle2, ChevronRight, ChevronLeft, 
  GraduationCap, Github, Linkedin, Globe, Sparkles, BookOpen, Code, Trophy
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT } from "@/i18n/LanguageProvider";
import { saveStudentProfile, markProfileCompleted, mapLegacyLevel } from "@/lib/services/profile";
import type { CSStudyLevel } from "@/types/collections/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PREDEFINED_INTERESTS = [
  "Frontend Development", "Backend Development", "Data Analysis", "Cybersecurity", 
  "Artificial Intelligence", "Databases", "UI/UX", "Mobile Development", "DevOps"
];

const PREDEFINED_SKILLS = [
  "JavaScript", "React", "Python", "SQL", "Git", "Networking", 
  "Machine Learning", "Cybersecurity Basics", "UI Design", "Java", "C++"
];

const CURRENT_LEVELS: CSStudyLevel[] = ["foundation", "year_1", "year_2", "year_3", "year_4", "graduate"];

const MAIN_GOALS = [
  "Improve academic performance",
  "Build stronger programming skills",
  "Prepare for internship",
  "Prepare for job applications",
  "Build portfolio projects",
  "Improve CV"
];

export default function CompleteProfilePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const toast = useCustomToast();
  const t = useT();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Form State
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [currentLevel, setCurrentLevel] = useState<CSStudyLevel | "">("");
  const [mainGoal, setMainGoal] = useState("");
  const [backgroundItem, setBackgroundItem] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const totalSteps = 5;

  // Load draft
  useEffect(() => {
    if (typeof window !== "undefined" && currentUser?.uid) {
      const saved = localStorage.getItem(`beacon_onboarding_draft_${currentUser.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.step) setStep(parsed.step);
          if (parsed.bio) setBio(parsed.bio);
          if (parsed.specialization) setSpecialization(parsed.specialization);
          if (parsed.interests) setInterests(parsed.interests);
          if (parsed.skills) setSkills(parsed.skills);
          if (parsed.currentLevel) {
            const mapped = mapLegacyLevel(parsed.currentLevel);
            if (mapped) setCurrentLevel(mapped);
          }
          if (parsed.mainGoal) setMainGoal(parsed.mainGoal);
          if (parsed.backgroundItem) setBackgroundItem(parsed.backgroundItem);
          if (parsed.github) setGithub(parsed.github);
          if (parsed.linkedin) setLinkedin(parsed.linkedin);
          if (parsed.portfolio) setPortfolio(parsed.portfolio);
        } catch (e) {}
      }
    }
  }, [currentUser?.uid]);

  // Save draft
  useEffect(() => {
    if (typeof window !== "undefined" && currentUser?.uid) {
      const draft = {
        step, bio, specialization, interests, skills, 
        currentLevel, mainGoal, backgroundItem, github, linkedin, portfolio
      };
      localStorage.setItem(`beacon_onboarding_draft_${currentUser.uid}`, JSON.stringify(draft));
    }
  }, [step, bio, specialization, interests, skills, currentLevel, mainGoal, backgroundItem, github, linkedin, portfolio, currentUser?.uid]);

  // Clear specific error on change
  const clearError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handlers for lists
  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string, fieldName: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
      clearError(fieldName);
    }
  };

  const addCustomItem = (list: string[], setList: (v: string[]) => void, item: string, setItem: (v: string) => void, fieldName: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (list.includes(trimmed)) {
      setFieldErrors(prev => ({ ...prev, [`${fieldName}Custom`]: t.auth.onboarding?.errors?.duplicate || "Already added" }));
      return;
    }
    setList([...list, trimmed]);
    setItem("");
    clearError(fieldName);
    clearError(`${fieldName}Custom`);
  };

  // Validation
  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  const validateStep = (current: number) => {
    const errors: Record<string, string> = {};
    let isValid = true;

    switch (current) {
      case 1:
        if (bio.trim().length < 10) {
          errors.bio = "Bio must be at least 10 characters";
          isValid = false;
        }
        if (!specialization.trim()) {
          errors.specialization = "Specialization is required";
          isValid = false;
        }
        break;
      case 2:
        if (interests.length < 2) {
          errors.interests = t.auth.onboarding?.step2?.minRequired || "Select at least 2 interests";
          isValid = false;
        }
        break;
      case 3:
        if (skills.length < 3) {
          errors.skills = t.auth.onboarding?.step3?.minRequired || "Select at least 3 skills";
          isValid = false;
        }
        break;
      case 4:
        if (!currentLevel) {
          errors.currentLevel = "Current level is required";
          isValid = false;
        }
        if (!mainGoal) {
          errors.mainGoal = "Main learning goal is required";
          isValid = false;
        }
        break;
      case 5:
        if (!backgroundItem.trim()) {
          errors.backgroundItem = "Background item is required";
          isValid = false;
        }
        if (!validateUrl(github)) {
          errors.github = t.auth.onboarding?.errors?.invalidUrl || "Invalid URL";
          isValid = false;
        }
        if (!validateUrl(linkedin)) {
          errors.linkedin = t.auth.onboarding?.errors?.invalidUrl || "Invalid URL";
          isValid = false;
        }
        if (!validateUrl(portfolio)) {
          errors.portfolio = t.auth.onboarding?.errors?.invalidUrl || "Invalid URL";
          isValid = false;
        }
        break;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    if (!currentUser?.uid) return;
    setLoading(true);

    try {
      await saveStudentProfile(currentUser.uid, {
        bio: bio.trim(),
        studyProgram: specialization.trim(),
        technicalInterestIds: interests,
        targetSkillIds: skills,
        academicStage: (currentLevel as CSStudyLevel) || undefined,
        primaryGoal: mainGoal,
        secondaryGoals: [],
        education: {
          primary: {
            title: backgroundItem.trim()
          }
        },
        links: {
          github: github.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          portfolio: portfolio.trim() || undefined,
        }
      });
      await markProfileCompleted(currentUser.uid);
      localStorage.removeItem(`beacon_onboarding_draft_${currentUser.uid}`);

      toast.success(
        t.profile?.profileUpdated || "Profile complete!",
        "Your personalized dashboard is ready."
      );
      router.push("/dashboard");
    } catch {
      toast.error(t.profile?.updateFailed || "Update failed", "Could not save your profile.");
      setLoading(false);
    }
  };

  // Visual helper for stepper
  const getStepIcon = (s: number) => {
    switch (s) {
      case 1: return <BookOpen className="w-5 h-5" />;
      case 2: return <Sparkles className="w-5 h-5" />;
      case 3: return <Code className="w-5 h-5" />;
      case 4: return <Trophy className="w-5 h-5" />;
      case 5: return <GraduationCap className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t.auth.onboarding?.[`step${step}` as 'step1'|'step2'|'step3'|'step4'|'step5']?.title || t.auth.completeProfileTitle}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.auth.onboarding?.[`step${step}` as 'step1'|'step2'|'step3'|'step4'|'step5']?.desc || t.auth.completeProfileSub}
          </p>
        </div>

        {/* Desktop Stepper */}
        <div className="hidden sm:flex items-center justify-between mb-8 px-4 relative">
          <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-border -z-10 -translate-y-1/2" />
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  s === step 
                    ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                    : s < step 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-card border-border text-muted-foreground'
                }`}
              >
                {s < step ? <CheckCircle2 className="w-6 h-6" /> : getStepIcon(s)}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Stepper */}
        <div className="sm:hidden flex items-center justify-between mb-6 px-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-primary' : s < step ? 'w-2 bg-primary/40' : 'w-2 bg-border'
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-base flex items-center justify-between">
                    <span>
                      {t.auth.onboarding?.step1?.bio || "Bio / Short Introduction"}
                      <span className="text-destructive ml-1">*</span>
                    </span>
                    <span className={`text-xs ${bio.length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {bio.length}/10 min
                    </span>
                  </Label>
                  <Textarea 
                    id="bio"
                    placeholder={t.auth.onboarding?.step1?.bioPh || "I am a student passionate about..."}
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      clearError("bio");
                    }}
                    className={`min-h-[140px] resize-none text-base p-4 ${fieldErrors.bio ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {fieldErrors.bio && <p className="text-sm text-destructive font-medium">{fieldErrors.bio}</p>}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="spec" className="text-base">
                    {t.auth.onboarding?.step1?.spec || "Specialization"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input 
                    id="spec"
                    placeholder={t.auth.onboarding?.step1?.specPh || "e.g., Software Engineering"}
                    value={specialization}
                    onChange={(e) => {
                      setSpecialization(e.target.value);
                      clearError("specialization");
                    }}
                    className={`h-12 text-base px-4 ${fieldErrors.specialization ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {fieldErrors.specialization && <p className="text-sm text-destructive font-medium">{fieldErrors.specialization}</p>}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <Label className="text-base mb-4 block">
                    Select suggested interests <span className="text-muted-foreground font-normal text-sm ml-2">(minimum 2 required)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {PREDEFINED_INTERESTS.map((interest) => {
                      const isSelected = interests.includes(interest);
                      return (
                        <Badge 
                          key={interest}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer text-sm py-2 px-4 transition-all ${isSelected ? 'shadow-md scale-105' : 'hover:border-primary/50 hover:bg-primary/5'}`}
                          onClick={() => toggleItem(interests, setInterests, interest, "interests")}
                        >
                          {interest}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border/50 space-y-3">
                  <Label className="text-base">Or add your own</Label>
                  <div className="flex gap-3">
                    <Input 
                      placeholder={t.auth.onboarding?.step2?.addInterest || "Add custom interest..."}
                      value={customInterest}
                      onChange={(e) => {
                        setCustomInterest(e.target.value);
                        clearError("interestsCustom");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomItem(interests, setInterests, customInterest, setCustomInterest, "interests");
                        }
                      }}
                      className="h-12 text-base px-4"
                    />
                    <Button 
                      type="button" 
                      variant="secondary"
                      className="h-12 px-6"
                      onClick={() => addCustomItem(interests, setInterests, customInterest, setCustomInterest, "interests")}
                    >
                      Add
                    </Button>
                  </div>
                  {fieldErrors.interestsCustom && <p className="text-sm text-destructive font-medium">{fieldErrors.interestsCustom}</p>}
                </div>

                {fieldErrors.interests && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 font-medium">
                    {fieldErrors.interests}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <Label className="text-base mb-4 block">
                    Select suggested skills <span className="text-muted-foreground font-normal text-sm ml-2">(minimum 3 required)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {PREDEFINED_SKILLS.map((skill) => {
                      const isSelected = skills.includes(skill);
                      return (
                        <Badge 
                          key={skill}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer text-sm py-2 px-4 transition-all ${isSelected ? 'shadow-md scale-105' : 'hover:border-primary/50 hover:bg-primary/5'}`}
                          onClick={() => toggleItem(skills, setSkills, skill, "skills")}
                        >
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border/50 space-y-3">
                  <Label className="text-base">Or add your own</Label>
                  <div className="flex gap-3">
                    <Input 
                      placeholder={t.auth.onboarding?.step3?.addSkill || "Add custom skill..."}
                      value={customSkill}
                      onChange={(e) => {
                        setCustomSkill(e.target.value);
                        clearError("skillsCustom");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomItem(skills, setSkills, customSkill, setCustomSkill, "skills");
                        }
                      }}
                      className="h-12 text-base px-4"
                    />
                    <Button 
                      type="button" 
                      variant="secondary"
                      className="h-12 px-6"
                      onClick={() => addCustomItem(skills, setSkills, customSkill, setCustomSkill, "skills")}
                    >
                      Add
                    </Button>
                  </div>
                  {fieldErrors.skillsCustom && <p className="text-sm text-destructive font-medium">{fieldErrors.skillsCustom}</p>}
                </div>

                {fieldErrors.skills && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 font-medium">
                    {fieldErrors.skills}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <Label className="text-base">
                    {t.auth.onboarding?.step4?.currentLevel || "Current CS Level"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t.auth.onboarding?.step4?.currentLevelHelper || "Choose your current Computer Science stage so Beacon can personalize your dashboard, support messages, and learning suggestions."}
                  </p>
                  <Select 
                    value={currentLevel} 
                    onValueChange={(v) => {
                      setCurrentLevel(v as CSStudyLevel);
                      clearError("currentLevel");
                    }}
                  >
                    <SelectTrigger className={`h-12 text-base px-4 ${fieldErrors.currentLevel ? 'border-destructive focus:ring-destructive' : ''}`}>
                      <SelectValue placeholder="Select your current academic level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENT_LEVELS.map(l => (
                        <SelectItem key={l} value={l} className="py-3 cursor-pointer">
                          {t.auth.onboarding?.step4?.currentLevelOptions?.[l as keyof typeof t.auth.onboarding.step4.currentLevelOptions] || l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.currentLevel && <p className="text-sm text-destructive font-medium">{fieldErrors.currentLevel}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-base">
                    {t.auth.onboarding?.step4?.mainGoal || "Main Learning Goal"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select 
                    value={mainGoal} 
                    onValueChange={(v) => {
                      setMainGoal(v);
                      clearError("mainGoal");
                    }}
                  >
                    <SelectTrigger className={`h-12 text-base px-4 ${fieldErrors.mainGoal ? 'border-destructive focus:ring-destructive' : ''}`}>
                      <SelectValue placeholder="What do you want to achieve most?" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_GOALS.map(g => (
                        <SelectItem key={g} value={g} className="py-3 cursor-pointer">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.mainGoal && <p className="text-sm text-destructive font-medium">{fieldErrors.mainGoal}</p>}
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3 pb-4 border-b border-border/50">
                  <Label className="flex items-center gap-2 text-base">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    {t.auth.onboarding?.step5?.backgroundItem || "Education, Course, or Experience"}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    placeholder={t.auth.onboarding?.step5?.backgroundItemPh || "e.g., BSc Computer Science at XYZ University"}
                    value={backgroundItem}
                    onChange={(e) => {
                      setBackgroundItem(e.target.value);
                      clearError("backgroundItem");
                    }}
                    className={`h-12 text-base px-4 ${fieldErrors.backgroundItem ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <p className="text-sm text-muted-foreground">Add at least one notable background item to anchor your profile.</p>
                  {fieldErrors.backgroundItem && <p className="text-sm text-destructive font-medium">{fieldErrors.backgroundItem}</p>}
                </div>

                <div className="space-y-6 pt-2">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base text-foreground/80">
                      <Github className="w-5 h-5" />
                      {t.auth.onboarding?.step5?.github || "GitHub URL"} 
                      <span className="text-muted-foreground text-sm font-normal">({t.auth.optional})</span>
                    </Label>
                    <Input 
                      type="url"
                      placeholder="https://github.com/username"
                      value={github}
                      onChange={(e) => {
                        setGithub(e.target.value);
                        clearError("github");
                      }}
                      className={`h-12 text-base px-4 ${fieldErrors.github ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {fieldErrors.github && <p className="text-sm text-destructive font-medium">{fieldErrors.github}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base text-foreground/80">
                      <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                      {t.auth.onboarding?.step5?.linkedin || "LinkedIn URL"} 
                      <span className="text-muted-foreground text-sm font-normal">({t.auth.optional})</span>
                    </Label>
                    <Input 
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => {
                        setLinkedin(e.target.value);
                        clearError("linkedin");
                      }}
                      className={`h-12 text-base px-4 ${fieldErrors.linkedin ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {fieldErrors.linkedin && <p className="text-sm text-destructive font-medium">{fieldErrors.linkedin}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base text-foreground/80">
                      <Globe className="w-5 h-5 text-emerald-500" />
                      {t.auth.onboarding?.step5?.portfolio || "Portfolio URL"} 
                      <span className="text-muted-foreground text-sm font-normal">({t.auth.optional})</span>
                    </Label>
                    <Input 
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={portfolio}
                      onChange={(e) => {
                        setPortfolio(e.target.value);
                        clearError("portfolio");
                      }}
                      className={`h-12 text-base px-4 ${fieldErrors.portfolio ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {fieldErrors.portfolio && <p className="text-sm text-destructive font-medium">{fieldErrors.portfolio}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-border flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1 || loading}
                className="w-full sm:w-auto h-12 px-6"
              >
                <ChevronLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2 rtl:rotate-180" />
                {t.auth.onboarding?.actions?.back || "Back"}
              </Button>

              {step < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="w-full sm:w-auto h-12 px-8 font-medium"
                >
                  {t.auth.onboarding?.actions?.next || "Next"}
                  <ChevronRight className="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="w-full sm:w-auto h-12 px-8 font-semibold shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90"
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {!loading && <CheckCircle2 className="ltr:mr-2 rtl:ml-2 h-5 w-5" />}
                  {t.auth.onboarding?.actions?.complete || "Complete Profile"}
                </Button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
