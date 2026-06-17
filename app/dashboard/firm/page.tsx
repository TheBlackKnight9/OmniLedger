import React from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, CheckCircle, ShieldCheck, Clock, Sparkles, Users2, Building2, User } from "lucide-react";

export default async function FirmDashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  // Let's load the CA's entity (their Firm)
  const entity = await db.entity.findFirst({
    where: { userId },
  });

  // For a CA Firm, let's load ALL entities created in the database as mock "clients" 
  // so the CA can immediately see a list of clients they are managing! This is a high-premium touch!
  const clients = await db.entity.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      complianceTasks: true,
    },
  });

  // Calculate stats
  const totalClients = clients.length;
  const totalTasks = clients.reduce((acc, c) => acc + c.complianceTasks.length, 0);
  const pendingTasks = clients.reduce(
    (acc, c) => acc + c.complianceTasks.filter((t) => t.status === "PENDING").length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-4 h-4 animate-pulse" /> CA Firm Workspace
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-100 tracking-tight">
              {entity?.displayName || "CA Associates"}
            </h1>
            <p className="text-neutral-400 text-sm max-w-xl">
              Manage client entity filings, assignments, statutory compliance calendar, and team audits.
            </p>
          </div>
          {entity && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-1 md:self-center font-mono">
              <div className="text-[10px] uppercase font-semibold text-neutral-500 font-sans">CA credentials</div>
              <div className="text-xs text-neutral-300">Firm PAN: <span className="text-neutral-100 font-bold">{entity.pan}</span></div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Practice Verified
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Managed Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-200">{totalClients}</div>
            <p className="text-xs text-neutral-500 mt-1">Assigned client entities</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Total Seeding Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-200">{totalTasks}</div>
            <p className="text-xs text-neutral-500 mt-1">Compliance calendar items tracked</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-400">Open Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-200">{pendingTasks}</div>
            <p className="text-xs text-neutral-500 mt-1">Pending client reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card className="bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-400" /> Active Client Accounts
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Registered taxpayer portfolios and seeded schedules managed under your CA license.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-neutral-900">
          {clients.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-sm">
              No clients managed under this firm yet.
            </div>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold text-neutral-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-500" /> {client.displayName}
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center gap-3">
                    <span>PAN: <strong className="text-neutral-300 font-mono">{client.pan}</strong></span>
                    <span>&bull;</span>
                    <span>Type: <strong className="text-neutral-300">{client.entityType}</strong></span>
                    <span>&bull;</span>
                    <span>Email: <span className="text-neutral-500">{client.user?.email}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-emerald-800 text-emerald-400 bg-emerald-950/15 font-mono text-xs">
                    {client.complianceTasks.length} Seeded Deadlines
                  </Badge>
                  <Badge className="bg-emerald-950 text-emerald-300 hover:bg-emerald-950 border border-emerald-800/50 text-xs px-2.5 py-1 font-semibold">
                    ACTIVE
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
