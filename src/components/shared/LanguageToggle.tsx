import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggle, t } = useLanguage();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-label={t.lang.label}
      title={t.lang.label}
      className={`rounded-full px-5 flex items-center gap-2 border-gray-200 text-foreground/80 shadow-sm font-medium hover:bg-gray-50 hover:text-slate-900 transition-colors ${className || ""}`}
    >
      <span className="text-xs">
        {lang === "en" ? "العربية" : "English"}
      </span>
      <Globe className="h-4 w-4" />
    </Button>
  );
}
