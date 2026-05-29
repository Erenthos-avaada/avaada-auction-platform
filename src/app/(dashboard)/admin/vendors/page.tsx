import { prisma } from "@/lib/prisma";
import VendorsClient from "./VendorsClient";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  // Load ALL vendors once — filtering happens client-side instantly
  const vendors = await prisma.vendor.findMany({
    include: { user: { select: { email: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <VendorsClient vendors={JSON.parse(JSON.stringify(vendors))} />;
}
