"use client";


import { useState, useEffect } from "react";
import Image from "next/image";
import { User as UserIcon, Mail, BookOpen, GraduationCap, Github, Linkedin, Save, AlertCircle, Download, FileText, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { ref, get, update } from "firebase/database";
import { db, auth } from "@/lib/firebase/config";
import { storage } from "@/lib/firebase/config";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useT } from "@/i18n/LanguageProvider";



export default function ProfilePage() {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    major: "Computer Science",
    academicLevel: "Sophomore",
    graduationYear: new Date().getFullYear() + 2,
    github: "",
    linkedin: "",
    photoURL: ""
  });

  const [skills, setSkills] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.uid) return;

    const fetchData = async () => {
      try {
        const snapshot = await get(ref(db, `users/${session.uid}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProfile(prev => ({
            ...prev,
            ...data,
            displayName: data.displayName || session.displayName || "",
          }));
        } else {
          setProfile(prev => ({ ...prev, displayName: session.displayName || "" }));
        }
        
        setEmailInput(session.email || "");

        // Fetch skills
        const skillsSnap = await get(ref(db, `user_skills/${session.uid}`));
        if (skillsSnap.exists()) {
          setSkills(Object.values(skillsSnap.val()));
        }

        // Fetch tasks
        const tasksSnap = await get(ref(db, `tasks/${session.uid}`));
        if (tasksSnap.exists()) {
          const allTasks: any[] = Object.values(tasksSnap.val());
          setTasks(allTasks.filter(t => t.status === "Completed"));
        }

      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleExportResume = async () => {
    toast.info(t.profile.generatingResume, t.profile.compilingData);
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("resume-export");
      if (!element) {
        throw new Error("Resume export element not found in DOM");
      }
      
      const opt = {
        margin: 0.5,
        filename: `${profile.displayName.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in' as const, format: 'letter', orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
      toast.success(t.profile.success, t.profile.resumeDownloaded);
    } catch (e) {
      console.error(e);
      toast.error(t.profile.error, t.profile.failedPdf);
    }
  };

  const handleUpdateEmail = async () => {
    if (!auth.currentUser || emailInput === session?.email) return;
    setUpdatingEmail(true);
    
    try {
      await import("firebase/auth").then(({ verifyBeforeUpdateEmail }) => {
        return verifyBeforeUpdateEmail(auth.currentUser!, emailInput);
      });
      toast.success(t.profile.verifyEmailSent, t.profile.verifyEmailSentDesc);
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        toast.error(t.profile.requiresRecentLogin, t.profile.requiresRecentLoginDesc);
      } else if (err.code === "auth/email-already-in-use") {
        toast.error(t.profile.emailInUse, t.profile.emailInUseDesc);
      } else {
        toast.error(t.profile.updateFailed, err.message);
      }
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleSave = async () => {
    if (!session?.uid) return;
    setSaving(true);
    
    try {
      await update(ref(db, `users/${session.uid}`), {
        ...profile,
        updatedAt: new Date().toISOString()
      });

      if (auth.currentUser && profile.displayName !== auth.currentUser.displayName) {
        import("firebase/auth").then(({ updateProfile }) => {
          updateProfile(auth.currentUser!, { displayName: profile.displayName });
        });
      }

      toast.success(t.profile.profileUpdated, t.profile.changesSaved);
    } catch (err) {
      toast.error(t.profile.updateFailed, t.profile.couldNotSave);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.uid) return;
    
    setSaving(true);
    try {
      let photoURL = "";
      if (file) {
        const ext = file.name.split(".").pop();
        const fileName = `${session.uid}-${Date.now()}.${ext}`;
        const fileRef = storageRef(storage, `avatars/${fileName}`);
        await uploadBytes(fileRef, file);
        photoURL = await getDownloadURL(fileRef);
      }
      
      await update(ref(db, `users/${session.uid}`), { photoURL });
      
      if (auth.currentUser) {
        import("firebase/auth").then(({ updateProfile }) => {
          updateProfile(auth.currentUser!, { photoURL });
        });
      }
      
      setProfile(prev => ({ ...prev, photoURL: photoURL as string }));
      toast.success(t.profile.imageUpdated, t.profile.avatarSaved);
    } catch (err) {
      console.error(err);
      toast.error(t.profile.uploadFailed, t.profile.couldNotUpload);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">{t.profile.myProfile}</h1>
          <p className="mt-2 text-muted-foreground">{t.profile.manageInfo}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/portfolio/${session?.uid}`} target="_blank" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2 bg-background border-border shadow-sm">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              {t.profile.publicPortfolio}
            </Button>
          </Link>
          <Button onClick={handleExportResume} className="flex-1 sm:flex-none gap-2 bg-primary text-primary-foreground shadow-glow">
            <Download className="h-4 w-4" />
            {t.profile.exportResume}
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>{t.profile.personalInfo}</CardTitle>
          <CardDescription>{t.profile.updatePhoto}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group h-24 w-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-sm overflow-hidden shrink-0">
              <Image 
                src={(profile.photoURL || session?.photoURL) as string || "/default-avatar.svg"} 
                alt={`${profile.displayName || "User"}'s profile avatar`} 
                width={96} 

                height={96} 
                className="h-full w-full object-cover bg-white" 
              />
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium">
                {t.profile.upload}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={saving} />
              </label>
            </div>
            <div>
              <p className="font-medium">{session?.email}</p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {t.profile.uploadCustom}
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">{t.profile.displayName}</label>
              <Input 
                id="displayName"
                value={profile.displayName} 
                onChange={e => setProfile({...profile, displayName: e.target.value})} 
                placeholder={t.profile.yourFullName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="emailAddress" className="text-sm font-medium">{t.profile.emailAddress}</label>
              <div className="flex items-center gap-2">
                <Input 
                  id="emailAddress"
                  value={emailInput} 
                  onChange={e => setEmailInput(e.target.value)} 
                  className={emailInput !== session?.email ? "border-primary" : ""}
                />
                {emailInput !== session?.email && (
                  <Button 
                    size="sm" 
                    onClick={handleUpdateEmail} 
                    disabled={updatingEmail || !emailInput}
                  >
                    {updatingEmail ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" /> : t.profile.updateEmailBtn}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">{t.profile.bio}</label>
            <Textarea 
              id="bio"
              value={profile.bio} 
              onChange={e => setProfile({...profile, bio: e.target.value})} 
              placeholder={t.profile.shortBio}
              className="resize-none"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>{t.profile.academicDetails}</CardTitle>
          <CardDescription>{t.profile.infoUsed}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="major" className="text-sm font-medium flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" /> {t.profile.majorDegree}</label>
              <Input 
                id="major"
                value={profile.major} 
                onChange={e => setProfile({...profile, major: e.target.value})} 
                placeholder={t.profile.egCS}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="graduationYear" className="text-sm font-medium flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /> {t.profile.graduationYear}</label>
              <Input 
                id="graduationYear"
                type="number"
                value={profile.graduationYear} 
                onChange={e => setProfile({...profile, graduationYear: parseInt(e.target.value, 10)})} 
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Github className="h-4 w-4 text-muted-foreground" /> {t.profile.githubUrl}</label>
              <Input 
                value={profile.github} 
                onChange={e => setProfile({...profile, github: e.target.value})} 
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Linkedin className="h-4 w-4 text-muted-foreground" /> {t.profile.linkedinUrl}</label>
              <Input 
                value={profile.linkedin} 
                onChange={e => setProfile({...profile, linkedin: e.target.value})} 
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t border-border px-6 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="w-fit gap-2 px-8">
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" /> : <Save className="h-4 w-4" />}
            {saving ? t.profile.saving : t.profile.saveProfile}
          </Button>
        </CardFooter>
      </Card>

      {/* Hidden ATS Resume Template */}
      <div style={{ display: "none" }}>
        <div id="resume-export" style={{ 
          fontFamily: "'Times New Roman', Times, serif", 
          color: "#000", 
          width: "8.5in", 
          minHeight: "11in",
          padding: "0.5in 0.5in",
          boxSizing: "border-box",
          backgroundColor: "#fff"
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "10px", marginBottom: "15px" }}>
            <h1 style={{ fontSize: "24px", margin: "0 0 5px 0", fontWeight: "bold" }}>{profile.displayName || t.profile.resume.studentName}</h1>
            <p style={{ fontSize: "12px", margin: "0" }}>
              {session?.email} • {profile.linkedin && `${profile.linkedin}`} • {profile.github && `${profile.github}`}
            </p>
          </div>

          {/* Education */}
          <div style={{ marginBottom: "15px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", marginBottom: "8px" }}>{t.profile.resume.education}</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold", fontSize: "12px" }}>{t.profile.resume.university}</span>
              <span style={{ fontSize: "12px" }}>{t.profile.resume.expectedGrad} {profile.graduationYear}</span>
            </div>
            <div style={{ fontSize: "12px" }}>{t.profile.resume.degree} {profile.major}</div>
            <div style={{ fontSize: "12px", fontStyle: "italic" }}>{t.profile.resume.standing} {profile.academicLevel}</div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", marginBottom: "8px" }}>{t.profile.resume.techSkills}</h2>
              <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "12px" }}>
                {['Languages', 'Frontend & UI', 'Backend & Databases', 'DevOps & Cloud', 'AI & Machine Learning', 'CS Fundamentals'].map(cat => {
                  const catSkills = skills.filter(s => s.category === cat);
                  if (catSkills.length === 0) return null;
                  return (
                    <li key={cat} style={{ marginBottom: "4px" }}>
                      <strong>{t.skills.domains[cat as keyof typeof t.skills.domains] || cat}:</strong> {catSkills.map(s => s.name).join(", ")}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Projects / Experience */}
          {tasks.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", marginBottom: "8px" }}>{t.profile.resume.projectsExp}</h2>
              {tasks.map((task, idx) => (
                <div key={idx} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", fontSize: "12px" }}>{task.title}</span>
                    <span style={{ fontSize: "12px", fontStyle: "italic" }}>{task.courseName}</span>
                  </div>
                  <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px", fontSize: "12px" }}>
                    <li>{task.description || t.profile.resume.taskDesc.replace("{title}", task.title)}</li>
                    <li>{t.profile.resume.sprintDesc.replace("{hours}", String(task.estimatedHours))}</li>
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
