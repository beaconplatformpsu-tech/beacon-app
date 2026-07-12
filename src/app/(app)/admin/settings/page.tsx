"use client";

import { useState, useEffect } from "react";
import { Settings, Save, ShieldAlert, Bell, Globe, Image as ImageIcon, Phone, Mail, Facebook, Twitter, Linkedin, Loader2, Link as LinkIcon } from "lucide-react";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { adminService } from "@/features/admin/services/adminService";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/i18n/LanguageProvider";

export default function AdminSettingsPage() {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = useT();
  
  const [settings, setSettings] = useState({
    // General
    siteName: "Beacon",
    logoUrl: "",
    // Contact
    contactEmail: "",
    contactPhone: "",
    // Social Links
    facebookUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    // Features
    maintenanceMode: false,
    publicRegistration: true,
    emailNotifications: true,
  });

  useEffect(() => {
    const settingsRef = ref(db, "platform_settings/public");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings((prev) => ({ ...prev, ...snapshot.val() }));
      }
      setLoading(false);
    }, (error) => {
      toast.error(t.adminSettings.error, t.adminSettings.failedLoad);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleSave = async () => {
    if (!session?.uid) return;
    setSaving(true);
    try {
      await adminService.updatePlatformSettings(session.uid, settings);
      toast.success(t.adminSettings.settingsSaved, t.adminSettings.configUpdated);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(t.adminSettings.saveFailed, errorMessage || t.adminSettings.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t.adminSettings.title}</h1>
        <p className="text-muted-foreground mt-1">{t.adminSettings.subtitle}</p>
      </div>

      <div className="grid gap-6">
        {/* General Configuration */}
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-blue-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" /> {t.adminSettings.generalIdentity}
            </CardTitle>
            <CardDescription>{t.adminSettings.basicBranding}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.adminSettings.platformName}</label>
              <Input 
                value={settings.siteName} 
                onChange={e => handleChange('siteName', e.target.value)} 
                placeholder={t.adminSettings.egBeacon}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" /> {t.adminSettings.logoUrl}
              </label>
              <Input 
                value={settings.logoUrl} 
                onChange={e => handleChange('logoUrl', e.target.value)} 
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">{t.adminSettings.logoUrlDesc}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-emerald-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-500" /> {t.adminSettings.contactInfo}
            </CardTitle>
            <CardDescription>{t.adminSettings.contactInfoDesc}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {t.adminSettings.supportEmail}
              </label>
              <Input 
                type="email"
                value={settings.contactEmail} 
                onChange={e => handleChange('contactEmail', e.target.value)} 
                placeholder="support@beacon.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> {t.adminSettings.phoneNumber}
              </label>
              <Input 
                type="tel"
                value={settings.contactPhone} 
                onChange={e => handleChange('contactPhone', e.target.value)} 
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-indigo-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-indigo-500" /> {t.adminSettings.socialLinks}
            </CardTitle>
            <CardDescription>{t.adminSettings.socialLinksDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" /> {t.adminSettings.facebookProfile}
              </label>
              <Input 
                value={settings.facebookUrl} 
                onChange={e => handleChange('facebookUrl', e.target.value)} 
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Twitter className="h-4 w-4 text-sky-500" /> {t.adminSettings.twitterProfile}
              </label>
              <Input 
                value={settings.twitterUrl} 
                onChange={e => handleChange('twitterUrl', e.target.value)} 
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-700" /> {t.adminSettings.linkedinPage}
              </label>
              <Input 
                value={settings.linkedinUrl} 
                onChange={e => handleChange('linkedinUrl', e.target.value)} 
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* System Toggles */}
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-amber-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-500" /> {t.adminSettings.systemFeatures}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t.adminSettings.publicRegistration}</label>
                <p className="text-xs text-muted-foreground">{t.adminSettings.publicRegDesc}</p>
              </div>
              <Switch 
                checked={settings.publicRegistration}
                onCheckedChange={c => handleChange('publicRegistration', c)}
              />
            </div>
            
            <div className="flex items-center justify-between border-t border-border/50 pt-6">
              <div className="space-y-0.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" /> {t.adminSettings.emailNotifications}
                </label>
                <p className="text-xs text-muted-foreground">{t.adminSettings.emailNotifDesc}</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={c => handleChange('emailNotifications', c)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-destructive" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> {t.adminSettings.dangerZone}
            </CardTitle>
            <CardDescription>{t.adminSettings.dangerZoneDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-foreground">{t.adminSettings.maintenanceMode}</label>
                <p className="text-xs text-muted-foreground">{t.adminSettings.maintenanceModeDesc}</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={c => {
                  handleChange('maintenanceMode', c);
                  if (c) toast.warning(t.adminSettings.maintenanceWarning, t.adminSettings.maintenanceWarningDesc);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end sticky bottom-6 z-10 pt-4">
        <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
          {saving ? (
            <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-5 w-5 animate-spin" /> {t.adminSettings.savingConfig}</span>
          ) : (
            <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Save className="h-5 w-5" /> {t.adminSettings.saveSettings}</span>
          )}
        </Button>
      </div>
    </div>
  );
}
