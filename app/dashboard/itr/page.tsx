import React from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, CheckCircle, ShieldCheck, Clock, Sparkles } from "lucide-react";

export default async function ItrDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  const entity = await db.entity.findFirst({
    where: { userId },
  });

  const tasks = entity
    ? await db.complianceTask.findMany({
        where: { entityId: entity.id },
        orderBy: { dueDate: "asc" },
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-pulse" /> Individual Workspace
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-100 tracking-tight">
              Welcome back, {session?.user?.name || "Taxpayer"}
            </h1>
            <p className="text-neutral-400 text-sm max-w-xl">
              Monitor your ITR filing progress, upcoming deadlines, and upload files to your secure tax vault.
            </p>
          </div>
          {entity && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-1 md:self-center">
              <div className="text-[10px] uppercase font-semibold text-neutral-500">Taxpayer PAN</div>
              <div className="font-mono text-sm text-neutral-200 font-bold tracking-wider">{entity.pan}</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Seeding Active
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Total Seeding Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-200">{tasks.length}</div>
            <p className="text-xs text-neutral-500 mt-1">Directly loaded from compliance calendar</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Filing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-950 text-amber-400 hover:bg-amber-950 border border-amber-800/50 text-xs px-2 py-0.5">
                Draft / In-Progress
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-2">ITR-1 / ITR-2 Auto-calculated</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-200">
              {tasks.filter((t) => t.status === "PENDING").length}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Filing schedule tasks need verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Task Seeding List */}
      <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Seeded Compliance Calendar
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Mandatory filing deadlines computed based on your onboarding compliance profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-neutral-900">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-sm">
              No compliance tasks seeded yet. Complete onboarding to generate deadlines.
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold text-neutral-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-500" /> {task.taskType}
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center gap-3">
                    <span>Period: <strong className="text-neutral-300">{task.period}</strong></span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" /> Due: {new Date(task.dueDate).toDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {task.penaltyIfLate && (
                    <Badge variant="outline" className="border-rose-950 text-rose-400 bg-rose-950/10 font-mono text-xs">
                      Late Penalty: ₹{task.penaltyIfLate}
                    </Badge>
                  )}
                  <Badge className="bg-indigo-950 text-indigo-300 hover:bg-indigo-950 border border-indigo-800/50 text-xs px-2.5 py-1">
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
