"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, MoreVertical, LayoutGrid } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { adminService } from "@/features/admin/services/adminService";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CategoriesManager({ 
  careerCategories, 
  academicCategories, 
  skillCategories 
}: { 
  careerCategories: any[],
  academicCategories: any[],
  skillCategories: any[]
}) {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", slug: "", sortOrder: 0, isActive: true });
  const [loading, setLoading] = useState(false);
  const [activeCategoryType, setActiveCategoryType] = useState<"career" | "academic" | "skill">("career");

  const getCollectionName = () => {
    switch (activeCategoryType) {
      case "academic": return "academic_categories";
      case "skill": return "skill_categories";
      default: return "career_categories";
    }
  };

  const getActiveCategories = () => {
    switch (activeCategoryType) {
      case "academic": return academicCategories;
      case "skill": return skillCategories;
      default: return careerCategories;
    }
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", slug: "", sortOrder: 0, isActive: true });
    setIsOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({ 
      name: cat.name || cat.title || "", 
      description: cat.description || "", 
      slug: cat.slug || "",
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive !== false
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.uid) return;
    try {
      await adminService.deleteContent(session.uid, `public_content/${getCollectionName()}`, id);
      toast.success("Deleted", "Category deleted successfully.");
    } catch (error: any) {
      toast.error("Error", "Failed to delete category.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.warning("Validation", "Category name is required.");
      return;
    }
    if (!session?.uid) return;

    setLoading(true);
    try {
      const collection = `public_content/${getCollectionName()}`;
      if (editingId) {
        await adminService.updateContent(session.uid, collection, editingId, formData);
        toast.success("Updated", "Category updated successfully.");
      } else {
        await adminService.createContent(session.uid, collection, formData);
        toast.success("Created", "Category created successfully.");
      }
      setIsOpen(false);
    } catch (err) {
      toast.error("Error", "Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">Manage Categories</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Manage domain, academic, and skill categories.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"><Plus className="h-4 w-4"/> Add Category</Button>
      </div>

      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-max border border-border/50">
        {[
          { id: "career", label: "Career Domains" },
          { id: "academic", label: "Academic Categories" },
          { id: "skill", label: "Skill Categories" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveCategoryType(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeCategoryType === t.id 
                ? "bg-background shadow-sm text-primary ring-1 ring-border" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {getActiveCategories().map((cat) => (
          <div key={cat.id} className="group relative bg-card border border-border/60 hover:border-primary/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-inner group-hover:scale-110 transition-transform">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-label="Category actions" variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem onClick={() => openEdit(cat)} className="cursor-pointer py-2">
                    <Edit2 className="mr-2 h-4 w-4 text-sky-500" /> Edit Category
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setItemToDelete(cat.id)} className="cursor-pointer py-2 focus:bg-red-500/10 text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg text-foreground tracking-tight">{cat.name || cat.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {cat.description || "No description provided."}
              </p>
            </div>
            {!cat.isActive && cat.isActive !== undefined && (
              <div className="absolute top-3 right-12 bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">
                Inactive
              </div>
            )}
          </div>
        ))}
        {getActiveCategories().length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card/30">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No Categories Yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Create a category to get started.</p>
            <Button onClick={openNew} variant="outline" className="mt-4 gap-2 rounded-xl"><Plus className="h-4 w-4" /> Add First Category</Button>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingId ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="catName" className="text-sm font-semibold">Category Name / Title <span className="text-destructive">*</span></Label>
              <Input 
                id="catName"
                className="h-11 rounded-xl bg-muted/50 border-border focus:ring-primary/20"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Data Science" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catSlug" className="text-sm font-semibold">Slug</Label>
              <Input 
                id="catSlug"
                className="h-11 rounded-xl bg-muted/50 border-border focus:ring-primary/20"
                value={formData.slug} 
                onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                placeholder="e.g. data-science" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDesc" className="text-sm font-semibold">Description</Label>
              <Textarea 
                id="catDesc"
                className="resize-none h-24 rounded-xl bg-muted/50 border-border focus:ring-primary/20"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Brief description of this category..." 
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="catSort" className="text-sm font-semibold">Sort Order</Label>
                <Input 
                  id="catSort"
                  type="number"
                  className="h-11 rounded-xl bg-muted/50 border-border focus:ring-primary/20"
                  value={formData.sortOrder} 
                  onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})} 
                />
              </div>
              <div className="space-y-2 flex-1 pt-6">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-border text-primary focus:ring-primary/20"
                  />
                  Is Active
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="rounded-xl px-6">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : "Save Category"}
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
        title="Delete Category?"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
