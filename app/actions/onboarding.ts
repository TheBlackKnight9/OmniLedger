"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { seedComplianceTasks } from "@/lib/complianceRules";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export async function completeOnboarding(formData: {
  role: "INDIVIDUAL" | "BUSINESS" | "CA_PARTNER";
  pan: string;
  displayName: string;
  gstin?: string;
  cin?: string;
  tan?: string;
  salarySources?: string[];
  firmName?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Determine entity details
  let entityType = "INDIVIDUAL";
  if (formData.role === "BUSINESS") {
    entityType = formData.cin ? "COMPANY" : "PARTNERSHIP_OR_LLP";
  } else if (formData.role === "CA_PARTNER") {
    entityType = "FIRM";
  }

  // Define compliance profile JSON
  const complianceProfile = {
    role: formData.role,
    isAudit: formData.role === "BUSINESS", // Default business to audit
    hasGstin: !!formData.gstin,
    hasTan: !!formData.tan,
    hasCin: !!formData.cin,
    salarySources: formData.salarySources || [],
    firmName: formData.firmName || "",
  };

  // Perform database transaction
  const result = await db.$transaction(async (tx) => {
    let mappedRole: Role = "INDIVIDUAL";
    if (formData.role === "BUSINESS") mappedRole = "BUSINESS";
    if (formData.role === "CA_PARTNER") mappedRole = "CA_PARTNER";

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { role: mappedRole },
    });

    const entity = await tx.entity.create({
      data: {
        userId,
        entityType,
        pan: formData.pan.toUpperCase(),
        gstin: formData.gstin ? formData.gstin.toUpperCase() : null,
        cin: formData.cin ? formData.cin.toUpperCase() : null,
        tan: formData.tan ? formData.tan.toUpperCase() : null,
        displayName: formData.displayName,
        complianceProfile,
      },
    });

    return { entity, user: updatedUser };
  });

  // Seed compliance tasks
  await seedComplianceTasks(result.entity.id, complianceProfile);

  // Write audit log
  await db.auditLog.create({
    data: {
      userId,
      action: "COMPLETE_ONBOARDING",
      resourceType: "Entity",
      resourceId: result.entity.id,
      ipAddress: "127.0.0.1",
    },
  });

  // Role-based redirects
  if (result.user.role === "INDIVIDUAL") {
    redirect("/dashboard/itr");
  } else if (result.user.role === "BUSINESS") {
    redirect("/dashboard/business");
  } else if (result.user.role === "CA_PARTNER") {
    redirect("/dashboard/firm");
  } else {
    redirect("/dashboard");
  }
}
