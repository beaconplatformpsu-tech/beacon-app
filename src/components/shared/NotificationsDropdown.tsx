"use client";

import { Bell, Check, Trash2, BellRing, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function NotificationsDropdown({ 
  buttonClassName, 
  iconClassName 
}: { 
  buttonClassName?: string;
  iconClassName?: string;
} = {}) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error": return <XCircle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={buttonClassName || "relative flex h-9 w-9 items-center justify-center rounded-full bg-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer hover:bg-accent"}>
          <Bell className={iconClassName || "h-4 w-4 text-foreground/80"} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 overflow-hidden shadow-2xl border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-primary/10 text-primary border-primary/20">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground">
              <Check className="h-3.5 w-3.5 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <BellRing className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">Check back later for new updates.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex items-start gap-3 p-4 transition-colors hover:bg-muted/30 ${!notif.read ? 'bg-primary/5' : ''}`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                  }}
                >
                  <div className="shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium text-foreground/80'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Clear notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-border/40 bg-muted/10">
          <Button variant="ghost" asChild className="w-full text-xs text-primary font-medium hover:text-primary hover:bg-primary/10 rounded-lg">
            <Link href="/notifications">
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
