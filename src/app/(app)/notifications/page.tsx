"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Trash2, 
  Check, 
  CheckCheck,
  BellRing
} from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n/LanguageProvider";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread" | Notification["type"]>("all");
  const t = useT();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "error": return <XCircle className="h-6 w-6 text-red-500" />;
      case "info":
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBgClass = (type: Notification["type"]) => {
    switch (type) {
      case "success": return "bg-emerald-500/10 text-emerald-500 border-emerald-200/20";
      case "warning": return "bg-amber-500/10 text-amber-500 border-amber-200/20";
      case "error": return "bg-red-500/10 text-red-500 border-red-200/20";
      case "info":
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-200/20";
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stay updated with your latest alerts and announcements.
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead} 
            variant="outline" 
            className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      <Card className="border-border/50 shadow-lg shadow-black/5 rounded-3xl overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <div className="px-6 py-4 border-b border-border/50 overflow-x-auto scrollbar-hide">
              <TabsList className="bg-transparent space-x-2 h-auto p-0">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 border border-border/40">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 border border-border/40">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-current hover:bg-white/30 border-none px-1.5 py-0">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="info" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-full px-4 py-2 border border-border/40">
                  Info
                </TabsTrigger>
                <TabsTrigger value="success" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-full px-4 py-2 border border-border/40">
                  Success
                </TabsTrigger>
                <TabsTrigger value="warning" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-full px-4 py-2 border border-border/40">
                  Warning
                </TabsTrigger>
                <TabsTrigger value="error" className="data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-full px-4 py-2 border border-border/40">
                  Error
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[65vh] max-h-[800px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <BellRing className="h-10 w-10 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
                    You have no {filter !== "all" ? filter : ""} notifications right now. Check back later for new updates.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {filteredNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`group flex items-start gap-4 sm:gap-6 p-4 sm:p-6 transition-all hover:bg-accent/40 cursor-pointer ${
                        !notif.read ? 'bg-primary/[0.03]' : ''
                      }`}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                    >
                      <div className={`shrink-0 mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${getBgClass(notif.type)}`}>
                        {getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                          <h4 className={`text-base truncate ${!notif.read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${!notif.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                          {notif.message}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-center sm:self-start mt-2 sm:mt-0">
                        {notif.read && (
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground" title="Read">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notif.id);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
