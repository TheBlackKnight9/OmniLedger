"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileSpreadsheet,
  TrendingUp,
  FolderOpen,
  AlertTriangle,
  Receipt,
  Calculator,
  Users,
  FileText,
  Briefcase,
  Users2,
  CheckSquare,
  Calendar,
  UserCheck,
  CreditCard,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  User as UserIcon,
  Search,
  Settings,
  Bot
} from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: "INDIVIDUAL" | "BUSINESS" | "CA_PARTNER" | "CA_STAFF";
    entityId: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "ITR Filing Deadline", desc: "Your Form 16 has been parsed. File by July 31 to avoid Rs 5,000 late fee.", unread: true },
    { id: 2, title: "GSTR-1 Seeding Completed", desc: "Generated monthly filing compliance schedule for June 2026.", unread: true },
    { id: 3, title: "New Document Notice", desc: "Income Tax Department issued a routine validation reminder.", unread: false }
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case "INDIVIDUAL":
        return [
          { name: "Dashboard", href: "/dashboard/itr", icon: LayoutDashboard },
          { name: "File ITR", href: "/dashboard/itr/file", icon: FileSpreadsheet },
          { name: "Tax Planner", href: "/dashboard/itr/planner", icon: TrendingUp },
          { name: "Documents", href: "/dashboard/documents", icon: FolderOpen },
          { name: "Assistant", href: "/dashboard/assistant", icon: Bot },
          { name: "Notices", href: "/dashboard/itr/notices", icon: AlertTriangle },
        ];
      case "BUSINESS":
        return [
          { name: "Dashboard", href: "/dashboard/business", icon: LayoutDashboard },
          { name: "GST Returns", href: "/dashboard/business/gst", icon: Receipt },
          { name: "Bookkeeping", href: "/dashboard/business/bookkeeping", icon: Calculator },
          { name: "Payroll", href: "/dashboard/business/payroll", icon: Users },
          { name: "TDS Filing", href: "/dashboard/business/tds", icon: FileText },
          { name: "ROC Returns", href: "/dashboard/business/roc", icon: Briefcase },
          { name: "Documents", href: "/dashboard/documents", icon: FolderOpen },
          { name: "Assistant", href: "/dashboard/assistant", icon: Bot },
        ];
      case "CA_PARTNER":
      case "CA_STAFF":
        return [
          { name: "Clients", href: "/dashboard/firm", icon: Users2 },
          { name: "Tasks", href: "/dashboard/firm/tasks", icon: CheckSquare },
          { name: "Compliance Calendar", href: "/dashboard/calendar", icon: Calendar },
          { name: "Documents", href: "/dashboard/documents", icon: FolderOpen },
          { name: "Assistant", href: "/dashboard/assistant", icon: Bot },
          { name: "Team Manager", href: "/dashboard/firm/team", icon: UserCheck },
          { name: "Billing", href: "/dashboard/firm/billing", icon: CreditCard },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-neutral-900 bg-neutral-950/40 backdrop-blur-lg transition-all duration-300 relative z-30 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-900">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-extrabold text-white">
              C
            </div>
            {!isSidebarCollapsed && (
              <span className="font-extrabold tracking-tight bg-gradient-to-r from-neutral-50 to-indigo-400 bg-clip-text text-transparent">
                CA OS
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-950/50 border border-indigo-500/30 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "text-neutral-400 border border-transparent hover:text-neutral-200 hover:bg-neutral-900/40"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-neutral-400 group-hover:text-neutral-200"}`} />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-900 flex flex-col gap-2">
          {!isSidebarCollapsed && (
            <div className="px-2 py-1 bg-neutral-900/40 rounded-lg border border-neutral-800/50 flex flex-col">
              <span className="text-xs font-semibold text-neutral-400 truncate">{user.name || "User"}</span>
              <span className="text-[10px] text-neutral-500 truncate">{user.email}</span>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`w-full justify-start text-neutral-500 hover:text-rose-400 hover:bg-rose-950/10 ${
              isSidebarCollapsed ? "px-3" : ""
            }`}
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-neutral-900 bg-neutral-950/20 backdrop-blur-md flex items-center justify-between px-6 relative z-20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-neutral-400">Workspace</span>
            <span className="text-neutral-600">/</span>
            <Badge variant="outline" className="bg-neutral-900 border-neutral-800 text-indigo-400 font-mono py-0.5">
              {user.role}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Search bar helper */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search compliance tasks..."
                className="bg-neutral-950/80 border border-neutral-900 rounded-lg pl-9 pr-4 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/50 w-48 transition-all"
              />
            </div>

            {/* Notification Bell Popover */}
            <NotificationBell entityId={user.entityId} />

            {/* Profile Dropdown / Trigger */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 font-bold text-xs uppercase">
                {user.name ? user.name[0] : user.email?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-950/20 relative z-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950 border-t border-neutral-900 flex justify-around items-center z-40 px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 text-[10px] font-semibold transition-all duration-200 ${
                isActive ? "text-indigo-400" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[64px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
