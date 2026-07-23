"use client";

import { useLanguage, useT } from "@/i18n/LanguageProvider";
import { StudentPageContainer, StudentPageHeader, EmptyState } from "@/components/shared/student";
import { Wrench } from "lucide-react";

export default function PlannerPage() {
  const { dir } = useLanguage();
  const t = useT();

  return (
    <StudentPageContainer>
      <StudentPageHeader
        title={t.nav?.planner || "Weekly Planner"}
        description={dir === "rtl" ? "خطط لمهامك الأسبوعية هنا." : "Plan your weekly tasks here."}
        icon={<Wrench className="w-5 h-5" />}
      />
      <div className="mt-8">
        <EmptyState 
          icon={<Wrench className="w-12 h-12 text-muted-foreground" />}
          title={dir === "rtl" ? "قريباً" : "Coming Soon"}
          description={dir === "rtl" ? "يتم بناء هذه الميزة للمرحلة القادمة." : "This feature is being built for the next phase."}
        />
      </div>
    </StudentPageContainer>
  );
}
