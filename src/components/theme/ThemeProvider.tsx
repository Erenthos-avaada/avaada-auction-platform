"use client";
import { useEffect } from "react";
import { THEMES, ThemeId, DEFAULT_THEME } from "@/lib/themes";

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme", themeId);
}

export default function ThemeProvider({ theme }: { theme: ThemeId }) {
  useEffect(() => {
    // Apply server-provided theme immediately
    applyTheme(theme);

    // Then fetch latest from API to catch admin changes
    // This ensures ALL browsers always get the current theme
    fetch("/api/settings/theme", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data.theme && data.theme !== theme) {
          applyTheme(data.theme as ThemeId);
        }
      })
      .catch(() => {});
  }, [theme]);

  return null;
}
