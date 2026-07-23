import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Dict, type Lang } from "./translations";

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: Dict;
};

const LanguageContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "beacon.lang";

import { useAuth } from "@/lib/auth/AuthContext";
import { updateStudentPreferences, useStudentPreferences } from "@/lib/db/services/studentDataService";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const { currentUser } = useAuth();
  const { preferences } = useStudentPreferences(currentUser?.uid);

  // Read persisted preference from DB when loaded, fallback to localStorage
  useEffect(() => {
    if (preferences?.language) {
      setLangState(preferences.language as Lang);
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
        if (saved === "ar" || saved === "en") setLangState(saved);
      } catch {
        // ignore
      }
    }
  }, [preferences?.language]);

  // Reflect on <html> for native RTL/LTR support
  useEffect(() => {
    if (typeof document === "undefined") return;
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (currentUser) {
      updateStudentPreferences(currentUser.uid, { language: l });
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, l);
      } catch {
        // ignore
      }
    }
  }, [currentUser]);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "ar" : "en");
  }, [lang, setLang]);

  const value = useMemo<Ctx>(
    () => ({ lang, dir: lang === "ar" ? "rtl" : "ltr", setLang, toggle, t: translations[lang] }),
    [lang, setLang, toggle],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
