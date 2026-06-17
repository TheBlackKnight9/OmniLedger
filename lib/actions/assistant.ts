"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getChatHistory(entityId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const messages = await db.chatMessage.findMany({
    where: { entityId },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

export async function getUpcomingDeadlines(entityId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const now = new Date();
  const fifteenDaysFromNow = new Date();
  fifteenDaysFromNow.setDate(now.getDate() + 15);

  const pendingTasks = await db.complianceTask.findMany({
    where: {
      entityId,
      status: { not: "FILED" },
      dueDate: {
        lte: fifteenDaysFromNow,
        gte: now,
      },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 1, // We only need the most imminent one for the banner
  });

  return pendingTasks;
}
