import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret"
);

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) redirect("/login");
  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;
    if (role === "ADMIN") redirect("/admin");
    if (role === "PROCUREMENT") redirect("/procurement");
    if (role === "VENDOR") redirect("/vendor");
  } catch {
    redirect("/login");
  }
}
