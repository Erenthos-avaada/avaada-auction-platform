export const THEMES = {
  "emerald-night": {
    name: "Emerald Night",
    description: "Dark forest green · Default",
    vars: {
      "--bg":        "#0b1a12",
      "--bg2":       "#0d1f15",
      "--bg3":       "#122a1a",
      "--border":    "rgba(52,211,100,0.10)",
      "--border2":   "rgba(52,211,100,0.20)",
      "--accent":    "#34d364",
      "--accent2":   "#22c55e",
      "--accent-bg": "rgba(52,211,100,0.10)",
      "--text":      "#f0f7f2",
      "--text2":     "rgba(240,247,242,0.55)",
      "--text3":     "rgba(240,247,242,0.30)",
      "--danger":    "#f87171",
      "--warning":   "#fbbf24",
      "--success":   "#34d364",
      "--info":      "#60a5fa",
    }
  },
  "arctic-slate": {
    name: "Arctic Slate",
    description: "Cool blue-grey · Light mode",
    vars: {
      "--bg":        "#f4f7fb",
      "--bg2":       "#ffffff",
      "--bg3":       "#eef2f8",
      "--border":    "rgba(59,130,246,0.12)",
      "--border2":   "#bfdbfe",
      "--accent":    "#2563eb",
      "--accent2":   "#1d4ed8",
      "--accent-bg": "#eff6ff",
      "--text":      "#0f172a",
      "--text2":     "#64748b",
      "--text3":     "#94a3b8",
      "--danger":    "#dc2626",
      "--warning":   "#d97706",
      "--success":   "#16a34a",
      "--info":      "#2563eb",
    }
  },
  "obsidian-gold": {
    name: "Obsidian Gold",
    description: "Deep black · Gold accents",
    vars: {
      "--bg":        "#0a0d14",
      "--bg2":       "#0e1220",
      "--bg3":       "#141824",
      "--border":    "rgba(201,160,60,0.10)",
      "--border2":   "rgba(201,160,60,0.25)",
      "--accent":    "#c9a03c",
      "--accent2":   "#e2b94a",
      "--accent-bg": "rgba(201,160,60,0.10)",
      "--text":      "#f5f0e8",
      "--text2":     "rgba(245,240,232,0.50)",
      "--text3":     "rgba(245,240,232,0.28)",
      "--danger":    "#f87171",
      "--warning":   "#fbbf24",
      "--success":   "#4ade80",
      "--info":      "#60a5fa",
    }
  }
} as const;

export type ThemeId = keyof typeof THEMES;
export const DEFAULT_THEME: ThemeId = "emerald-night";
