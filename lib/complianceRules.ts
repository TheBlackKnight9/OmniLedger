import { db } from "./db";

export interface ComplianceProfile {
  role: "INDIVIDUAL" | "BUSINESS" | "CA_PARTNER" | "CA_STAFF";
  isAudit?: boolean;
  hasGstin?: boolean;
  hasTan?: boolean;
  hasCin?: boolean;
  salarySources?: string[];
  firmName?: string;
}

export async function seedComplianceTasks(entityId: string, profile: ComplianceProfile) {
  const tasks: {
    taskType: string;
    dueDate: Date;
    period: string;
    status: string;
    penaltyIfLate: number;
  }[] = [];

  const currentYear = 2026;

  // 1. ITR Filing
  if (profile.role === "INDIVIDUAL") {
    const isAudit = profile.isAudit || false;
    tasks.push({
      taskType: "ITR Filing (Non-Audit)",
      dueDate: new Date(currentYear, 6, 31), // July 31, 2026
      period: `FY ${currentYear - 1}-${currentYear % 100}`,
      status: "PENDING",
      penaltyIfLate: 5000,
    });
  } else if (profile.role === "BUSINESS") {
    const isAudit = profile.isAudit !== false; // Default to business audit
    tasks.push({
      taskType: isAudit ? "ITR Filing (Audit Case)" : "ITR Filing (Non-Audit)",
      dueDate: isAudit ? new Date(currentYear, 9, 31) : new Date(currentYear, 6, 31), // Oct 31 vs July 31
      period: `FY ${currentYear - 1}-${currentYear % 100}`,
      status: "PENDING",
      penaltyIfLate: 10000,
    });
  }

  // 2. GST Returns (GSTR-1 and GSTR-3B)
  if (profile.hasGstin || profile.role === "BUSINESS") {
    // Generate tasks for June, July, August 2026
    const months = [
      { name: "June 2026", num: 5 }, // 0-indexed, June is 5
      { name: "July 2026", num: 6 },
      { name: "August 2026", num: 7 }
    ];

    months.forEach((m) => {
      // GSTR-1: 11th of next month
      tasks.push({
        taskType: "GSTR-1 Return Filing",
        dueDate: new Date(currentYear, m.num + 1, 11),
        period: m.name,
        status: "PENDING",
        penaltyIfLate: 50 * 30, // Rs. 50/day approx
      });

      // GSTR-3B: 20th of next month
      tasks.push({
        taskType: "GSTR-3B Return Filing",
        dueDate: new Date(currentYear, m.num + 1, 20),
        period: m.name,
        status: "PENDING",
        penaltyIfLate: 50 * 30,
      });
    });
  }

  // 3. TDS Payment (7th of next month)
  if (profile.hasTan || profile.role === "BUSINESS") {
    const months = [
      { name: "June 2026", num: 5 },
      { name: "July 2026", num: 6 }
    ];

    months.forEach((m) => {
      tasks.push({
        taskType: "TDS Payment",
        dueDate: new Date(currentYear, m.num + 1, 7),
        period: m.name,
        status: "PENDING",
        penaltyIfLate: 200 * 30, // Rs. 200/day
      });
    });
  }

  // 4. PF / ESI Payment (15th of next month)
  if (profile.role === "BUSINESS") {
    const months = [
      { name: "June 2026", num: 5 },
      { name: "July 2026", num: 6 }
    ];

    months.forEach((m) => {
      tasks.push({
        taskType: "PF/ESI Statutory Payment",
        dueDate: new Date(currentYear, m.num + 1, 15),
        period: m.name,
        status: "PENDING",
        penaltyIfLate: 1000,
      });
    });
  }

  // 5. ROC filings (MGT-7 Nov 29 | AOC-4 Oct 29) for corporates (represented by hasCin)
  if (profile.hasCin || (profile.role === "BUSINESS" && profile.hasCin)) {
    tasks.push({
      taskType: "ROC AOC-4 (Financial Statements)",
      dueDate: new Date(currentYear, 9, 29), // Oct 29, 2026
      period: `FY ${currentYear - 1}-${currentYear % 100}`,
      status: "PENDING",
      penaltyIfLate: 100 * 30, // Rs 100/day
    });

    tasks.push({
      taskType: "ROC MGT-7 (Annual Return)",
      dueDate: new Date(currentYear, 10, 29), // Nov 29, 2026
      period: `FY ${currentYear - 1}-${currentYear % 100}`,
      status: "PENDING",
      penaltyIfLate: 100 * 30,
    });
  }

  // Insert tasks into database
  const createdTasks = [];
  for (const t of tasks) {
    const task = await db.complianceTask.create({
      data: {
        entityId,
        taskType: t.taskType,
        dueDate: t.dueDate,
        period: t.period,
        status: t.status,
        penaltyIfLate: t.penaltyIfLate,
      },
    });
    createdTasks.push(task);
  }

  return createdTasks;
}
