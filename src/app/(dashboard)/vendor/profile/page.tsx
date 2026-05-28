import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import VendorProfileForm from "./VendorProfileForm";

export const dynamic = "force-dynamic";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret");

export default async function VendorProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value!;
  const { payload } = await jwtVerify(token, secret);
  const vendor = await prisma.vendor.findUnique({
    where: { userId: payload.id as string },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!vendor) return <p style={{ color: "var(--text3)" }}>Vendor not found.</p>;
  return <VendorProfileForm vendor={JSON.parse(JSON.stringify(vendor))} />;
}
