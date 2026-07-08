"use client";

import { useMemo, useState } from "react";
import { Plus, CheckSquare } from "lucide-react";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { taskService } from "@/features/tasks/services/taskService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { createNotification } from "@/hooks/use-notifications";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { TaskDialog } from "@/features/tasks/components/TaskDialog";
import { TaskFilters } from "@/features/tasks/components/TaskFilters";
import { TaskStats } from "@/features/tasks/components/TaskStats";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task, TaskInput } from "@/features/tasks/types";
import { useT } from "@/i18n/LanguageProvider";

export default function TasksPage() {
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const { tasks, loading } = useTasks(session?.uid);
  const t = useT();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");

  // ─── Analytics (memoized) ────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const active = tasks.filter((t) => t.status !== "Completed");
    const completed = tasks.filter((t) => t.status === "Completed");
    const totalHours = active.reduce((acc, t) => acc + (Number(t.estimatedHours) || 0), 0);
    const rate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
    return { activeTasks: active.length, completedTasks: completed.length, totalHoursPlanned: totalHours, completionRate: rate };
  }, [tasks]);

  // ─── Filtered + sorted list (memoized) ────────────────────────────────────
  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase();
    const filtered = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.courseName?.toLowerCase().includes(query)
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === "dueDate") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === "priority") {
        const p = { High: 3, Medium: 2, Low: 1 };
        return (p[b.priority as keyof typeof p] ?? 0) - (p[a.priority as keyof typeof p] ?? 0);
      }
      if (sortBy === "status") {
        const s = { Completed: 3, "In Progress": 2, Pending: 1 };
        return (s[a.status as keyof typeof s] ?? 0) - (s[b.status as keyof typeof s] ?? 0);
      }
      if (sortBy === "progress") return b.progress - a.progress;
      return 0;
    });
  }, [tasks, search, sortBy]);

  // ─── Mutations ───────────────────────────────────────────────────────────
  const handleCreateTask = async (newTask: Partial<TaskInput>) => {
    if (!newTask.title || !newTask.dueDate || !newTask.courseName) {
      toast.warning(t.tasks.missingFields, t.tasks.missingFieldsDesc);
      return;
    }
    if (!session?.uid) return;

    try {
      await taskService.createTask(session.uid, newTask);
      await createNotification(session.uid, {
        title: t.tasks.toastCreated,
        message: `${t.tasks.toastCreatedDesc} "${newTask.title}"`,
        type: "info",
      });
      toast.success(t.tasks.toastCreated, t.tasks.toastCreatedDesc);
    } catch {
      toast.error(t.tasks.toastError, t.tasks.toastCreateFail);
    }
  };

  const handleUpdateProgress = async (taskId: string, newProgress: number) => {
    if (!session?.uid) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    
    try {
      await taskService.updateProgress(session.uid, taskId, newProgress);
      
      if (newProgress === 100 && task.progress !== 100) {
        toast.success(t.tasks.toastCompleted, t.tasks.toastCompletedDesc);
        await createNotification(session.uid, {
          title: t.tasks.toastCompleted,
          message: `${t.tasks.toastCompletedDesc} "${task.title}"`,
          type: "success",
        });
      }
    } catch {
      toast.error(t.tasks.toastError, t.tasks.toastUpdateFail);
    }
  };

  const handleSave = async (data: any) => {
    if (!session?.uid) return;
    try {
      await taskService.deleteTask(session.uid, data.id);
      toast.info(t.tasks.toastDeleted, t.tasks.toastDeletedDesc);
    } catch {
      toast.error(t.tasks.toastError, t.tasks.toastDeleteFail);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!session?.uid) return;
    try {
      await taskService.deleteTask(session.uid, taskId);
      toast.info(t.tasks.toastDeleted, t.tasks.toastDeletedDesc);
    } catch {
      toast.error(t.tasks.toastError, t.tasks.toastDeleteFail);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-primary" /> {t.tasks.title}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{t.tasks.subtitle}</p>
        </div>
        <TaskDialog onSave={handleCreateTask} />
      </div>

      {/* ── Stats (only shown when there are tasks) ── */}
      {!loading && tasks.length > 0 && <TaskStats analytics={analytics} />}

      {/* ── Filters ── */}
      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* ── Task Grid ── */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-2xl border border-border/50" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-card/50 flex flex-col items-center justify-center">
          <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <CheckSquare className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-xl font-medium text-foreground">{t.tasks.noTasksFound}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            {search
              ? t.tasks.noSearchMatch
              : t.tasks.backlogClear}
          </p>
          {!search && (
            <Button variant="outline" className="mt-6 border-primary/20 hover:bg-primary/5">
              <Plus className="h-4 w-4 mr-2" /> {t.tasks.planNewSession}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateProgress={handleUpdateProgress}
              onDelete={async (id) => { setTaskToDelete(id); }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            handleDeleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
        title={t.tasks.deleteTitle}
        description={t.tasks.deleteDesc}
        confirmText={t.tasks.delete}
        cancelText={t.tasks.cancel}
      />
    </div>
  );
}

