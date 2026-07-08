"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Link2, BookOpen, ChevronDown, ChevronRight, Briefcase, MoreVertical, GraduationCap, TrendingUp } from "lucide-react";
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

type Path = { id: string; title: string; description?: string; industryDomain?: string; categoryId?: string; demandLevel?: string; requiredEducation?: string; skills?: Record<string, boolean> };
type Skill = { id: string; name: string; description?: string };
type Resource = { id: string; title: string; skillId?: string; careerPathId?: string; resourceType?: string; url?: string; level?: string; categoryId?: string };
type Category = { id: string; name: string };

export function PathsManager({ paths, categories, skills, resources }: { paths: Path[]; categories: Category[]; skills: Skill[]; resources: Resource[] }) {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"skills" | "resources">("skills");
  const [formData, setFormData] = useState({ title: "", description: "", categoryId: "", industryDomain: "", demandLevel: "High", requiredEducation: "Bachelor's Degree" });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openNew = () => {
    setEditingId(null);
    const firstCat = categories[0];
    setFormData({ title: "", description: "", categoryId: firstCat?.id || "", industryDomain: firstCat?.name || "", demandLevel: "High", requiredEducation: "Bachelor's Degree" });
    setIsOpen(true);
  };

  const openEdit = (path: Path) => {
    setEditingId(path.id);
    setFormData({ title: path.title || "", description: path.description || "", categoryId: path.categoryId || "", industryDomain: path.industryDomain || "", demandLevel: path.demandLevel || "High", requiredEducation: path.requiredEducation || "Bachelor's Degree" });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.uid) return;
    try { await adminService.deleteContent(session.uid, "career_paths", id); toast.success("Deleted", "Career path removed."); }
    catch { toast.error("Error", "Failed to delete path."); }
  };

  const handleSubmit = async () => {
    if (!formData.title) { toast.warning("Validation", "Path title is required."); return; }
    if (!session?.uid) return;
    const cat = categories.find(c => c.id === formData.categoryId);
    const payload = { title: formData.title, description: formData.description, categoryId: formData.categoryId, industryDomain: cat?.name || formData.industryDomain, demandLevel: formData.demandLevel, requiredEducation: formData.requiredEducation };
    setLoading(true);
    try {
      if (editingId) { await adminService.updateContent(session.uid, "career_paths", editingId, payload); toast.success("Updated", "Career path updated."); }
      else { await adminService.createContent(session.uid, "career_paths", payload); toast.success("Created", "Career path created."); }
      setIsOpen(false);
    } catch { toast.error("Error", "Failed to save."); }
    finally { setLoading(false); }
  };

  const toggleSkill = async (pathId: string, skillId: string, linked: boolean) => {
    if (!session?.uid) return;
    try {
      await adminService.toggleCareerPathSkill(session.uid, pathId, skillId, linked);
      toast.success(linked ? "Unlinked" : "Linked", linked ? "Skill removed from path." : "Skill added to path.");
    } catch { toast.error("Error", "Failed to update skill link."); }
  };

  const getLinkedSkillIds = (path: Path) => path.skills ? Object.keys(path.skills).filter(k => (path.skills as any)[k]) : [];
  const getPathResources = (pathId: string) => resources.filter(r => r.careerPathId === pathId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-sky-500/10 p-3 rounded-xl">
            <Briefcase className="h-6 w-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Career Paths</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Define structured journeys and link them to required skills.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"><Plus className="h-4 w-4" /> Add Path</Button>
      </div>

      <div className="space-y-4">
        {paths.length === 0 && (
          <div className="text-center py-20 text-muted-foreground border-2 rounded-3xl border-dashed border-border/60 bg-card/30 flex flex-col items-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Career Paths Found</h3>
            <p className="text-sm mt-1">Create your first career path to start linking skills.</p>
          </div>
        )}
        {paths.map((path) => {
          const isExpanded = expandedPath === path.id;
          const linkedSkillIds = getLinkedSkillIds(path);
          const pathResources = getPathResources(path.id);
          const cat = categories.find(c => c.id === path.categoryId);
          
          return (
            <Card key={path.id} className={`overflow-hidden transition-all duration-300 border-border/60 ${isExpanded ? "ring-1 ring-primary/30 shadow-lg shadow-primary/5" : "hover:border-primary/40 hover:shadow-md"}`}>
              <div className="p-5 flex items-start gap-4 cursor-pointer" onClick={(e) => {
                // Prevent expanding if clicking dropdown
                if ((e.target as HTMLElement).closest('.action-menu')) return;
                setExpandedPath(isExpanded ? null : path.id); 
                setActiveSubTab("skills");
              }}>
                <button className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"}`}>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg tracking-tight text-foreground">{path.title}</h3>
                      {path.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed max-w-3xl">{path.description}</p>}
                    </div>
                    
                    <div className="action-menu ml-4 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-label="Path actions" variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted data-[state=open]:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(path)} className="cursor-pointer py-2">
                            <Edit2 className="mr-2 h-4 w-4 text-sky-500" /> Edit Path
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setItemToDelete(path.id)} className="cursor-pointer py-2 focus:bg-red-500/10 text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {(cat?.name || path.industryDomain) && (
                      <div className="flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {cat?.name || path.industryDomain}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border">
                      <TrendingUp className="h-3 w-3" /> {path.demandLevel || "?"} Demand
                    </div>
                    {path.requiredEducation && (
                      <div className="flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border">
                        <GraduationCap className="h-3 w-3" /> {path.requiredEducation}
                      </div>
                    )}
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-full px-2.5 shadow-sm">
                      <Link2 className="h-3 w-3 mr-1" /> {linkedSkillIds.length} Skills
                    </Badge>
                    <Badge variant="secondary" className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50 rounded-full px-2.5 shadow-sm">
                      <BookOpen className="h-3 w-3 mr-1" /> {pathResources.length} Resources
                    </Badge>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border bg-muted/20 pb-4">
                  <div className="flex p-3 px-5 gap-2 border-b border-border/50 bg-muted/40">
                    {(["skills", "resources"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveSubTab(tab)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          activeSubTab === tab 
                            ? "bg-background text-primary shadow-sm border border-border/50" 
                            : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                        }`}>
                        {tab === "skills" ? <Link2 className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                        <span className="capitalize">{tab}</span>
                        <span className="bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded-md text-[10px] ml-1">
                          {tab === "skills" ? linkedSkillIds.length : pathResources.length}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-5 px-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {activeSubTab === "skills" && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">Link required skills to this career path:</p>
                        {skills.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-border bg-background text-center text-sm text-muted-foreground">
                            No skills available. Create them in the Skills Library first.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {skills.map(skill => {
                              const isLinked = linkedSkillIds.includes(skill.id);
                              return (
                                <button 
                                  key={skill.id} 
                                  onClick={() => toggleSkill(path.id, skill.id, isLinked)} 
                                  title={skill.description}
                                  className={`group flex items-center justify-between text-left p-3 rounded-xl border transition-all duration-200 ${
                                    isLinked 
                                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 hover:bg-primary/90" 
                                      : "bg-background text-foreground border-border hover:border-primary/50 hover:shadow-sm"
                                  }`}
                                >
                                  <span className="text-sm font-semibold truncate pr-2">{skill.name}</span>
                                  <div className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center border transition-colors ${isLinked ? "bg-primary-foreground/20 border-primary-foreground/30" : "bg-muted border-border group-hover:border-primary/40"}`}>
                                    {isLinked && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeSubTab === "resources" && (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">Resources directly linked to this path:</p>
                        {pathResources.length === 0 ? (
                          <div className="p-4 rounded-xl border border-dashed border-border bg-background text-center text-sm text-muted-foreground">
                            No resources linked yet. Add resources from the Resources tab.
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {pathResources.map(res => {
                              const linkedSkill = skills.find(s => s.id === res.skillId);
                              return (
                                <div key={res.id} className="group flex items-start gap-3 p-4 rounded-xl bg-background border border-border shadow-sm hover:border-sky-500/30 transition-colors">
                                  <div className="bg-sky-500/10 p-2 rounded-lg text-sky-600 mt-0.5">
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <a href={res.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline truncate block">
                                      {res.title}
                                    </a>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                      <Badge variant="outline" className="text-[10px] bg-muted">{res.resourceType}</Badge>
                                      {res.level && <Badge variant="secondary" className="text-[10px]">{res.level}</Badge>}
                                      {linkedSkill && <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50">Skill: {linkedSkill.name}</Badge>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingId ? "Edit Career Path" : "New Career Path"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Path Title <span className="text-destructive">*</span></Label>
              <Input 
                className="h-11 rounded-xl bg-muted/50 focus:bg-background"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="e.g. Full Stack Developer" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Industry Domain <span className="text-destructive">*</span></Label>
              <select 
                className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none transition-colors"
                value={formData.categoryId} 
                onChange={e => { const cat = categories.find(c => c.id === e.target.value); setFormData({ ...formData, categoryId: e.target.value, industryDomain: cat?.name || "" }); }}>
                <option value="">Select a Domain</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea 
                className="rounded-xl bg-muted/50 focus:bg-background resize-none min-h-[100px]"
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Detailed description of the responsibilities and outlook for this path..." 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Demand Level</Label>
                <select 
                  className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none transition-colors"
                  value={formData.demandLevel} 
                  onChange={e => setFormData({ ...formData, demandLevel: e.target.value })}>
                  {["Low", "Medium", "High", "Very High"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Required Education</Label>
                <Input 
                  className="h-11 rounded-xl bg-muted/50 focus:bg-background"
                  value={formData.requiredEducation} 
                  onChange={e => setFormData({ ...formData, requiredEducation: e.target.value })} 
                  placeholder="e.g. Bachelor's Degree" 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="rounded-xl px-6">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : "Save Path"}
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
        title="Delete Career Path?"
        description="Are you sure you want to delete this career path? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
