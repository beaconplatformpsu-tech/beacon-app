"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Link2, MoreVertical, Zap } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { adminService } from "@/features/admin/services/adminService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type Skill = { id: string; name: string; description?: string };
type Path = { id: string; title: string; skills?: Record<string, boolean> };
type Resource = { id: string; title: string; skillId?: string; resourceType?: string; url?: string };
type Category = { id: string; name: string };

export function SkillsManager({ skills, paths, resources, categories }: { skills: Skill[]; paths: Path[]; resources: Resource[]; categories: Category[] }) {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openNew = () => { setEditingId(null); setFormData({ name: "", description: "" }); setIsOpen(true); };
  const openEdit = (skill: Skill) => { setEditingId(skill.id); setFormData({ name: skill.name || "", description: skill.description || "" }); setIsOpen(true); };

  const handleDelete = async (id: string) => {
    if (!session?.uid) return;
    try { await adminService.deleteContent(session.uid, "public_content/skills", id); toast.success("Deleted", "Skill removed."); }
    catch { toast.error("Error", "Could not delete."); }
  };

  const handleSave = async () => {
    if (!formData.name) { toast.warning("Validation", "Skill name is required."); return; }
    setLoading(true);
    try {
      if (!session?.uid) return;
      if (editingId) { await adminService.updateContent(session.uid, "public_content/skills", editingId, formData); toast.success("Updated", "Skill updated."); }
      else { await adminService.createContent(session.uid, "public_content/skills", formData); toast.success("Created", "Skill created."); }
      setIsOpen(false);
    } catch { toast.error("Error", "Failed to save."); }
    finally { setLoading(false); }
  };

  const getLinkedPaths = (skillId: string) =>
    paths.filter(p => p.skills && (p.skills as any)[skillId]);

  const getSkillResources = (skillId: string) =>
    resources.filter(r => r.skillId === skillId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/10 p-3 rounded-xl">
            <Zap className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Skills Library</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Master list of skills linked across your career paths.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"><Plus className="h-4 w-4" /> Add Skill</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {skills.map((skill) => {
          const linkedPaths = getLinkedPaths(skill.id);
          const skillResources = getSkillResources(skill.id);
          return (
            <div key={skill.id} className="group bg-card border border-border/60 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/10 shadow-inner group-hover:scale-110 transition-transform">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-label="Skill actions" variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={() => openEdit(skill)} className="cursor-pointer py-2">
                      <Edit2 className="mr-2 h-4 w-4 text-sky-500" /> Edit Skill
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setItemToDelete(skill.id)} className="cursor-pointer py-2 focus:bg-red-500/10 text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg text-foreground tracking-tight line-clamp-1">{skill.name}</h3>
                {skill.description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{skill.description}</p>}
              </div>

              <div className="space-y-3 pt-4 mt-4 border-t border-border/50">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Link2 className="h-3 w-3" /> Linked Paths ({linkedPaths.length})
                  </p>
                  {linkedPaths.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 italic">Not linked to any path yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {linkedPaths.map(p => <Badge key={p.id} variant="secondary" className="bg-muted text-[10px] text-muted-foreground">{p.title}</Badge>)}
                    </div>
                  )}
                </div>
                
                {skillResources.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Resources ({skillResources.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillResources.slice(0, 3).map(r => (
                        <a key={r.id} href={r.url} target="_blank" rel="noreferrer">
                          <Badge variant="outline" className="text-[10px] border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 cursor-pointer transition-colors">
                            {r.resourceType}: {r.title.length > 15 ? r.title.slice(0, 15) + "..." : r.title}
                          </Badge>
                        </a>
                      ))}
                      {skillResources.length > 3 && <Badge variant="secondary" className="text-[10px]">+{skillResources.length - 3} more</Badge>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {skills.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card/30">
            <Zap className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No Skills Library</h3>
            <p className="text-muted-foreground text-sm mt-1">Create skills to link them to your paths.</p>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl">{editingId ? "Edit Skill" : "New Skill"}</DialogTitle></DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Skill Name <span className="text-destructive">*</span></Label>
              <Input 
                className="h-11 rounded-xl bg-muted/50 focus:bg-background"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g. React.js" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea 
                className="rounded-xl bg-muted/50 focus:bg-background resize-none"
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Briefly describe this skill..." 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className="rounded-xl px-6">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : "Save Skill"}
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
        title="Delete Skill?"
        description="Are you sure you want to delete this skill? It will be unlinked from all career paths. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
