"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/i18n/LanguageProvider";

interface TaskAnalytics {
  activeTasks: number;
  completedTasks: number;
  totalHoursPlanned: number;
  completionRate: number;
}

interface TaskStatsProps {
  analytics: TaskAnalytics;
}

export function TaskStats({ analytics }: TaskStatsProps) {
  const t = useT();
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.tasks.activeTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{analytics.activeTasks}</div>
        </CardContent>
      </Card>

      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.tasks.hoursPlanned}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.totalHoursPlanned}
            <span className="text-lg font-normal text-muted-foreground ml-1">{t.tasks.hrs}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.tasks.completed}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {analytics.completedTasks}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-500/5 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.tasks.completionRate}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.completionRate}%
          </div>
          <Progress value={analytics.completionRate} className="h-1 mt-2 bg-purple-500/20" />
        </CardContent>
      </Card>
    </div>
  );
}
