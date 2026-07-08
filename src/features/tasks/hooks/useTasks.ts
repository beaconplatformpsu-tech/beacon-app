"use client";

import { useState, useEffect } from "react";
import { taskService } from "../services/taskService";
import type { Task } from "../types";

/**
 * Subscribes to the current user's tasks in Firebase Realtime DB.
 * Returns a live-updating list of tasks and a loading flag.
 */
export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = taskService.subscribeToTasks(userId, (liveTasks) => {
      setTasks(liveTasks as Task[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { tasks, loading };
}

