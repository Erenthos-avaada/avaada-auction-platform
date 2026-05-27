/**
 * Run once to create the first Admin user:
 * npx ts-node --project tsconfig.json scripts/seed-admin.ts
 *
 * Or via API: POST /api/auth/seed-admin (only works when no admin exists)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL    || "admin@avaada.com";
  const password = process.env.ADMIN_PASSWORD || "Avaada@2024";
  const name     = "Avaada Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { console.log("Admin already exists:", email); return; }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, password: hashed, role: "ADMIN" } });
  console.log("✅ Admin created:", email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
