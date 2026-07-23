"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateStudentPreferences, useStudentPreferences } from "@/lib/db/services/studentDataService";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("system");
  const { currentUser } = useAuth();
  const { preferences } = useStudentPreferences(currentUser?.uid);
  
  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let activeTheme = theme;
    if (theme === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(activeTheme);
    try {
      localStorage.setItem("beacon.theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);
  
  // Listen to system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Sync from DB preferences when loaded
  useEffect(() => {
    if (preferences?.theme) {
      setThemeState(preferences.theme as Theme);
    } else {
      try {
        const saved = localStorage.getItem("beacon.theme") as Theme;
        if (saved) setThemeState(saved);
      } catch {
        // ignore
      }
    }
  }, [preferences?.theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (currentUser) {
      updateStudentPreferences(currentUser.uid, { theme: newTheme });
    } else {
      try {
        localStorage.setItem("beacon.theme", newTheme);
      } catch {
        // ignore
      }
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
