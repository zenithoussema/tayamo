"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeId = "gold" | "classic";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "gold",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "tayamo-theme";

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("gold");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    const initial = stored === "classic" || stored === "gold" ? stored : "gold";
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
