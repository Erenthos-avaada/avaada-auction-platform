import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ProgressBar from "@/components/layout/ProgressBar";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) redirect("/login");

  let payload: any;
  try { const v = await jwtVerify(token, secret); payload = v.payload; }
  catch { redirect("/login"); }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <ProgressBar />
      <Sidebar role={payload.role} name={payload.name as string} email={payload.email as string} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header role={payload.role} name={payload.name as string} />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
