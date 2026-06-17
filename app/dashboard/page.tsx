import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getDashboardMetrics } from "@/lib/actions/dashboard";
import MetricCards from "@/components/dashboard/MetricCards";
import UrgentTasksTable from "@/components/dashboard/UrgentTasksTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Sparkles, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const existingEntity = await db.entity.findFirst({
    where: { userId: session.user.id },
  });

  if (!existingEntity) {
    redirect("/onboarding");
  }

  const metrics = await getDashboardMetrics(existingEntity.id);
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" /> Workspace Live Overview
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-100 tracking-tight">
            Good morning, {session.user.name || "Taxpayer"}
          </h1>
          <p className="text-neutral-500 text-xs font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-600" /> {currentDate}
          </p>
        </div>
      </div>

      {/* Row 1: Metric Cards */}
      <MetricCards metrics={metrics} />

      {/* Row 2: Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left Column (60%): Urgent Tasks Table */}
        <div className="lg:col-span-6 space-y-6">
          <UrgentTasksTable tasks={metrics.urgentTasks} />
        </div>

        {/* Right Column (40%): Recent Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          <ActivityFeed entries={metrics.recentActivity} />
        </div>
      </div>
    </div>
  );
}
