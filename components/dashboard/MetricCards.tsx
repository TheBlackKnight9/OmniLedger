"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, CalendarRange, Award } from "lucide-react";

interface MetricCardsProps {
  metrics: {
    complianceScore: number;
    dueThisMonth: number;
    overdue: number;
    filedThisYear: number;
  };
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-500";
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return "border-emerald-500/20 bg-emerald-950/5";
    if (score >= 50) return "border-amber-500/20 bg-amber-950/5";
    return "border-rose-500/20 bg-rose-950/5";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Card 1: Compliance Score */}
      <Card className={`backdrop-blur-md border border-neutral-800 transition-all ${getScoreBorderColor(metrics.complianceScore)}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Compliance Score
          </CardTitle>
          <Award className={`w-4 h-4 ${getScoreColor(metrics.complianceScore)}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-black ${getScoreColor(metrics.complianceScore)}`}>
            {metrics.complianceScore}%
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">
            Last 12 months filing accuracy
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Due This Month */}
      <Card className="backdrop-blur-md border border-neutral-800 bg-neutral-900/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Due This Month
          </CardTitle>
          <CalendarRange className="w-4 h-4 text-indigo-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-neutral-100">
            {metrics.dueThisMonth}
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">
            Pending tasks for current calendar month
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Overdue */}
      <Card className={`backdrop-blur-md border transition-all ${
        metrics.overdue > 0
          ? "border-rose-500/20 bg-rose-950/5"
          : "border-neutral-800 bg-neutral-900/20"
      }`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Overdue Filings
          </CardTitle>
          <AlertTriangle className={`w-4 h-4 ${metrics.overdue > 0 ? "text-rose-500 animate-pulse" : "text-neutral-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-black ${metrics.overdue > 0 ? "text-rose-500" : "text-neutral-100"}`}>
            {metrics.overdue}
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">
            filings past due_date (status != FILED)
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Filed This Year */}
      <Card className="backdrop-blur-md border border-neutral-800 bg-neutral-900/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Filed This Year
          </CardTitle>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-neutral-100">
            {metrics.filedThisYear}
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">
            Total filings completed in current FY
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
