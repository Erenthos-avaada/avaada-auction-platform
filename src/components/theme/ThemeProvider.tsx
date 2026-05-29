"use client";
import { useEffect, useRef } from "react";
import { THEMES, ThemeId } from "@/lib/themes";

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
    // Apply server-provided theme immediately
    applyTheme(theme);
    currentTheme.current = theme;

    // Poll every 30s — hits Vercel edge cache not DB directly
    // DB is only queried once per 30s regardless of how many users are online
    const poll = async () => {
      try {
        const res  = await fetch("/api/settings/theme");
        const data = await res.json();
        if (data.theme && data.theme !== currentTheme.current) {
          currentTheme.current = data.theme as ThemeId;
          applyTheme(data.theme as ThemeId);
        }
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 30000); // Every 30s
    return () => clearInterval(interval);
  }, [theme]);

  return null;
}
