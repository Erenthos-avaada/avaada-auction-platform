import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  return prisma.notification.create({
    data: { userId, title, message, link },
  });
}

export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: "desc" },
  });
}
