"use client";
import { useEffect } from "react";
import { THEMES, ThemeId } from "@/lib/themes";

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme", themeId);
}

export default function ThemeProvider({ theme }: { theme: ThemeId }) {
  useEffect(() => { applyTheme(theme); }, [theme]);
  return null;
}
