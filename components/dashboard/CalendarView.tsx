"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ComplianceTask } from "@prisma/client";
import { markTaskFiled } from "@/lib/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, List, Filter, FileCheck, Info, Clock, AlertTriangle } from "lucide-react";

interface CalendarViewProps {
  tasks: Record<string, ComplianceTask[]>;
  month: number;
  year: number;
}

const getTaskColorClass = (taskType: string) => {
  const type = taskType.toUpperCase();
  if (type.includes("ITR")) return "bg-[#185FA5] text-white";
  if (type.includes("GST")) return "bg-[#0F6E56] text-white";
  if (type.includes("TDS")) return "bg-[#854F0B] text-white";
  if (type.includes("ROC") || type.includes("MCA")) return "bg-[#3C3489] text-white";
  if (type.includes("PF") || type.includes("ESI")) return "bg-[#A32D2D] text-white";
  return "bg-neutral-800 text-neutral-200";
};

const getTaskShortName = (taskType: string) => {
  if (taskType.length <= 10) return taskType;
  if (taskType.toUpperCase().includes("ITR")) return "ITR Filing";
  if (taskType.toUpperCase().includes("GSTR-1")) return "GSTR-1";
  if (taskType.toUpperCase().includes("GSTR-3B")) return "GSTR-3B";
  if (taskType.toUpperCase().includes("TDS")) return "TDS Pay";
  if (taskType.toUpperCase().includes("PF/ESI")) return "PF/ESI";
  if (taskType.toUpperCase().includes("ROC AOC-4")) return "ROC AOC-4";
  if (taskType.toUpperCase().includes("ROC MGT-7")) return "ROC MGT-7";
  return taskType.slice(0, 10);
};

export default function CalendarView({ tasks, month, year }: CalendarViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  
  // Filter States
  const [filters, setFilters] = useState({
    ITR: true,
    GST: true,
    TDS: true,
    ROC: true,
    PF: true
  });

  // Drawer/Sheet States
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFiling, setIsFiling] = useState<string | null>(null);

  // Month navigation
  const navigateMonth = (direction: "prev" | "next") => {
    let targetMonth = month;
    let targetYear = year;

    if (direction === "prev") {
      if (month === 1) {
        targetMonth = 12;
        targetYear = year - 1;
      } else {
        targetMonth = month - 1;
      }
    } else {
      if (month === 12) {
        targetMonth = 1;
        targetYear = year + 1;
      } else {
        targetMonth = month + 1;
      }
    }

    router.push(`/dashboard/calendar?month=${targetMonth}&year=${targetYear}`);
  };

  const getFilteredTasks = (taskList: ComplianceTask[] = []) => {
    return taskList.filter((task) => {
      const type = task.taskType.toUpperCase();
      if (type.includes("ITR") && !filters.ITR) return false;
      if (type.includes("GST") && !filters.GST) return false;
      if (type.includes("TDS") && !filters.TDS) return false;
      if (type.includes("ROC") && !filters.ROC) return false;
      if ((type.includes("PF") || type.includes("ESI")) && !filters.PF) return false;
      return true;
    });
  };

  // Build grid calendar numbers
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();
  const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();

  const gridCells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Inactive leading days from prev month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    gridCells.push({ day: dayNum, dateStr, isCurrentMonth: false });
  }

  // Active days of current month
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    gridCells.push({ day: i, dateStr, isCurrentMonth: true });
  }

  // Leading trailing days from next month to fill grid row
  const totalCells = gridCells.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    gridCells.push({ day: i, dateStr, isCurrentMonth: false });
  }

  // Handle day click
  const handleDayClick = (dateStr: string) => {
    const tasksOnDay = tasks[dateStr] || [];
    const filteredTasksOnDay = getFilteredTasks(tasksOnDay);
    if (filteredTasksOnDay.length > 0) {
      setSelectedDateStr(dateStr);
      setIsDrawerOpen(true);
    }
  };

  // Mark task as filed action
  const handleMarkFiled = async (taskId: string) => {
    setIsFiling(taskId);
    try {
      await markTaskFiled(taskId);
      toast({
        title: "✓ Task marked as filed",
        description: "Status successfully updated and audited.",
        className: "bg-emerald-950 border-emerald-800 text-emerald-100",
      });
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast({
        title: "Filing Failed",
        description: err.message || "Failed to mark as filed.",
        variant: "destructive",
      });
    } finally {
      setIsFiling(null);
    }
  };

  // Prepare List View Tasks (Next 30 days list view)
  const allTasksList: ComplianceTask[] = [];
  Object.values(tasks).forEach((tList) => {
    allTasksList.push(...tList);
  });
  
  const filteredTasksList = getFilteredTasks(allTasksList).sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingBadgeClass = (days: number) => {
    if (days <= 3) return "bg-rose-950 text-rose-300 border-rose-800/40";
    if (days <= 7) return "bg-amber-950 text-amber-300 border-amber-800/40";
    return "bg-emerald-950 text-emerald-300 border-emerald-800/40";
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/40 p-4 rounded-xl border border-neutral-800/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="border-neutral-800 text-neutral-400 hover:text-neutral-200"
          >
            &lt; Prev
          </Button>
          <span className="font-bold text-lg text-neutral-100 min-w-[140px] text-center">
            {monthNames[month - 1]} {year}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="border-neutral-800 text-neutral-400 hover:text-neutral-200"
          >
            Next &gt;
          </Button>
        </div>

        {/* View togglers & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex border border-neutral-800 rounded-lg p-0.5 bg-neutral-950/80">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "month" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Month View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "list" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
          </div>

          {/* Filters dropdown indicator */}
          <div className="flex items-center gap-2 border border-neutral-800/80 rounded-lg bg-neutral-950/80 px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <div className="flex gap-3 text-xs">
              {(["ITR", "GST", "TDS", "ROC", "PF"] as const).map((f) => (
                <label key={f} className="flex items-center gap-1.5 cursor-pointer text-neutral-400 hover:text-neutral-200">
                  <input
                    type="checkbox"
                    checked={filters[f]}
                    onChange={(e) => setFilters({ ...filters, [f]: e.target.checked })}
                    className="rounded border-neutral-700 bg-neutral-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Container */}
      {viewMode === "month" ? (
        <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20 backdrop-blur-md">
          {/* Day Names header */}
          <div className="grid grid-cols-7 border-b border-neutral-900 bg-neutral-900/40 text-center font-bold text-xs text-neutral-400 py-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 bg-neutral-950/10 divide-x divide-y divide-neutral-900/80">
            {gridCells.map((cell, idx) => {
              const dayTasks = tasks[cell.dateStr] || [];
              const filteredDayTasks = getFilteredTasks(dayTasks);
              const hasTasks = filteredDayTasks.length > 0;

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => handleDayClick(cell.dateStr)}
                  className={`min-h-[100px] p-2 flex flex-col justify-between transition-colors border-neutral-900 ${
                    cell.isCurrentMonth ? "bg-neutral-950/20" : "bg-neutral-950/5 opacity-30"
                  } ${hasTasks ? "cursor-pointer hover:bg-neutral-900/30" : ""}`}
                >
                  <span className={`text-xs font-semibold ${
                    cell.isCurrentMonth ? "text-neutral-400" : "text-neutral-600"
                  }`}>
                    {cell.day}
                  </span>
                  
                  {/* Task Pills */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    {filteredDayTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded truncate tracking-wide flex items-center justify-between ${getTaskColorClass(t.taskType)} ${
                          t.status === "FILED" ? "opacity-40 line-through" : ""
                        }`}
                        title={`${t.taskType}: ${t.status}`}
                      >
                        <span>{getTaskShortName(t.taskType)}</span>
                        {t.status === "FILED" && <FileCheck className="w-2.5 h-2.5 flex-shrink-0 ml-1 text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900/40 border-b border-neutral-900 text-xs font-semibold text-neutral-400">
                  <th className="p-4">Filing Task</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Days Remaining</th>
                  <th className="p-4">Est. Penalty/day</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/60 text-sm text-neutral-300">
                {filteredTasksList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                      No matching tasks found for the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasksList.map((task) => {
                    const daysRemaining = getDaysRemaining(task.dueDate);
                    const isFiled = task.status === "FILED";

                    return (
                      <tr key={task.id} className={`hover:bg-neutral-900/20 transition-colors ${
                        isFiled ? "opacity-50" : ""
                      }`}>
                        <td className="p-4 font-semibold text-neutral-200">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${getTaskColorClass(task.taskType)}`} />
                          {task.taskType}
                        </td>
                        <td className="p-4 text-xs text-neutral-400">{task.period}</td>
                        <td className="p-4 text-xs text-neutral-400 font-mono">
                          {new Date(task.dueDate).toDateString()}
                        </td>
                        <td className="p-4">
                          {isFiled ? (
                            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800/40">FILED</Badge>
                          ) : (
                            <Badge className={`border ${getDaysRemainingBadgeClass(daysRemaining)}`}>
                              {daysRemaining < 0
                                ? `${Math.abs(daysRemaining)} days overdue`
                                : daysRemaining === 0
                                ? "Due today"
                                : `${daysRemaining} days left`}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-xs font-mono text-neutral-400">
                          {task.penaltyIfLate ? `₹${task.penaltyIfLate}/day` : "None"}
                        </td>
                        <td className="p-4 text-right">
                          {!isFiled ? (
                            <Button
                              size="sm"
                              onClick={() => handleMarkFiled(task.id)}
                              disabled={isFiling === task.id}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-1 h-8"
                            >
                              {isFiling === task.id ? "Filing..." : "Mark Filed"}
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-500 font-medium flex items-center justify-end gap-1">
                              <FileCheck className="w-4 h-4" /> Filed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Drawer details Sheet */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="bg-neutral-950 border-l border-neutral-800 text-neutral-100 max-w-md w-full">
          <SheetHeader className="space-y-1.5 border-b border-neutral-900 pb-4">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-400" /> Day Filings Detail
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-400">
              Taxpayer deadlines scheduled for {selectedDateStr && new Date(selectedDateStr).toDateString()}
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)]">
            {selectedDateStr && getFilteredTasks(tasks[selectedDateStr] || []).map((t) => {
              const isFiled = t.status === "FILED";
              const daysLeft = getDaysRemaining(t.dueDate);

              return (
                <div key={t.id} className="p-4 rounded-xl border border-neutral-900 bg-neutral-900/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${getTaskColorClass(t.taskType)}`}>
                      {getTaskShortName(t.taskType)}
                    </span>
                    {isFiled ? (
                      <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800/40">FILED</Badge>
                    ) : (
                      <Badge className={`border text-[10px] ${getDaysRemainingBadgeClass(daysLeft)}`}>
                        {daysLeft < 0 ? "OVERDUE" : `${daysLeft} Days Left`}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-neutral-200 text-sm leading-snug">{t.taskType}</h4>
                    <p className="text-xs text-neutral-400">Period: <strong className="text-neutral-300">{t.period}</strong></p>
                  </div>

                  <div className="border-t border-neutral-900/60 pt-3 space-y-2 text-xs text-neutral-400">
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span className="font-mono text-neutral-300">{new Date(t.dueDate).toDateString()}</span>
                    </div>
                    {t.penaltyIfLate && t.penaltyIfLate > 0 && (
                      <div className="flex justify-between items-center text-rose-400">
                        <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Penalty if late:</span>
                        <span className="font-bold font-mono">₹{t.penaltyIfLate}/day</span>
                      </div>
                    )}
                  </div>

                  {!isFiled && (
                    <Button
                      onClick={() => handleMarkFiled(t.id)}
                      disabled={isFiling === t.id}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9"
                    >
                      {isFiling === t.id ? "Updating..." : "Mark as Filed"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
