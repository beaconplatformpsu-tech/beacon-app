import { useState, useEffect } from "react";
import { ref, onValue, update, remove, push } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useCurrentUserRole } from "./use-current-user-role";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
};

export function useNotifications() {
  const { session } = useCurrentUserRole();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.uid) return;

    const notifRef = ref(db, `notifications/${session.uid}`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notifList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as Notification[];
        
        // Sort newest first
        notifList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setNotifications(notifList);
        setUnreadCount(notifList.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [session?.uid]);

  const markAsRead = async (notificationId: string) => {
    if (!session?.uid) return;
    try {
      await update(ref(db, `notifications/${session.uid}/${notificationId}`), { read: true });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    if (!session?.uid) return;
    try {
      const updates: Record<string, any> = {};
      notifications.filter(n => !n.read).forEach(n => {
        updates[`${n.id}/read`] = true;
      });
      if (Object.keys(updates).length > 0) {
        await update(ref(db, `notifications/${session.uid}`), updates);
      }
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const clearNotification = async (notificationId: string) => {
    if (!session?.uid) return;
    try {
      await remove(ref(db, `notifications/${session.uid}/${notificationId}`));
    } catch (error) {
      console.error("Failed to clear notification", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification
  };
}

// Utility function to be used outside the hook (e.g., when a task completes)
export const createNotification = async (
  uid: string, 
  notification: Omit<Notification, "id" | "read" | "createdAt">
) => {
  try {
    await push(ref(db, `notifications/${uid}`), {
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to create notification", error);
  }
};
