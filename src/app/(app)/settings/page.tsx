"use client";

import { useState, useEffect } from "react";
import { useLanguage, useT } from "@/i18n/LanguageProvider";
import { useTheme } from "@/components/theme-provider";
import { StudentPageContainer, StudentPageHeader } from "@/components/shared/student";
import { Wrench, User, Globe, Target, Loader2, BookOpen, Brain, Briefcase, Lock, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useStudentProfile, updateStudentProfile, updateStudentName, useStudentPreferences, updateStudentPreferences } from "@/lib/db/services/studentDataService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { usePublicCareerPaths } from "@/lib/db/services/publicContentService";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

export default function SettingsPage() {
  const { dir } = useLanguage();
  const t = useT();
  const { currentUser, profile: authProfile } = useAuth();
  const { profile, loading: profileLoading } = useStudentProfile(currentUser?.uid);
  const { preferences, loading: prefsLoading } = useStudentPreferences(currentUser?.uid);
  const { careerPaths, loading: pathsLoading } = usePublicCareerPaths();
  const { theme, setTheme } = useTheme();
  const { setLang, lang } = useLanguage();

  const [isSaving, setIsSaving] = useState(false);
  
  // Account Form
  const [accountData, setAccountData] = useState({ name: "" });

  // Profile Form
  const [profileData, setProfileData] = useState({
    bio: "",
    studyProgram: "",
    academicStage: "",
    primaryGoal: "",
    secondaryGoals: "",
    technicalInterests: "",
    targetSkills: "",
    github: "",
    linkedin: "",
    portfolio: "",
    preferredCareerPathId: "",
  });

  // Prefs Form
  const [prefsData, setPrefsData] = useState({
    language: "en",
    theme: "system",
    emailNotifications: true,
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (authProfile) {
      setAccountData({ name: authProfile.displayName || "" });
    }
  }, [authProfile]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        bio: profile.bio || "",
        studyProgram: profile.studyProgram || "",
        academicStage: profile.academicStage || "",
        primaryGoal: profile.primaryGoal || "",
        secondaryGoals: profile.secondaryGoals?.join(", ") || "",
        technicalInterests: profile.technicalInterestIds?.join(", ") || "",
        targetSkills: profile.targetSkillIds?.join(", ") || "",
        preferredCareerPathId: profile.preferredCareerPathId || "",
        github: profile.links?.github || "",
        linkedin: profile.links?.linkedin || "",
        portfolio: profile.links?.portfolio || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (preferences) {
      setPrefsData({
        language: preferences.language || "en",
        theme: preferences.theme || "system",
        emailNotifications: preferences.emailNotifications ?? true,
      });
    }
  }, [preferences]);

  const handleSaveAccount = async () => {
    if (!currentUser?.uid) return;
    setIsSaving(true);
    try {
      await updateStudentName(currentUser.uid, accountData.name);
      toast.success("Account information saved");
    } catch (e) {
      toast.error("Failed to save account information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser?.uid) return;
    setIsSaving(true);
    try {
      await updateStudentProfile(currentUser.uid, {
        bio: profileData.bio,
        studyProgram: profileData.studyProgram,
        academicStage: profileData.academicStage as any,
        primaryGoal: profileData.primaryGoal,
        secondaryGoals: profileData.secondaryGoals.split(",").map(s => s.trim()).filter(Boolean),
        technicalInterestIds: profileData.technicalInterests.split(",").map(s => s.trim()).filter(Boolean),
        targetSkillIds: profileData.targetSkills.split(",").map(s => s.trim()).filter(Boolean),
        preferredCareerPathId: profileData.preferredCareerPathId,
        links: {
          github: profileData.github || undefined,
          linkedin: profileData.linkedin || undefined,
          portfolio: profileData.portfolio || undefined,
        }
      });
      toast.success("Profile saved successfully");
    } catch (e) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrefs = async () => {
    if (!currentUser?.uid) return;
    setIsSaving(true);
    try {
      await updateStudentPreferences(currentUser.uid, {
        language: prefsData.language,
        theme: prefsData.theme,
        emailNotifications: prefsData.emailNotifications,
      });
      if (theme !== prefsData.theme) setTheme(prefsData.theme as any);
      if (lang !== prefsData.language) setLang(prefsData.language as any);
      toast.success("Preferences saved successfully");
    } catch (e) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser) return;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsSaving(true);
    try {
      if (!currentUser.email) throw new Error("No email associated");
      const cred = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword);
      await reauthenticateWithCredential(currentUser, cred);
      await updatePassword(currentUser, passwordData.newPassword);
      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      console.error(e);
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        toast.error("Incorrect current password");
      } else if (e.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else if (e.code === "auth/requires-recent-login") {
        toast.error("Please log out and log back in to change your password.");
      } else {
        toast.error("Failed to change password. Account may be managed by an external provider.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading || prefsLoading) {
    return (
      <StudentPageContainer>
        <StudentPageHeader title="Settings" description="Loading..." icon={<Wrench className="w-5 h-5" />} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentPageContainer>
    );
  }

  return (
    <StudentPageContainer>
      <StudentPageHeader
        title={t.nav?.settings || "Settings"}
        description={dir === "rtl" ? "إعدادات الحساب." : "Account Settings."}
        icon={<Wrench className="w-5 h-5" />}
      />
      <div className="mt-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Tabs List */}
        <Tabs defaultValue="account" className="w-full md:flex md:gap-6">
          <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent space-y-1 p-0 sticky top-24">
            <TabsTrigger value="account" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md">
              <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> Account
            </TabsTrigger>
            <TabsTrigger value="studies" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md">
              <BookOpen className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> Studies
            </TabsTrigger>
            <TabsTrigger value="goals" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md">
              <Target className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> Goals
            </TabsTrigger>
            <TabsTrigger value="interests" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md">
              <Brain className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> Interests & Skills
            </TabsTrigger>
            <TabsTrigger value="enrichment" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md">
              <Briefcase className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> Enrichment
            </TabsTrigger>
            <TabsTrigger value="preferences" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md">
              <Globe className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> Preferences
            </TabsTrigger>
            <TabsTrigger value="password" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md">
              <Lock className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> Password
            </TabsTrigger>
            <TabsTrigger value="privacy" className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md">
              <Shield className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> Privacy & Security
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <div className="flex-1 mt-6 md:mt-0">
            <TabsContent value="account" className="mt-0 focus-visible:outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your basic account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={accountData.name}
                      onChange={(e) => setAccountData(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={currentUser?.email || ""} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {currentUser?.emailVerified ? "Verified" : "Unverified"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={authProfile?.role || "student"} disabled className="bg-muted capitalize" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4">
                  <Button onClick={handleSaveAccount} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Account
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="studies" className="mt-0 focus-visible:outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Studies</CardTitle>
                  <CardDescription>Your current academic status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studyProgram">Study Program / Major</Label>
                    <Input 
                      id="studyProgram" 
                      value={profileData.studyProgram}
                      onChange={(e) => setProfileData(p => ({ ...p, studyProgram: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicStage">Academic Stage</Label>
                    <Select value={profileData.academicStage} onValueChange={(v) => setProfileData(p => ({ ...p, academicStage: v }))}>
                      <SelectTrigger id="academicStage">
                        <SelectValue placeholder="Select Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="foundation">Foundation</SelectItem>
                        <SelectItem value="year_1">Year 1</SelectItem>
                        <SelectItem value="year_2">Year 2</SelectItem>
                        <SelectItem value="year_3">Year 3</SelectItem>
                        <SelectItem value="year_4">Year 4</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Studies
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="mt-0 focus-visible:outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Goals</CardTitle>
                  <CardDescription>Set your primary objective and career path.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryGoal">Primary Goal</Label>
                    <Input 
                      id="primaryGoal" 
                      placeholder="e.g. Become a Full Stack Developer" 
                      value={profileData.primaryGoal}
                      onChange={(e) => setProfileData(p => ({ ...p, primaryGoal: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryGoals">Secondary Goals (comma-separated)</Label>
                    <Input 
                      id="secondaryGoals" 
                      placeholder="e.g. Learn React, Master Node.js" 
                      value={profileData.secondaryGoals}
                      onChange={(e) => setProfileData(p => ({ ...p, secondaryGoals: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="careerPath">Preferred Career Path</Label>
                    <Select value={profileData.preferredCareerPathId} onValueChange={(v) => setProfileData(p => ({ ...p, preferredCareerPathId: v }))}>
                      <SelectTrigger id="careerPath">
                        <SelectValue placeholder="Select Career Path" />
                      </SelectTrigger>
                      <SelectContent>
                        {pathsLoading ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          careerPaths.map((path: any) => (
                            <SelectItem key={path.id} value={path.id}>{path.title}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Goals
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="interests" className="mt-0 focus-visible:outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Interests & Skills</CardTitle>
                  <CardDescription>Topics you enjoy and skills you want to develop.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="technicalInterests">Technical Interests (comma-separated IDs/tags)</Label>
                    <Input 
                      id="technicalInterests" 
                      placeholder="e.g. Web Development, AI" 
                      value={profileData.technicalInterests}
                      onChange={(e) => setProfileData(p => ({ ...p, technicalInterests: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetSkills">Target Skills (comma-separated IDs/tags)</Label>
                    <Input 
                      id="targetSkills" 
                      placeholder="e.g. React, Python" 
                      value={profileData.targetSkills}
                      onChange={(e) => setProfileData(p => ({ ...p, targetSkills: e.target.value }))}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Interests
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="enrichment" className="mt-0 focus-visible:outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Optional Enrichment</CardTitle>
                  <CardDescription>Add bio and professional links to complete your profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell us a little about yourself" 
                      value={profileData.bio}
                      onChange={(e) => setProfileData(p => ({ ...p, bio: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input 
                      id="github" 
                      type="url"
                      placeholder="https://github.com/..." 
                      value={profileData.github}
                      onChange={(e) => setProfileData(p => ({ ...p, github: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input 
                      id="linkedin" 
                      type="url"
                      placeholder="https://linkedin.com/in/..." 
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData(p => ({ ...p, linkedin: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio URL</Label>
                    <Input 
                      id="portfolio" 
                      type="url"
                      placeholder="https://..." 
                      value={profileData.portfolio}
                      onChange={(e) => setProfileData(p => ({ ...p, portfolio: e.target.value }))}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Enrichment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0 focus-visible:outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your app language, theme, and notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={prefsData.language} onValueChange={(v) => setPrefsData(p => ({ ...p, language: v }))}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={prefsData.theme} onValueChange={(v) => setPrefsData(p => ({ ...p, theme: v }))}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates and alerts via email.</p>
                    </div>
                    <Switch 
                      id="emailNotifications"
                      checked={prefsData.emailNotifications}
                      onCheckedChange={(c) => setPrefsData(p => ({ ...p, emailNotifications: c }))}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4">
                  <Button onClick={handleSavePrefs} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="password" className="mt-0 focus-visible:outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Password Management</CardTitle>
                  <CardDescription>Securely change your password. You will need your current password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4">
                  <Button onClick={handleChangePassword} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0 focus-visible:outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>Understanding how your data is handled.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground font-medium">Public Data:</strong> Your public profile is minimal, containing only your name and general status. It does not include sensitive preferences.
                  </p>
                  <p>
                    <strong className="text-foreground font-medium">Private Profile:</strong> Detailed goals, interests, and academic stages are stored securely and are only visible to you.
                  </p>
                  <p>
                    <strong className="text-foreground font-medium">Role Management:</strong> Your account role (student/admin) is securely managed and cannot be changed from this dashboard.
                  </p>
                  <p>
                    <strong className="text-foreground font-medium">CV & Projects:</strong> Notes, generated CVs, and project submissions remain completely private unless you explicitly choose to publish them in future phases.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </StudentPageContainer>
  );
}
