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
import type { Skill, CSCategory } from "@/lib/types";
import { useT } from "@/i18n/LanguageProvider";

const DEFAULT_SKILL: Partial<Skill> = {
  name: "",
  category: "Languages",
  proficiency: "Beginner",
  progress: 0,
};

interface SkillDialogProps {
  onSave: (skill: Partial<Skill>) => Promise<void>;
  children?: React.ReactNode;
}

export function SkillDialog({ onSave, children }: SkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>(DEFAULT_SKILL);
  const t = useT();

  const handleSave = async () => {
    await onSave(newSkill);
    setOpen(false);
    setNewSkill(DEFAULT_SKILL);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 shadow-glow bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4" /> {t.skills.trackNewSkill}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.skills.addToPortfolio}</DialogTitle>
          <DialogDescription>{t.skills.trackCompetency}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">{t.skills.skillName}</label>
            <Input
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder={t.skills.phSkill}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">{t.skills.domain}</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as CSCategory })}
              >
                {(Object.keys(t.skills.domains) as Array<keyof typeof t.skills.domains>).map((key) => (
                  <option key={key} value={key}>{t.skills.domains[key]}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">{t.skills.startingProgress}</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newSkill.progress}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, progress: parseInt(e.target.value, 10) || 0 })
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{t.skills.saveSkill}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

