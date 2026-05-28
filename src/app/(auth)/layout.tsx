import { cookies } from "next/headers";
import { DEFAULT_THEME, ThemeId } from "@/lib/themes";
import ThemeProvider from "@/components/theme/ThemeProvider";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || DEFAULT_THEME) as ThemeId;
  return (
    <>
      <ThemeProvider theme={theme} />
      {children}
    </>
  );
}
