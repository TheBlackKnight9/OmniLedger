import React from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, CheckCircle, ShieldCheck, Clock, Sparkles, Receipt, Building2 } from "lucide-react";

export default async function BusinessDashboard() {
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
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-4 h-4 animate-pulse" /> Business Workspace
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-100 tracking-tight">
              {entity?.displayName || "Business Dashboard"}
            </h1>
            <p className="text-neutral-400 text-sm max-w-xl">
              Track business GST returns (GSTR-1, GSTR-3B), TDS filings, and corporate ROC compliance milestones.
            </p>
          </div>
          {entity && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-1 md:self-center font-mono">
              <div className="text-[10px] uppercase font-semibold text-neutral-500 font-sans">Corporate IDs</div>
              {entity.pan && <div className="text-xs text-neutral-300">PAN: <span className="text-neutral-100 font-bold">{entity.pan}</span></div>}
              {entity.gstin && <div className="text-xs text-neutral-300">GSTIN: <span className="text-neutral-100 font-bold">{entity.gstin}</span></div>}
              {entity.cin && <div className="text-xs text-neutral-300">CIN: <span className="text-neutral-100 font-bold">{entity.cin}</span></div>}
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Total Seeded Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-200">{tasks.length}</div>
            <p className="text-xs text-neutral-500 mt-1">GSTR, TDS, and PF compliance rules seeded</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Active GST Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-950 text-amber-400 hover:bg-amber-950 border border-amber-800/50 text-xs px-2 py-0.5">
                Regular Taxpayer
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Filing frequency: Monthly</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Pending Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-200">
              {tasks.filter((t) => t.status === "PENDING").length}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Deadlines requiring attention this quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Calendar list */}
      <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" /> Business Compliance Ledger
          </CardTitle>
          <CardDescription className="text-neutral-400">
            GST returns, withholding taxes (TDS), employee PF/ESI, and corporate ROC schedules.
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
                      Late Penalty: ₹{task.penaltyIfLate}/day
                    </Badge>
                  )}
                  <Badge className="bg-amber-950 text-amber-300 hover:bg-amber-950 border border-amber-800/50 text-xs px-2.5 py-1 font-semibold">
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
