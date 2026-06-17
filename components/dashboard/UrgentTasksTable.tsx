"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ComplianceTask } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, FileWarning } from "lucide-react";

interface UrgentTasksTableProps {
  tasks: ComplianceTask[];
}

export default function UrgentTasksTable({ tasks }: UrgentTasksTableProps) {
  const router = useRouter();

  const getDaysLeft = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRowStyle = (days: number) => {
    if (days <= 3) return "bg-rose-950/20 text-rose-300 border-rose-950/50 hover:bg-rose-950/30";
    if (days <= 7) return "text-amber-400 border-neutral-900 hover:bg-neutral-900/10";
    return "text-neutral-300 border-neutral-900 hover:bg-neutral-900/10";
  };

  const getDaysBadge = (days: number) => {
    if (days < 0) return <Badge className="bg-rose-950 text-rose-300 border border-rose-800/40">Overdue</Badge>;
    if (days <= 3) return <Badge className="bg-rose-600 text-white border border-rose-500">Due in {days}d</Badge>;
    if (days <= 7) return <Badge className="bg-amber-950 text-amber-300 border border-amber-800/30">Due in {days}d</Badge>;
    return <Badge className="bg-indigo-950 text-indigo-300 border border-indigo-800/30">{days} days left</Badge>;
  };

  const handleStartFiling = (taskType: string) => {
    const type = taskType.toUpperCase();
    if (type.includes("ITR")) {
      router.push("/dashboard/itr");
    } else if (type.includes("GST") || type.includes("GSTR")) {
      router.push("/dashboard/business"); // business dashboard handles GST returns
    } else if (type.includes("TDS")) {
      router.push("/dashboard/business"); // business dashboard handles TDS
    } else if (type.includes("ROC")) {
      router.push("/dashboard/business"); // business dashboard handles ROC
    } else if (type.includes("PF") || type.includes("ESI")) {
      router.push("/dashboard/business"); // business dashboard handles Payroll
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20 backdrop-blur-md">
      <div className="p-4 border-b border-neutral-900/80 bg-neutral-900/20 flex items-center justify-between">
        <h3 className="font-bold text-sm text-neutral-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" /> Urgent Compliance Filings
        </h3>
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
          Top 5 closest deadlines
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-950/40 border-b border-neutral-900 text-xs font-semibold text-neutral-400">
              <th className="p-4">Filing Task</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Days Left</th>
              <th className="p-4">Penalty/day</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/40 text-xs">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium">
                  All current compliance schedules have been completed.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const daysLeft = getDaysLeft(task.dueDate);
                return (
                  <tr
                    key={task.id}
                    className={`transition-all duration-200 border-b ${getRowStyle(daysLeft)}`}
                  >
                    <td className="p-4 font-bold flex items-center gap-2 text-neutral-100">
                      {daysLeft <= 3 && <FileWarning className="w-4 h-4 text-rose-500 animate-pulse" />}
                      {task.taskType}
                    </td>
                    <td className="p-4 font-mono text-neutral-400">{new Date(task.dueDate).toDateString()}</td>
                    <td className="p-4">{getDaysBadge(daysLeft)}</td>
                    <td className="p-4 font-mono font-medium text-neutral-400">
                      {task.penaltyIfLate ? `₹${task.penaltyIfLate}/day` : "None"}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleStartFiling(task.taskType)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] h-7 px-3 flex items-center gap-1 ml-auto shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                      >
                        <Play className="w-3 h-3 fill-current" /> Start Filing
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
