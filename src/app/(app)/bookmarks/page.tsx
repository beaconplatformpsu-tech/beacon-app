"use client";

import { useLanguage, useT } from "@/i18n/LanguageProvider";
import { StudentPageContainer, StudentPageHeader, EmptyState } from "@/components/shared/student";
import { Wrench } from "lucide-react";

export default function BookmarksPage() {
  const { dir } = useLanguage();
  const t = useT();

  return (
    <StudentPageContainer>
      <StudentPageHeader
        title={t.nav?.bookmarks || "Bookmarks"}
        description={dir === "rtl" ? "العناصر المحفوظة." : "Saved items."}
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
