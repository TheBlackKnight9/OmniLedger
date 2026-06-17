"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ComplianceTask, AuditLog } from "@prisma/client";

export async function getCalendarTasks(
  entityId: string,
  month: number,
  year: number
): Promise<Record<string, ComplianceTask[]>> {
  // month is 1-indexed (1 = Jan, 12 = Dec)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const tasks = await db.complianceTask.findMany({
    where: {
      entityId,
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  const grouped: Record<string, ComplianceTask[]> = {};

  tasks.forEach((task) => {
    const localYear = task.dueDate.getFullYear();
    const localMonth = String(task.dueDate.getMonth() + 1).padStart(2, "0");
    const localDay = String(task.dueDate.getDate()).padStart(2, "0");
    const dateStr = `${localYear}-${localMonth}-${localDay}`;

    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(task);
  });

  return grouped;
}

export async function markTaskFiled(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const task = await db.complianceTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Update status to FILED
  const updatedTask = await db.complianceTask.update({
    where: { id: taskId },
    data: {
      status: "FILED",
      filedAt: new Date(),
    },
  });

  // Create Audit Log
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "TASK_FILED",
      resourceType: "ComplianceTask",
      resourceId: taskId,
      ipAddress: "127.0.0.1",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");

  return { success: true, task: updatedTask };
}

export async function getDashboardMetrics(entityId: string) {
  const now = new Date();

  // 1. Calculate Compliance Score (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const last12MonthsTasks = await db.complianceTask.findMany({
    where: {
      entityId,
      dueDate: {
        gte: twelveMonthsAgo,
        lte: now,
      },
    },
  });

  const totalDue = last12MonthsTasks.length;
  const filedOnTime = last12MonthsTasks.filter(
    (t) => t.status === "FILED" && (!t.filedAt || t.filedAt <= t.dueDate)
  ).length;

  const complianceScore = totalDue > 0 ? Math.round((filedOnTime / totalDue) * 100) : 100;

  // 2. Due This Month (pending in current calendar month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const dueThisMonth = await db.complianceTask.count({
    where: {
      entityId,
      status: { not: "FILED" },
      dueDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // 3. Overdue (pending where dueDate < today)
  const overdue = await db.complianceTask.count({
    where: {
      entityId,
      status: { not: "FILED" },
      dueDate: {
        lt: now,
      },
    },
  });

  // 4. Filed This Year (Apr to Mar financial year)
  let fyStartYear = now.getFullYear();
  if (now.getMonth() < 3) {
    // Jan, Feb, Mar belong to previous year's FY
    fyStartYear -= 1;
  }
  const fyStart = new Date(fyStartYear, 3, 1); // April 1st
  const fyEnd = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999); // March 31st next year

  const filedThisYear = await db.complianceTask.count({
    where: {
      entityId,
      status: "FILED",
      filedAt: {
        gte: fyStart,
        lte: fyEnd,
      },
    },
  });

  // 5. Urgent Tasks (top 5 by dueDate pending)
  const urgentTasks = await db.complianceTask.findMany({
    where: {
      entityId,
      status: { not: "FILED" },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 5,
  });

  // 6. Recent Activity (last 10 entries of AuditLog for this user/entity)
  const entity = await db.entity.findUnique({
    where: { id: entityId },
    select: { userId: true },
  });

  const recentActivity = entity
    ? await db.auditLog.findMany({
        where: { userId: entity.userId },
        orderBy: { timestamp: "desc" },
        take: 10,
      })
    : [];

  return {
    complianceScore,
    dueThisMonth,
    overdue,
    filedThisYear,
    urgentTasks,
    recentActivity,
  };
}

export async function getNotificationsData(entityId: string) {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  // Fetch pending tasks that are overdue (due date < now) OR due in next 7 days
  const notifications = await db.complianceTask.findMany({
    where: {
      entityId,
      status: { not: "FILED" },
      dueDate: {
        lte: sevenDaysFromNow,
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  return notifications;
}

