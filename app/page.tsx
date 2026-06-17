import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Calendar, Receipt, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/10 rounded-full blur-[140px] z-0" />

      {/* Navigation Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-neutral-900/60 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            C
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-50 via-indigo-100 to-indigo-400 bg-clip-text text-transparent">
            CA OS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-neutral-400 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 relative z-10 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider animate-bounce">
          <Sparkles className="w-4 h-4" /> Next-Gen Compliance Platform for India
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Simplify Tax & compliance for{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-600 bg-clip-text text-transparent">
            Chartered Accountants
          </span>
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl font-medium">
          A modern, secure workspace offering automated compliance calendar seeding, real-time GST status, and seamless ITR filing workflows.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm pt-4">
          <Link href="/register" className="w-full">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)] h-12 text-base flex items-center justify-center gap-2 group">
              Create Free Account <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full border-neutral-800 hover:bg-neutral-900 h-12 text-base text-neutral-300">
              Sign In to Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full max-w-5xl">
          <div className="border border-neutral-900 bg-neutral-950/40 rounded-2xl p-6 text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-neutral-100">Compliance Calendar</h3>
            <p className="text-neutral-400 text-sm">Automated task calculations based on taxpayer profiles: GSTR-1, GSTR-3B, TDS, PF, ROC, and ITR.</p>
          </div>

          <div className="border border-neutral-900 bg-neutral-950/40 rounded-2xl p-6 text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-neutral-100">Role-Specific Viewports</h3>
            <p className="text-neutral-400 text-sm">Optimized dashboards customized for Salaried Individuals, Business Owners, and Chartered Accountants.</p>
          </div>

          <div className="border border-neutral-900 bg-neutral-950/40 rounded-2xl p-6 text-left space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-neutral-100">Verified Tax Records</h3>
            <p className="text-neutral-400 text-sm">Official PAN validation with real-time feedback and secure cryptographic logging.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900/60 py-8 text-center text-xs text-neutral-600 relative z-10 max-w-7xl w-full mx-auto px-6">
        &copy; {new Date().getFullYear()} CA OS Platform Inc. Confidential - Internal Build v1.0
      </footer>
    </div>
  );
}
