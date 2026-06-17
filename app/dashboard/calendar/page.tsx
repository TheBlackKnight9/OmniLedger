import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCalendarTasks } from "@/lib/actions/dashboard";
import CalendarView from "@/components/dashboard/CalendarView";
import { Sparkles, Calendar } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

interface CalendarPageProps {
  searchParams: {
    month?: string;
    year?: string;
  };
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
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

  const now = new Date();
  const month = searchParams.month ? parseInt(searchParams.month, 10) : now.getMonth() + 1;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : now.getFullYear();

  // Load calendar tasks grouped by date
  const groupedTasks = await getCalendarTasks(existingEntity.id, month, year);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Indian Tax Ledger
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-100 tracking-tight flex items-center gap-2">
            <Calendar className="w-8 h-8 text-indigo-500" /> Compliance Calendar
          </h1>
          <p className="text-neutral-500 text-xs font-medium">
            Filing schedules for {monthNames[month - 1]} {year} based on profile parameters.
          </p>
        </div>
      </div>

      {/* Interactive Month Grid / List View */}
      <CalendarView tasks={groupedTasks} month={month} year={year} />

      {/* Render local toast updates */}
      <Toaster />
    </div>
  );
}
