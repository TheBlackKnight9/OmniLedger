"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, FileText, CheckCircle, CreditCard, ShieldCheck } from "lucide-react";

export default function ITRDraftLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const id = params.id;

  const NAV_LINKS = [
    { name: "Salary & Income", href: `/dashboard/itr/${id}/income/salary`, icon: CreditCard },
    { name: "Tax Deductions", href: `/dashboard/itr/${id}/deductions`, icon: ShieldCheck },
    { name: "Tax Computation", href: `/dashboard/itr/${id}/tax`, icon: Calculator },
    { name: "Verify & File", href: `/dashboard/itr/${id}/verify`, icon: CheckCircle },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar Flow Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sticky top-6">
          <div className="mb-6 px-2">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Filing Flow</h3>
            <p className="text-sm font-medium text-white">AY 2025-26</p>
          </div>
          
          <nav className="space-y-1">
            {NAV_LINKS.map((link, index) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400" 
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isActive ? "bg-indigo-500/20" : "bg-neutral-800"}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-neutral-800 px-2">
             <div className="flex items-center gap-2 text-xs text-neutral-500">
                <FileText className="w-4 h-4" />
                <span>Auto-saving draft...</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl min-h-[500px]">
          {children}
        </div>
      </div>
    </div>
  );
}
