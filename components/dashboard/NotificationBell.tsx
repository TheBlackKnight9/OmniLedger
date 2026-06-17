"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ComplianceTask } from "@prisma/client";
import { getNotificationsData } from "@/lib/actions/dashboard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Clock, AlertTriangle } from "lucide-react";

interface NotificationBellProps {
  entityId: string;
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

export default function NotificationBell({ entityId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<ComplianceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsData(entityId);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (entityId) {
      fetchNotifications();
    }
  }, [entityId]);

  const count = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="relative p-2 text-neutral-400 hover:text-neutral-200 transition-colors rounded-lg bg-neutral-900/40 border border-neutral-800/60 hover:bg-neutral-900 focus:outline-none"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {!loading && count > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="bg-neutral-950 border border-neutral-800 text-neutral-100 w-80 p-0 shadow-2xl relative z-50">
        <div className="p-4 border-b border-neutral-900/80 flex items-center justify-between">
          <span className="font-bold text-sm text-neutral-200 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-indigo-400" /> Notifications
          </span>
          {count > 0 && (
            <Badge className="bg-rose-950 text-rose-300 border border-rose-800/40 text-[9px] font-semibold">
              {count} Alert{count !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto divide-y divide-neutral-900/60">
          {loading ? (
            <div className="p-4 text-center text-xs text-neutral-500 font-medium flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading alerts...
            </div>
          ) : count === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-medium">
              No pending or overdue compliance alerts.
            </div>
          ) : (
            notifications.map((task) => {
              const isOverdue = new Date(task.dueDate).getTime() < new Date().getTime();
              return (
                <div key={task.id} className="p-3 hover:bg-neutral-900/30 transition-colors flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getTaskColorClass(task.taskType)}`}>
                      {task.taskType.includes("ITR") ? "ITR" : task.taskType.includes("GST") ? "GST" : task.taskType.includes("TDS") ? "TDS" : task.taskType.includes("ROC") ? "ROC" : "PF"}
                    </span>
                    {isOverdue && (
                      <span className="text-[9px] text-rose-400 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3 text-rose-500" /> OVERDUE
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-xs text-neutral-200 leading-snug truncate" title={task.taskType}>
                    {task.taskType}
                  </h4>
                  
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <span className="font-mono text-neutral-600">{task.period}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-2 border-t border-neutral-900/80 bg-neutral-900/10 text-center">
          <Link 
            href="/dashboard/calendar" 
            className="block text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors py-1"
          >
            View all calendar tasks
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
