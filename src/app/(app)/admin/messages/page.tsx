"use client";

import { useState, useEffect, useMemo } from "react";
import { Mail, Search, Trash2, Calendar, MessageSquare, Loader2, Mailbox } from "lucide-react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { adminService } from "@/features/admin/services/adminService";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageProvider";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

// Helper to generate a consistent gradient avatar based on the user's name
const getAvatarGradient = (name: string) => {
  const hash = Array.from(name).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 40%))`;
};

const getInitials = (name: string, unknownText?: string) => {
  if (!name || name === "Unknown" || name === unknownText) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function AdminMessagesPage() {
  const { session } = useCurrentUserRole();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);
  const toast = useCustomToast();
  const t = useT();

  useEffect(() => {
    const messagesRef = ref(db, "contact_messages");
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as ContactMessage[];
        
        // Sort newest first
        messageList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessages(messageList);
      } else {
        setMessages([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.adminMessages.deleteConfirmTitle)) return;
    if (!session?.uid) return;
    try {
      await adminService.deleteContent(session.uid, "contact_messages", id);
      toast.info(t.adminMessages.messageDeleted, t.adminMessages.messageRemoved);
    } catch (err) {
      toast.error(t.adminMessages.deleteFailed, t.adminMessages.couldNotDelete);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
    );
  }, [messages, search]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
    }).format(date);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card border border-border/60 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-xl hidden sm:block">
            <Mailbox className="h-7 w-7 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">{t.adminMessages.title}</h1>
            <p className="text-muted-foreground mt-1">{t.adminMessages.subtitle.replace("{count}", messages.length.toString())}</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <Input 
            className="pl-10 h-12 bg-background border-border/60 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl shadow-inner transition-all text-base" 
            placeholder={t.adminMessages.searchPlaceholder} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-muted-foreground animate-pulse">{t.adminMessages.loading}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border/80 rounded-3xl bg-card/30">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-medium text-foreground">{t.adminMessages.emptyTitle}</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">{t.adminMessages.emptyDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMessages.map((msg) => {
                const name = msg.name || t.adminMessages.unknown;
                return (
                  <div 
                    key={msg.id} 
                    className="group relative flex flex-col p-6 rounded-3xl border border-border/60 bg-card hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 overflow-hidden"
                  >
                    {/* Top Row: Sender Info & Actions */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner text-white font-bold text-lg"
                          style={{ background: getAvatarGradient(name) }}
                        >
                          {getInitials(name, t.adminMessages.unknown)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg tracking-tight text-foreground leading-tight">
                            {name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                            <a href={`mailto:${msg.email}`} className="text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-1.5 transition-colors">
                              <Mail className="h-3.5 w-3.5" /> {msg.email}
                            </a>
                            <span className="text-border mx-1">•</span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" /> {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100" 
                        onClick={() => setMsgToDelete(msg.id)}
                        title={t.adminMessages.deleteMessage}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Message Body */}
                    <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium">
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!msgToDelete}
        onClose={() => setMsgToDelete(null)}
        onConfirm={() => {
          if (msgToDelete) {
            handleDelete(msgToDelete);
            setMsgToDelete(null);
          }
        }}
        title={t.adminMessages.deleteConfirmTitle}
        description={t.adminMessages.deleteConfirmDesc}
        confirmText={t.adminMessages.delete}
        cancelText={t.adminMessages.cancel}
      />
    </div>
  );
}
