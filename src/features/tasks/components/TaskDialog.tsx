"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Task } from "../types";
import { useT } from "@/i18n/LanguageProvider";

const DEFAULT_TASK: Partial<Task> = {
  title: "",
  description: "",
  courseName: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
  category: "Homework/Assignment",
  estimatedHours: 2,
  progress: 0,
};

interface TaskDialogProps {
  onSave: (task: Partial<Task>) => Promise<void>;
}

export function TaskDialog({ onSave }: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>(DEFAULT_TASK);
  const t = useT();

  const handleSave = async () => {
    await onSave(newTask);
    setOpen(false);
    setNewTask(DEFAULT_TASK);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 shadow-glow whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">
          <Plus className="h-5 w-5" /> {t.tasks.newTask}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.tasks.dialogTitle}</DialogTitle>
          <DialogDescription>
            {t.tasks.dialogDesc}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="taskTitle" className="text-sm font-medium">{t.tasks.taskTitle}</label>
            <Input
              id="taskTitle"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder={t.tasks.phTitle}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="courseName" className="text-sm font-medium">{t.tasks.courseName}</label>
              <Input
                id="courseName"
                value={newTask.courseName}
                onChange={(e) => setNewTask({ ...newTask, courseName: e.target.value })}
                placeholder={t.tasks.phCourse}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">{t.tasks.category}</label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value as string })
                }
              >
                {(Object.keys(t.tasks.categories) as Array<keyof typeof t.tasks.categories>).map((key) => (
                  <option key={key} value={key}>{t.tasks.categories[key]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label htmlFor="estHours" className="text-sm font-medium">{t.tasks.estHours}</label>
              <Input
                id="estHours"
                type="number"
                min="0.5"
                step="0.5"
                value={newTask.estimatedHours}
                onChange={(e) =>
                  setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="dueDate" className="text-sm font-medium">{t.tasks.dueDate}</label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="priority" className="text-sm font-medium">{t.tasks.priority}</label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              >
                {(Object.keys(t.tasks.priorities) as Array<keyof typeof t.tasks.priorities>).map((key) => (
                  <option key={key} value={key}>{t.tasks.priorities[key]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{t.tasks.saveTask}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

