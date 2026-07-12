"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Bell, MoreVertical } from "lucide-react";
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

type Announcement = { id: string; title: string; slug?: string; content?: string; type?: string; isActive?: boolean; createdAt?: number };

export function AnnouncementsManager({ announcements }: { announcements: Announcement[] }) {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", slug: "", content: "", type: "Info", isActive: true });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setFormData({ title: "", slug: "", content: "", type: "Info", isActive: true });
    setIsOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setFormData({ title: ann.title || "", slug: ann.slug || "", content: ann.content || "", type: ann.type || "Info", isActive: ann.isActive !== false });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!session?.uid) return;
    try { await adminService.deleteContent(session.uid, "public_content/announcements", id); toast.success("Deleted", "Announcement removed."); }
    catch { toast.error("Error", "Failed to delete."); }
  };

  const handleSubmit = async () => {
    if (!formData.title) { toast.warning("Validation", "Title is required."); return; }
    if (!session?.uid) return;
    
    // Clean payload (remove undefined values for Firebase)
    const payload = Object.fromEntries(
      Object.entries({ ...formData, updatedAt: new Date().toISOString() }).filter(([_, v]) => v !== undefined)
    );

    setLoading(true);
    try {
      if (editingId) { await adminService.updateContent(session.uid, "public_content/announcements", editingId, payload); toast.success("Updated", "Updated."); }
      else { await adminService.createContent(session.uid, "public_content/announcements", payload); toast.success("Created", "Created."); }
      setIsOpen(false);
    } catch { toast.error("Error", "Failed to save."); }
    finally { setLoading(false); }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Info": return "bg-sky-50 text-sky-700 border-sky-200";
      case "Warning": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Update": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Event": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/10 p-3 rounded-xl">
            <Bell className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Announcements</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Broadcast messages and updates to all users.</p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"><Plus className="h-4 w-4" /> Add Announcement</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {announcements.map((ann) => {
          return (
            <Card key={ann.id} className="group relative bg-card border border-border/60 hover:border-orange-500/40 rounded-2xl p-5 transition-all duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-lg text-foreground tracking-tight line-clamp-1">{ann.title}</h3>
                  {ann.content && <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{ann.content}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-label="Actions" variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={() => openEdit(ann)} className="cursor-pointer py-2">
                      <Edit2 className="mr-2 h-4 w-4 text-sky-500" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setItemToDelete(ann.id)} className="cursor-pointer py-2 focus:bg-red-500/10 text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/50">
                {ann.type && <Badge className={`text-[10px] border ${getTypeColor(ann.type)}`}>{ann.type}</Badge>}
                {!ann.isActive && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
              </div>
            </Card>
          );
        })}
        {announcements.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card/30">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No Announcements</h3>
            <p className="text-muted-foreground text-sm mt-1">Create an announcement to broadcast to all students.</p>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl">{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Title <span className="text-destructive">*</span></Label>
              <Input className="h-11 rounded-xl bg-muted/50 border-border" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Platform Update v2.0" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Slug</Label>
              <Input className="h-11 rounded-xl bg-muted/50 border-border" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. platform-update-v2" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Content</Label>
              <Textarea className="rounded-xl bg-muted/50 border-border resize-none" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Full announcement content..." rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Type</Label>
                <select className="w-full h-11 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  {["Info", "Warning", "Update", "Event"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2 pt-8">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded border-border text-primary" />
                  Is Active
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={loading} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="rounded-xl px-6">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Broadcast
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
        title="Delete Announcement?"
        description="Are you sure? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
