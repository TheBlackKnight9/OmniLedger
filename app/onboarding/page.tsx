import React from "react";
import OnboardingWizard from "@/components/OnboardingWizard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Toaster } from "@/components/ui/toaster";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if they already completed onboarding (i.e. they have an Entity created)
  const existingEntity = await db.entity.findFirst({
    where: { userId: session.user.id },
  });

  if (existingEntity) {
    // Already has an entity, redirect to dashboard based on role
    if (session.user.role === "INDIVIDUAL") {
      redirect("/dashboard/itr");
    } else if (session.user.role === "BUSINESS") {
      redirect("/dashboard/business");
    } else if (session.user.role === "CA_PARTNER" || session.user.role === "CA_STAFF") {
      redirect("/dashboard/firm");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />

      {/* Dynamic background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] z-0" />

      <header className="mb-8 text-center relative z-10 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-50 via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
          CA OS
        </h1>
        <p className="text-neutral-500 text-sm">
          Filing Entity Workspace Setup &bull; Logged in as {session.user.email}
        </p>
      </header>

      <main className="w-full relative z-10">
        <OnboardingWizard />
      </main>

      <footer className="mt-12 text-center text-xs text-neutral-600 relative z-10">
        Secure & encrypted session &bull; CA OS Compliance Seeder v1.0
      </footer>

      {/* UI Toaster for notifications */}
      <Toaster />
    </div>
  );
}
