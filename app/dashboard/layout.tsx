import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { db } from "@/lib/db";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Ensure they have onboarding completed. If they don't have an Entity, redirect to onboarding!
  const existingEntity = await db.entity.findFirst({
    where: { userId: session.user.id },
  });

  if (!existingEntity) {
    redirect("/onboarding");
  }

  return (
    <DashboardLayout
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        entityId: existingEntity.id,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
