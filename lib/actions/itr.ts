"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getDefaultEntity() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const entity = await db.entity.findFirst({
    where: { userId: session.user.id }
  });
  
  return entity?.id || null;
}

export async function createITRDraft(entityId: string, itrForm: string, assessmentYear: string = "2025-26") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const draft = await db.iTRDraft.create({
    data: {
      entityId,
      assessmentYear,
      itrForm,
      status: "DRAFT",
    },
  });

  return draft;
}

export async function getITRDraft(draftId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const draft = await db.iTRDraft.findUnique({
    where: { id: draftId },
  });

  if (!draft) throw new Error("Draft not found");

  return draft;
}

export async function updateITRDraft(draftId: string, section: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updateData: any = {};
  updateData[section] = data;

  const draft = await db.iTRDraft.update({
    where: { id: draftId },
    data: updateData,
  });

  revalidatePath(`/dashboard/itr/${draftId}`);
  return draft;
}

// Compute tax engine (Simplified)
export async function computeTax(draftId: string) {
  const draft = await getITRDraft(draftId);

  const salaryData = (draft.salaryIncome as any) || {};
  const otherData = (draft.otherIncome as any) || {};
  const deductionsData = (draft.deductions as any) || {};

  // Salary
  const grossSalary = Number(salaryData.grossSalary || 0);
  const standardDeduction = 75000; // New standard deduction
  const professionalTax = Number(salaryData.professionalTax || 0);
  
  // HRA Exemption computation
  const basicSalary = Number(salaryData.basic || 0);
  const hraReceived = Number(salaryData.hraReceived || 0);
  const rentPaid = Number(salaryData.rentPaid || 0) * 12; // Annual
  const hraCity = salaryData.hraCity || 'non-metro';
  
  const hraLimit1 = hraReceived;
  const hraLimit2 = rentPaid - (0.1 * basicSalary);
  const hraLimit3 = (hraCity === 'metro' ? 0.5 : 0.4) * basicSalary;
  
  const hraExempt = Math.max(0, Math.min(hraLimit1, hraLimit2, hraLimit3));

  // Note: Standard deduction is 50k for Old Regime, 75k for New Regime (latest budgets)
  // We'll compute both regimes.
  
  // Other Income
  const savingsInterest = Number(otherData.savingsInterest || 0);
  const fdInterest = Number(otherData.fdInterest || 0);
  const dividend = Number(otherData.dividend || 0);
  const otherIncomeTotal = savingsInterest + fdInterest + dividend;

  // Deductions (Old Regime only, except 80CCD(2) which isn't modeled here)
  const sec80C = Math.min(150000, Number(deductionsData.sec80C || 0));
  const sec80CCD1B = Math.min(50000, Number(deductionsData.sec80CCD1B || 0));
  const sec80D = Number(deductionsData.sec80D || 0);
  const sec80G = Number(deductionsData.sec80G || 0);
  
  const totalDeductionsOld = sec80C + sec80CCD1B + sec80D + sec80G;

  // --- OLD REGIME ---
  const salaryTaxableOld = Math.max(0, grossSalary - hraExempt - professionalTax - 50000); // 50k SD for old
  const gtiOld = salaryTaxableOld + otherIncomeTotal;
  const taxableIncomeOld = Math.max(0, gtiOld - totalDeductionsOld);
  
  let slabTaxOld = 0;
  if (taxableIncomeOld > 1000000) {
    slabTaxOld += (taxableIncomeOld - 1000000) * 0.30;
    slabTaxOld += 500000 * 0.20;
    slabTaxOld += 250000 * 0.05;
  } else if (taxableIncomeOld > 500000) {
    slabTaxOld += (taxableIncomeOld - 500000) * 0.20;
    slabTaxOld += 250000 * 0.05;
  } else if (taxableIncomeOld > 250000) {
    slabTaxOld += (taxableIncomeOld - 250000) * 0.05;
  }
  
  const rebateOld = taxableIncomeOld <= 500000 ? slabTaxOld : 0;
  const taxAfterRebateOld = Math.max(0, slabTaxOld - rebateOld);
  const cessOld = taxAfterRebateOld * 0.04;
  const finalTaxOld = taxAfterRebateOld + cessOld;

  // --- NEW REGIME ---
  const salaryTaxableNew = Math.max(0, grossSalary - 75000); // 75k SD for new
  const gtiNew = salaryTaxableNew + otherIncomeTotal;
  const taxableIncomeNew = Math.max(0, gtiNew); // No 80C/80D/HRA in new regime
  
  let slabTaxNew = 0;
  if (taxableIncomeNew > 1500000) {
    slabTaxNew += (taxableIncomeNew - 1500000) * 0.30;
    slabTaxNew += 300000 * 0.20;
    slabTaxNew += 200000 * 0.15;
    slabTaxNew += 300000 * 0.10;
    slabTaxNew += 400000 * 0.05;
  } else if (taxableIncomeNew > 1200000) {
    slabTaxNew += (taxableIncomeNew - 1200000) * 0.20;
    slabTaxNew += 200000 * 0.15;
    slabTaxNew += 300000 * 0.10;
    slabTaxNew += 400000 * 0.05;
  } else if (taxableIncomeNew > 1000000) {
    slabTaxNew += (taxableIncomeNew - 1000000) * 0.15;
    slabTaxNew += 300000 * 0.10;
    slabTaxNew += 400000 * 0.05;
  } else if (taxableIncomeNew > 700000) {
    slabTaxNew += (taxableIncomeNew - 700000) * 0.10;
    slabTaxNew += 400000 * 0.05;
  } else if (taxableIncomeNew > 300000) {
    slabTaxNew += (taxableIncomeNew - 300000) * 0.05;
  }
  
  const rebateNew = taxableIncomeNew <= 700000 ? slabTaxNew : 0;
  const taxAfterRebateNew = Math.max(0, slabTaxNew - rebateNew);
  const cessNew = taxAfterRebateNew * 0.04;
  const finalTaxNew = taxAfterRebateNew + cessNew;

  const computation = {
    oldRegime: {
      gti: gtiOld,
      deductions: totalDeductionsOld,
      taxableIncome: taxableIncomeOld,
      slabTax: slabTaxOld,
      rebate87A: rebateOld,
      taxAfterRebate: taxAfterRebateOld,
      cess: cessOld,
      finalTax: finalTaxOld,
    },
    newRegime: {
      gti: gtiNew,
      deductions: 0,
      taxableIncome: taxableIncomeNew,
      slabTax: slabTaxNew,
      rebate87A: rebateNew,
      taxAfterRebate: taxAfterRebateNew,
      cess: cessNew,
      finalTax: finalTaxNew,
    },
    recommended: finalTaxNew < finalTaxOld ? "New Regime" : "Old Regime",
    savings: Math.abs(finalTaxOld - finalTaxNew),
  };

  await db.iTRDraft.update({
    where: { id: draftId },
    data: { taxComputation: computation },
  });

  return computation;
}

export async function fileITR(draftId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Mock API call to ERI
  const ackNumber = `ITR${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
  
  const draft = await db.iTRDraft.update({
    where: { id: draftId },
    data: {
      status: "FILED",
      filedAt: new Date(),
      ackNumber,
    },
  });

  revalidatePath(`/dashboard/itr/${draftId}`);
  return draft;
}
