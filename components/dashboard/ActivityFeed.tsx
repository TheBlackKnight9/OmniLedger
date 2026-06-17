"use client";

import React from "react";
import { AuditLog } from "@prisma/client";
import { CheckSquare, Upload, LogIn, Sparkles, Settings, Activity } from "lucide-react";

interface ActivityFeedProps {
  entries: AuditLog[];
}

function timeAgo(dateInput: Date | string) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  
  return "just now";
}

const getActivityDetails = (entry: AuditLog) => {
  const action = entry.action;
  
  switch (action) {
    case "TASK_FILED":
      return {
        text: `Compliance task marked as filed`,
        icon: CheckSquare,
        color: "text-emerald-400 bg-emerald-950/20 border-emerald-800/40"
      };
    case "COMPLETE_ONBOARDING":
      return {
        text: "Completed CA OS workspace onboarding setup",
        icon: Sparkles,
        color: "text-indigo-400 bg-indigo-950/20 border-indigo-800/40"
      };
    case "USER_REGISTER":
      return {
        text: "Created user credential profile",
        icon: LogIn,
        color: "text-blue-400 bg-blue-950/20 border-blue-800/40"
      };
    case "UPLOAD_DOC":
      return {
        text: "Uploaded supporting compliance document",
        icon: Upload,
        color: "text-amber-400 bg-amber-950/20 border-amber-800/40"
      };
    default:
      return {
        text: `${action} completed on ${entry.resourceType}`,
        icon: Activity,
        color: "text-neutral-400 bg-neutral-900/40 border-neutral-800/40"
      };
  }
};

export default function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <div className="border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950/20 backdrop-blur-md">
      <div className="p-4 border-b border-neutral-900/80 bg-neutral-900/20">
        <h3 className="font-bold text-sm text-neutral-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> Recent Audit Activity
        </h3>
      </div>

      <div className="p-4 space-y-4 max-h-[340px] overflow-y-auto">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500 font-medium">
            No activity logged in current workspace audits.
          </div>
        ) : (
          entries.map((entry) => {
            const details = getActivityDetails(entry);
            const Icon = details.icon;

            return (
              <div key={entry.id} className="flex gap-3 items-start text-xs border-b border-neutral-900/30 pb-3 last:border-0 last:pb-0">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${details.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-semibold text-neutral-200 leading-snug truncate">
                    {details.text}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span>IP: {entry.ipAddress || "Local"}</span>
                    <span className="font-mono">{timeAgo(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
