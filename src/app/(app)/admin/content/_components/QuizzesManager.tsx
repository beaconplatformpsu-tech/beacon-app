"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, CheckSquare, MoreVertical } from "lucide-react";
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

type Quiz = { id: string; title: string; slug?: string; description?: string; skillId?: string; difficultyLevel?: string; timeLimitMinutes?: string; passingScore?: string; isActive?: boolean };
type Skill = { id: string; name: string };

export function QuizzesManager({ quizzes, skills }: { quizzes: Quiz[]; skills: Skill[] }) {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", slug: "", description: "", skillId: "", difficultyLevel: "Beginner", timeLimitMinutes: "15", passingScore: "70", isActive: true });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setFormData({ title: "", slug: "", description: "", skillId: "", difficultyLevel: "Beginner", timeLimitMinutes: "15", passingScore: "70", isActive: true });
    setIsOpen(true);
  };

  const openEdit = (quiz: Quiz) => {
    setEditingId(quiz.id);
    setFormData({ title: quiz.title || "", slug: quiz.slug || "", description: quiz.description || "", skillId: quiz.skillId || "", difficultyLevel: quiz.difficultyLevel || "Beginner", timeLimitMinutes: quiz.timeLimitMinutes || "15", passingScore: quiz.passingScore || "70", isActive: quiz.isActive !== false });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.uid) return;
    try { await adminService.deleteContent(session.uid, "public_content/quizzes", id); toast.success("Deleted", "Quiz removed."); }
    catch { toast.error("Error", "Failed to delete."); }
  };

  const handleSubmit = async () => {
    if (!formData.title) { toast.warning("Validation", "Title is required."); return; }
    if (!session?.uid) return;
    const payload = { ...formData };
    setLoading(true);
    try {
      if (editingId) { await adminService.updateContent(session.uid, "public_content/quizzes", editingId, payload); toast.success("Updated", "Updated."); }
      else { await adminService.createContent(session.uid, "public_content/quizzes", payload); toast.success("Created", "Created."); }
      setIsOpen(false);
    } catch { toast.error("Error", "Failed to save."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-purple-500/10 p-3 rounded-xl">
            <CheckSquare className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Quizzes</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage knowledge assessments and multiple-choice tests.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"><Plus className="h-4 w-4" /> Add Quiz</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          const linkedSkill = skills.find(s => s.id === quiz.skillId);
          return (
            <Card key={quiz.id} className="group relative bg-card border border-border/60 hover:border-purple-500/40 rounded-2xl p-5 transition-all duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-lg text-foreground tracking-tight line-clamp-1">{quiz.title}</h3>
                  {quiz.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{quiz.description}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-label="Actions" variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={() => openEdit(quiz)} className="cursor-pointer py-2">
                      <Edit2 className="mr-2 h-4 w-4 text-sky-500" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setItemToDelete(quiz.id)} className="cursor-pointer py-2 focus:bg-red-500/10 text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/50">
                {quiz.difficultyLevel && <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">{quiz.difficultyLevel}</Badge>}
                {!quiz.isActive && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
                {linkedSkill && <Badge variant="outline" className="text-[10px] ml-auto">Skill: {linkedSkill.name}</Badge>}
              </div>
            </Card>
          );
        })}
        {quizzes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card/30">
            <CheckSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No Quizzes</h3>
            <p className="text-muted-foreground text-sm mt-1">Create multiple choice tests to evaluate knowledge.</p>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl">{editingId ? "Edit Quiz Metadata" : "New Quiz"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Title <span className="text-destructive">*</span></Label>
              <Input className="h-11 rounded-xl bg-muted/50 border-border" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. React Basics Quiz" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Slug</Label>
              <Input className="h-11 rounded-xl bg-muted/50 border-border" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. react-basics-quiz" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea className="rounded-xl bg-muted/50 border-border resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Skill (Optional)</Label>
                <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none" value={formData.skillId} onChange={e => setFormData({ ...formData, skillId: e.target.value })}>
                  <option value="">None / General</option>
                  {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Difficulty Level</Label>
                <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none" value={formData.difficultyLevel} onChange={e => setFormData({ ...formData, difficultyLevel: e.target.value })}>
                  {["Beginner", "Intermediate", "Advanced"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Time Limit (Min)</Label>
                <Input type="number" className="h-11 rounded-xl bg-muted/50 border-border" value={formData.timeLimitMinutes} onChange={e => setFormData({ ...formData, timeLimitMinutes: e.target.value })} placeholder="e.g. 15" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Passing Score (%)</Label>
                <Input type="number" className="h-11 rounded-xl bg-muted/50 border-border" value={formData.passingScore} onChange={e => setFormData({ ...formData, passingScore: e.target.value })} placeholder="e.g. 70" />
              </div>
              <div className="space-y-2 pt-8">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded border-border text-primary" />
                  Is Active
                </label>
              </div>
            </div>
            <div className="p-4 bg-muted/40 rounded-xl border border-border text-sm text-muted-foreground mt-4">
              <p><strong>Note:</strong> Quiz questions are managed separately in the Quiz Builder (coming soon).</p>
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
        title="Delete Quiz?"
        description="Are you sure? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
