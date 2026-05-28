-- Run this in Neon SQL Editor to add the SiteSettings table
CREATE TABLE IF NOT EXISTS "SiteSettings" (
  id        TEXT PRIMARY KEY DEFAULT 'global',
  theme     TEXT NOT NULL DEFAULT 'emerald-night',
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default row
INSERT INTO "SiteSettings" (id, theme)
VALUES ('global', 'emerald-night')
ON CONFLICT (id) DO NOTHING;
