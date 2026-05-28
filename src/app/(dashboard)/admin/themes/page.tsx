import { prisma } from "@/lib/prisma";
import { DEFAULT_THEME, ThemeId } from "@/lib/themes";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";

export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  const current = (settings?.theme || DEFAULT_THEME) as ThemeId;

  return (
    <div style={{ maxWidth: "560px" }}>
      <div className="anim-up" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Platform <span>Themes</span></h1>
        <p className="page-sub">Choose the active theme for all users — applies instantly, no reload required</p>
      </div>

      <div className="anim-up d1 surface" style={{ padding: "24px" }}>
        <ThemeSwitcher current={current} />
      </div>

      <div className="anim-up d2" style={{ marginTop: "16px", padding: "14px 18px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>Note:</span> The selected theme is saved globally and applies to all users including vendors and procurement officers on their next page load. Active sessions see the change instantly.
        </p>
      </div>
    </div>
  );
}
