"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Layers, MoreVertical, LayoutList } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { ref, onValue } from "firebase/database";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { adminService } from "@/features/admin/services/adminService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LearningPath = { id: string; title: string; slug?: string; description?: string; categoryId?: string; level?: string; estimatedHours?: string; isActive?: boolean };
type Path = { id: string; title: string };
type Resource = { id: string; title: string };
type PracticeTask = { id: string; title: string };
type Project = { id: string; title: string };
type Quiz = { id: string; title: string };

type Step = {
  id: string;
  stepId: string;
  type: "resource" | "practice" | "project" | "quiz";
  contentId: string;
  order: number;
  isRequired: boolean;
};

export function LearningPathsManager({ learningPaths, paths, resources, practiceTasks, projects, quizzes }: { learningPaths: LearningPath[]; paths: Path[]; resources: Resource[]; practiceTasks: PracticeTask[]; projects: Project[]; quizzes: Quiz[] }) {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", slug: "", description: "", categoryId: "", level: "Beginner", estimatedHours: "", isActive: true });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepsMap, setStepsMap] = useState<Record<string, Step[]>>({});

  useEffect(() => {
    const unsub = onValue(ref(db, "relations/learning_path_steps"), s => {
      const d = s.val() || {};
      const newMap: Record<string, Step[]> = {};
      Object.keys(d).forEach(pathId => {
        newMap[pathId] = Object.values(d[pathId]);
      });
      setStepsMap(newMap);
    });
    return () => unsub();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ title: "", slug: "", description: "", categoryId: "", level: "Beginner", estimatedHours: "", isActive: true });
    setIsOpen(true);
  };

  const openEdit = (lp: LearningPath) => {
    setEditingId(lp.id);
    setFormData({ title: lp.title || "", slug: lp.slug || "", description: lp.description || "", categoryId: lp.categoryId || "", level: lp.level || "Beginner", estimatedHours: lp.estimatedHours || "", isActive: lp.isActive !== false });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.uid) return;
    try { await adminService.deleteContent(session.uid, "public_content/learning_paths", id); toast.success("Deleted", "Learning path removed."); }
    catch { toast.error("Error", "Failed to delete."); }
  };

  const handleSubmit = async () => {
    if (!formData.title) { toast.warning("Validation", "Title is required."); return; }
    if (formData.estimatedHours && (isNaN(Number(formData.estimatedHours)) || Number(formData.estimatedHours) < 0)) {
      toast.warning("Validation", "Estimated Hours must be a positive number."); return;
    }
    
    if (!session?.uid) return;
    
    // Clean payload (remove undefined values for Firebase)
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== undefined)
    );

    setLoading(true);
    try {
      if (editingId) { await adminService.updateContent(session.uid, "public_content/learning_paths", editingId, payload); toast.success("Updated", "Updated."); }
      else { await adminService.createContent(session.uid, "public_content/learning_paths", payload); toast.success("Created", "Created."); }
      setIsOpen(false);
    } catch { toast.error("Error", "Failed to save."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-xl">
            <LayoutList className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Learning Paths</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage step-by-step learning modules and curriculum.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"><Plus className="h-4 w-4" /> Add Learning Path</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {learningPaths.map((lp) => {
          return (
            <Card key={lp.id} className="group relative bg-card border border-border/60 hover:border-indigo-500/40 rounded-2xl p-5 transition-all duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-lg text-foreground tracking-tight line-clamp-1">{lp.title}</h3>
                  {lp.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{lp.description}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-label="Actions" variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={() => openEdit(lp)} className="cursor-pointer py-2">
                      <Edit2 className="mr-2 h-4 w-4 text-sky-500" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setItemToDelete(lp.id)} className="cursor-pointer py-2 focus:bg-red-500/10 text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/50">
                {lp.level && <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">{lp.level}</Badge>}
                {!lp.isActive && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
                <Badge variant="outline" className="text-[10px] ml-auto">
                  {(stepsMap[lp.id] || []).length} Steps
                </Badge>
              </div>
            </Card>
          );
        })}
        {learningPaths.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card/30">
            <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No Learning Paths</h3>
            <p className="text-muted-foreground text-sm mt-1">Create guided curriculums to organize content.</p>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl">{editingId ? "Edit Learning Path" : "New Learning Path"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Title <span className="text-destructive">*</span></Label>
              <Input className="h-11 rounded-xl bg-muted/50 border-border" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Intro to Data Science" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Slug</Label>
              <Input className="h-11 rounded-xl bg-muted/50 border-border" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. intro-to-data-science" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea className="rounded-xl bg-muted/50 border-border resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Level</Label>
                <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                  {["Beginner", "Intermediate", "Advanced"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Estimated Hours</Label>
                <Input className="h-11 rounded-xl bg-muted/50 border-border" value={formData.estimatedHours} onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })} placeholder="e.g. 10 hours" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded border-border text-primary" />
                Is Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="rounded-xl px-6">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) { handleDelete(itemToDelete); setItemToDelete(null); }
        }}
        title="Delete Learning Path?"
        description="Are you sure? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
