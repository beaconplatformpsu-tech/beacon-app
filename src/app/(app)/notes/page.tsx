"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Plus, Trash2, Pin, Search, FileText, Folder, FolderOpen, MoreVertical, Edit3, CheckSquare, Maximize2, LockKeyhole } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useNotes } from "@/features/notes/hooks/useNotes";
import { noteService } from "@/features/notes/services/noteService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Note, NoteInput } from "@/features/notes/types";
import { useT } from "@/i18n/LanguageProvider";

// ── Lazy-load heavy markdown renderer - only needed when Focus Mode opens ──
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
const RemarkGfm = { remarkGfm: () => import("remark-gfm").then((m) => m.default) };

export default function NotesPage() {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const { notes, loading } = useNotes(session?.uid);
  const t = useT();

  const [search, setSearch] = useState("");
  const [activeNotebook, setActiveNotebook] = useState("All Notes");

  // Focus mode
  const [focusNote, setFocusNote] = useState<Note | null>(null);
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [focusContent, setFocusContent] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // New note dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState<Partial<NoteInput>>({ title: "", content: "", isPinned: false, category: "General" });

  // ── Derived state (memoized) ─────────────────────────────────────────────
  const notebooks = useMemo(() => {
    const cats = new Set(notes.map((n) => n.category));
    return ["All Notes", ...Array.from(cats)].sort();
  }, [notes]);

  const filteredNotes = useMemo(() =>
    notes.filter((n) => {
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
      const matchBook = activeNotebook === "All Notes" || n.category === activeNotebook;
      return matchSearch && matchBook;
    }),
    [notes, search, activeNotebook]
  );

  // ── Mutations ────────────────────────────────────────────────────────────
  const handleCreateNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast.warning(t.notes.missingFields, t.notes.missingFieldsDesc);
      return;
    }
    if (!session?.uid) return;

    try {
      await noteService.createNote(session.uid, newNote);
      toast.success(t.notes.toastSaved, t.notes.toastSavedDesc);
      setIsDialogOpen(false);
      setNewNote({ title: "", content: "", isPinned: false, category: activeNotebook === "All Notes" ? "General" : activeNotebook });
    } catch { toast.error(t.notes.toastError, t.notes.toastSaveFail); }
  };

  const handleUpdateFocusNote = async () => {
    if (!focusNote || !session?.uid) return;
    try {
      await noteService.updateNote(session.uid, focusNote.id, focusContent);
      toast.success(t.notes.toastUpdated, t.notes.toastUpdatedDesc);
      setIsEditingFocus(false);
      setFocusNote({ ...focusNote, content: focusContent });
    } catch { toast.error(t.notes.toastError, t.notes.toastUpdateFail); }
  };

  const handleTogglePin = async (note: Note, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!session?.uid) return;
    try {
      await noteService.togglePin(session.uid, note.id, !note.isPinned);
      toast.info(note.isPinned ? t.notes.toastUnpinned : t.notes.toastPinned, t.notes.toastPinDesc);
    } catch { toast.error(t.notes.toastError, t.notes.toastPinFail); }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!session?.uid) return;
    try {
      await noteService.deleteNote(session.uid, noteId);
      toast.info(t.notes.toastDeleted, t.notes.toastDeletedDesc);
      if (focusNote?.id === noteId) setFocusNote(null);
    } catch { toast.error(t.notes.toastError, t.notes.toastDeleteFail); }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Sidebar: Notebooks ── */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-glow flex flex-col h-full">
          <h2 className="font-semibold px-2 mb-4 text-foreground/80 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" /> {t.notes.notebooks}
          </h2>
          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-1">
              {loading
                ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg mb-1" />)
                : notebooks.map((nb) => (
                  <button
                    key={nb}
                    onClick={() => setActiveNotebook(nb)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${activeNotebook === nb ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                  >
                    <Folder className={`h-4 w-4 ${activeNotebook === nb ? "fill-primary/20" : ""}`} />
                    <span className="truncate">{nb === "All Notes" ? t.notes.allNotes : nb}</span>
                    <span className="ml-auto text-xs opacity-50">
                      {nb === "All Notes" ? notes.length : notes.filter((n) => n.category === nb).length}
                    </span>
                  </button>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ── Main: Notes Grid ── */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <LockKeyhole className="h-8 w-8 text-primary" /> {t.notes.privateNotes}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-muted-foreground">{t.notes.currentlyViewing}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">{activeNotebook === "All Notes" ? t.notes.allNotes : activeNotebook}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input aria-label={t.notes.searchNotes} className="pl-10 bg-card border-border/50 shadow-sm" placeholder={t.notes.searchNotes} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-glow shrink-0"><Plus className="h-4 w-4" /> {t.notes.newNote}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle>{t.notes.createPrivateNote}</DialogTitle>
                  <DialogDescription>{t.notes.encryptedNotice}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input aria-label={t.notes.noteTitle} value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} placeholder={t.notes.noteTitle} className="font-medium text-lg border-none bg-muted/50 focus-visible:ring-1" />
                  <Input aria-label={t.notes.notebookNamePlaceholder} value={newNote.category} onChange={(e) => setNewNote({ ...newNote, category: e.target.value })} placeholder={t.notes.notebookNamePlaceholder} className="border-none bg-muted/50 focus-visible:ring-1" list="notebooks-list" />
                  <datalist id="notebooks-list">{notebooks.filter((n) => n !== "All Notes").map((nb) => <option key={nb} value={nb} />)}</datalist>
                  <Textarea aria-label={t.notes.typeReflections} value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} placeholder={t.notes.typeReflections} className="min-h-[200px] resize-none border-none bg-muted/50 focus-visible:ring-1 leading-relaxed" />
                </div>
                <DialogFooter className="flex justify-between items-center w-full">
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                    <input type="checkbox" className="rounded border-input text-primary focus:ring-primary h-4 w-4" checked={newNote.isPinned} onChange={(e) => setNewNote({ ...newNote, isPinned: e.target.checked })} />
                    {t.notes.pinToTop}
                  </label>
                  <Button onClick={handleCreateNote} className="shadow-glow">{t.notes.saveNote}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl border border-border/50" />)}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border/60 rounded-3xl bg-card/30 flex-1 flex flex-col items-center justify-center m-2">
              <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <FileText className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-medium text-foreground">{t.notes.noNotesFound}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                {search ? t.notes.noNotesMatch : t.notes.notebookEmpty.replace("{0}", activeNotebook === "All Notes" ? t.notes.allNotes : activeNotebook)}
              </p>
              {!search && (
                <Button variant="outline" className="mt-6 border-primary/20 hover:bg-primary/5" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> {t.notes.createFirstNote}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`group cursor-pointer relative transition-all duration-300 hover:shadow-glow hover:-translate-y-1 overflow-hidden flex flex-col h-64 ${note.isPinned ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/80 backdrop-blur-sm"
                    }`}
                  onClick={() => { setFocusNote(note); setFocusContent(note.content); setIsEditingFocus(false); }}
                >
                  <CardHeader className="pb-3 px-5 pt-5 shrink-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 overflow-hidden w-full">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-2 py-0.5 rounded-sm bg-muted/50">{note.category}</span>
                        <CardTitle className="text-lg leading-tight truncate pr-4 mt-1">{note.title}</CardTitle>
                      </div>
                      <div className="flex items-center shrink-0">
                        {note.isPinned && <Pin className="h-3.5 w-3.5 text-primary fill-current mr-2" />}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button aria-label="Note options" variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground data-[state=open]:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 border-border/50 shadow-xl">
                            <DropdownMenuItem onClick={(e) => handleTogglePin(note, e as any)} className="cursor-pointer">
                              <Pin className="h-4 w-4 mr-2" /> {note.isPinned ? t.notes.unpinNote : t.notes.pinNote}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setNoteToDelete(note.id); }} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> {t.notes.deleteNote}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 flex-1 flex flex-col min-h-0 relative">
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical" }}>
                      {note.content}
                    </p>
                    <div className="absolute bottom-10 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                    <div className="mt-4 pt-4 border-t border-border/40 flex justify-between items-center text-[11px] text-muted-foreground font-medium shrink-0">
                      <span>{new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                        <Maximize2 className="h-3 w-3 mr-1" /> {t.notes.open}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── Focus Mode Dialog ── */}
      <Dialog open={!!focusNote} onOpenChange={(open) => !open && setFocusNote(null)}>
        <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col p-0 border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {focusNote && (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-primary px-2 py-0.5 rounded-sm bg-primary/10">{focusNote.category}</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(focusNote.createdAt).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isEditingFocus ? "default" : "outline"}
                    size="sm"
                    onClick={() => isEditingFocus ? handleUpdateFocusNote() : setIsEditingFocus(true)}
                    className={isEditingFocus ? "shadow-glow bg-primary text-primary-foreground" : "border-border/50"}
                  >
                    {isEditingFocus ? <><CheckSquare className="h-4 w-4 mr-2" />{t.notes.saveChanges}</> : <><Edit3 className="h-4 w-4 mr-2" />{t.notes.editNote}</>}
                  </Button>
                  <Button aria-label="Delete note" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setNoteToDelete(focusNote.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-background/50">
                <div className="max-w-2xl mx-auto space-y-6">
                  <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground leading-tight">{focusNote.title}</h1>
                  {isEditingFocus ? (
                    <Textarea value={focusContent} onChange={(e) => setFocusContent(e.target.value)} className="min-h-[400px] resize-none border-none bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary/30 text-base leading-relaxed p-4 rounded-xl shadow-inner" autoFocus />
                  ) : (
                    <div className="prose prose-neutral prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-pre:bg-muted/50 prose-pre:text-foreground prose-pre:border prose-pre:border-border/50">
                      <ReactMarkdown>{focusNote.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

