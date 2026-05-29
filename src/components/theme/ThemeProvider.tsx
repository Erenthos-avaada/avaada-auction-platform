"use client";
import { useEffect, useRef } from "react";
import { THEMES, ThemeId, DEFAULT_THEME } from "@/lib/themes";

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme", themeId);
}

export default function ThemeProvider({ theme }: { theme: ThemeId }) {
  const currentTheme = useRef<ThemeId>(theme);

  useEffect(() => {
    // Apply immediately on mount
    applyTheme(theme);
    currentTheme.current = theme;

    // Poll DB every 5 seconds for theme changes from admin
    const poll = async () => {
      try {
        const res  = await fetch("/api/settings/theme", { cache: "no-store" });
        const data = await res.json();
        if (data.theme && data.theme !== currentTheme.current) {
          currentTheme.current = data.theme as ThemeId;
          applyTheme(data.theme as ThemeId);
        }
      } catch {}
    };

    poll(); // Check immediately
    const interval = setInterval(poll, 5000); // Then every 5s
    return () => clearInterval(interval);
  }, [theme]);

  return null;
}
