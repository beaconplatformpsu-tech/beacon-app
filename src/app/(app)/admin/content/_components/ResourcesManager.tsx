"use client";

import { useState } from "react";
import { FileText, Link as LinkIcon, Plus, Video, Trash2, Edit, AlertCircle, FileArchive, Edit2, UploadCloud, Loader2, Filter, BookOpen, MoreVertical, Database } from "lucide-react";
import { storage, db } from "@/lib/firebase/config";
import { uploadFileToFirebase } from "@/lib/firebase/storage";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { adminService } from "../../../../../features/admin/services/adminService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Resource = { id: string; title: string; skillId?: string; careerPathId?: string; categoryId?: string; resourceType?: string; url?: string; level?: string };
type Path = { id: string; title: string };
type Skill = { id: string; name: string };
type Category = { id: string; name: string };

const RESOURCE_TYPES = ["Document", "Video", "Course", "Article", "Tool", "Book", "Practice"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

export function ResourcesManager({ resources, paths, skills, categories }: { resources: Resource[]; paths: Path[]; skills: Skill[]; categories: Category[] }) {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterPath, setFilterPath] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    resourceType: "Document",
    careerPathId: "",
    skillId: "",
    categoryId: "",
    level: "All Levels",
    url: "",
  });

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"link" | "file">("link");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setFormData({ title: "", resourceType: "Document", careerPathId: "", skillId: "", categoryId: "", level: "All Levels", url: "" });
    setFileToUpload(null);
    setUploadMode("link");
    setIsOpen(true);
  };

  const openEdit = (res: Resource) => {
    setEditingId(res.id);
    setFormData({
      title: res.title || "",
      resourceType: res.resourceType || "Document",
      careerPathId: res.careerPathId || "",
      skillId: res.skillId || "",
      categoryId: res.categoryId || "",
      level: res.level || "All Levels",
      url: res.url || "",
    });
    setFileToUpload(null);
    setUploadMode("link");
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.uid) return;
    try { await adminService.deleteContent(session.uid, "public_content/resources", id); toast.success("Deleted", "Resource removed."); }
    catch { toast.error("Error", "Failed to delete."); }
  };

  const handleSubmit = async () => {
    if (!formData.title) { toast.warning("Validation", "Title is required."); return; }
    if (uploadMode === "link" && !formData.url) { toast.warning("Validation", "URL is required."); return; }
    if (uploadMode === "file" && !fileToUpload && !editingId) { toast.warning("Validation", "Please select a file."); return; }

    setLoading(true);
    try {
      let finalUrl = formData.url;
      if (uploadMode === "file" && fileToUpload) {
        const ext = fileToUpload.name.split(".").pop();
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const path = `resources/${fileName}`;
        
        finalUrl = await uploadFileToFirebase(fileToUpload, path, {
          maxSizeMB: 10,
          allowedTypes: [
            'application/pdf', 
            'video/mp4', 
            'application/zip', 
            'application/x-zip-compressed',
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]
        });
      }

      const payload = {
        title: formData.title,
        resourceType: formData.resourceType,
        careerPathId: formData.careerPathId || null,
        skillId: formData.skillId || null,
        categoryId: formData.categoryId || null,
        level: formData.level,
        url: finalUrl,
        updatedAt: new Date().toISOString(),
      };

      if (!session?.uid) return;
      if (editingId) {
        await adminService.updateContent(session.uid, "public_content/resources", editingId, payload);
        toast.success("Updated", "Resource updated.");
      } else {
        await adminService.createContent(session.uid, "public_content/resources", payload);
        toast.success("Created", "Resource created.");
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error("Error", err.message || "Failed to save resource.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter(r => {
    if (filterPath && r.careerPathId !== filterPath) return false;
    if (filterSkill && r.skillId !== filterSkill) return false;
    if (filterCategory && r.categoryId !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-rose-500/10 p-3 rounded-xl">
            <Database className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Resource Center</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage external links and uploaded files for your students.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"><Plus className="h-4 w-4" /> Add Resource</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/60">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80 shrink-0 px-2">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="flex gap-3 flex-wrap flex-1 w-full">
          <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none flex-1 min-w-[140px]"
            value={filterPath} onChange={e => setFilterPath(e.target.value)}>
            <option value="">All Career Paths</option>
            {paths.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none flex-1 min-w-[140px]"
            value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
            <option value="">All Skills</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none flex-1 min-w-[140px]"
            value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Domains</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {(filterPath || filterSkill || filterCategory) && (
          <button onClick={() => { setFilterPath(""); setFilterSkill(""); setFilterCategory(""); }} className="text-sm font-medium text-destructive hover:underline shrink-0 px-2">
            Clear
          </button>
        )}
        <div className="text-xs font-semibold bg-background border border-border rounded-lg px-2.5 py-1.5 text-muted-foreground shrink-0 shadow-sm">
          {filtered.length} / {resources.length}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((res) => {
          const linkedPath = paths.find(p => p.id === res.careerPathId);
          const linkedSkill = skills.find(s => s.id === res.skillId);
          const linkedCategory = categories.find(c => c.id === res.categoryId);

          return (
            <div key={res.id} className="group bg-card border border-border/60 hover:border-rose-500/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3 gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 flex items-center justify-center border border-rose-500/10 shadow-inner">
                  {res.resourceType === "Video" || res.resourceType === "Course" ? <BookOpen className="h-4 w-4 text-rose-600" /> : <LinkIcon className="h-4 w-4 text-rose-600" />}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <a href={res.url} target="_blank" rel="noreferrer" className="font-bold text-[15px] text-foreground hover:text-primary transition-colors hover:underline line-clamp-2 leading-tight block">
                    {res.title}
                  </a>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="outline" className="text-[10px] bg-muted/50 border-border/60">{res.resourceType}</Badge>
                    {res.level && res.level !== "All Levels" && <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">{res.level}</Badge>}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-label="Resource actions" variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={() => openEdit(res)} className="cursor-pointer py-2">
                      <Edit2 className="mr-2 h-4 w-4 text-sky-500" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setItemToDelete(res.id)} className="cursor-pointer py-2 focus:bg-red-500/10 text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5 pt-3 mt-auto border-t border-border/50 bg-muted/20 -mx-5 -mb-5 p-4 rounded-b-2xl">
                {linkedCategory && (
                  <div className="text-[11px] text-muted-foreground flex gap-2">
                    <span className="font-semibold w-14 shrink-0">Domain:</span> <span className="truncate text-foreground">{linkedCategory.name}</span>
                  </div>
                )}
                {linkedPath && (
                  <div className="text-[11px] text-muted-foreground flex gap-2">
                    <span className="font-semibold w-14 shrink-0">Path:</span> <span className="truncate text-foreground">{linkedPath.title}</span>
                  </div>
                )}
                {linkedSkill && (
                  <div className="text-[11px] text-muted-foreground flex gap-2">
                    <span className="font-semibold w-14 shrink-0">Skill:</span> <span className="truncate text-foreground">{linkedSkill.name}</span>
                  </div>
                )}
                {!linkedCategory && !linkedPath && !linkedSkill && (
                  <div className="text-[11px] text-muted-foreground italic">General Resource (Not Linked)</div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground border-2 rounded-3xl border-dashed border-border/60 bg-card/30 flex flex-col items-center">
            <Database className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-medium text-foreground">No Resources Found</h3>
            <p className="text-sm mt-1">{resources.length === 0 ? "You haven't added any resources yet." : "No resources match your filters."}</p>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingId ? "Edit Resource" : "New Resource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Title <span className="text-destructive">*</span></Label>
              <Input
                className="h-11 rounded-xl bg-muted/50 focus:bg-background"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. React Official Documentation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Resource Type</Label>
                <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  value={formData.resourceType} onChange={e => setFormData({ ...formData, resourceType: e.target.value })}>
                  {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Difficulty Level</Label>
                <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Link to Domain (Optional)</Label>
              <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
                value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                <option value="">None / General</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Link to Career Path (Optional)</Label>
              <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
                value={formData.careerPathId} onChange={e => setFormData({ ...formData, careerPathId: e.target.value })}>
                <option value="">None / General</option>
                {paths.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Link to Specific Skill (Optional)</Label>
              <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
                value={formData.skillId} onChange={e => setFormData({ ...formData, skillId: e.target.value })}>
                <option value="">None / General</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <Label className="text-sm font-semibold text-primary">Content Source <span className="text-destructive">*</span></Label>
              <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border/60 w-max">
                <Button type="button" size="sm" variant={uploadMode === "link" ? "default" : "ghost"} className="rounded-lg gap-2" onClick={() => setUploadMode("link")}>
                  <LinkIcon className="h-4 w-4" /> External URL
                </Button>
                <Button type="button" size="sm" variant={uploadMode === "file" ? "default" : "ghost"} className="rounded-lg gap-2" onClick={() => setUploadMode("file")}>
                  <UploadCloud className="h-4 w-4" /> Upload File
                </Button>
              </div>

              {uploadMode === "link" ? (
                <Input
                  className="h-11 rounded-xl bg-muted/50 focus:bg-background mt-2"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/course"
                />
              ) : (
                <div className="mt-2 border-2 border-dashed border-primary/20 rounded-xl p-6 text-center bg-primary/5 hover:bg-primary/10 transition-colors">
                  <input type="file" id="res-upload" className="hidden" onChange={e => { if (e.target.files?.[0]) setFileToUpload(e.target.files[0]); }} />
                  <label htmlFor="res-upload" className="cursor-pointer flex flex-col items-center justify-center">
                    <div className="bg-background p-3 rounded-full shadow-sm mb-3">
                      <UploadCloud className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{fileToUpload ? fileToUpload.name : "Click to select a file"}</span>
                    {!fileToUpload && <span className="text-xs text-muted-foreground mt-1">PDF, DOCX, ZIP, MP4 (Max 10MB)</span>}
                  </label>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="rounded-xl px-6">
              {loading ? <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : "Save Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            handleDelete(itemToDelete);
            setItemToDelete(null);
          }
        }}
        title="Delete Resource?"
        description="Are you sure you want to delete this resource? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
