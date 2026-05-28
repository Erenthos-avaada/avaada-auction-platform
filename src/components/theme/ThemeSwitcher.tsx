"use client";
import { useState } from "react";
import { THEMES, ThemeId } from "@/lib/themes";
import { applyTheme } from "./ThemeProvider";

export default function ThemeSwitcher({ current }: { current: ThemeId }) {
  const [active, setActive] = useState<ThemeId>(current);
  const [saving, setSaving] = useState(false);

  const switchTheme = async (themeId: ThemeId) => {
    setSaving(true);
    applyTheme(themeId);
    setActive(themeId);
    await fetch("/api/settings/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: themeId }),
    });
    setSaving(false);
  };

  const dots: Record<ThemeId, string> = {
    "emerald-night": "#34d364",
    "arctic-slate":  "#2563eb",
    "obsidian-gold": "#c9a03c",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {(Object.entries(THEMES) as [ThemeId, typeof THEMES[ThemeId]][]).map(([id, t]) => (
        <button key={id} onClick={() => switchTheme(id)} disabled={saving} style={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "14px 18px", borderRadius: "12px", cursor: "pointer",
          background: active === id ? "var(--accent-bg)" : "var(--bg3)",
          border: active === id ? "1.5px solid var(--accent)" : "1px solid var(--border)",
          textAlign: "left", transition: "all 0.2s ease",
        }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: dots[id], flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {active === id && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: active === id ? "var(--accent)" : "var(--text)", marginBottom: "2px" }}>{t.name}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text2)" }}>{t.description}</p>
          </div>
          {active === id && (
            <span style={{ marginLeft: "auto", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)", background: "var(--accent-bg)", padding: "3px 8px", borderRadius: "999px" }}>
              Active
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
