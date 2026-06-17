"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { computeTax } from "@/lib/actions/itr";

export default function TaxComputationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [computation, setComputation] = useState<any>(null);

  useEffect(() => {
    computeTax(id).then(res => {
      setComputation(res);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (!computation) return <div className="p-12 text-center text-neutral-400">Failed to compute tax. Please go back and check your entries.</div>;

  const { oldRegime, newRegime, recommended, savings } = computation;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Tax Computation</h2>
          <p className="text-sm text-neutral-400">Old vs New Regime Comparison</p>
        </div>
      </div>

      <div className="p-6 flex-1 space-y-6">
        
        {/* Recommendation Banner */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">We recommend the {recommended}</h3>
              <p className="text-sm text-indigo-200">
                You save <strong>₹{savings.toLocaleString('en-IN')}</strong> in taxes by opting for the {recommended}.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Old Regime Card */}
          <Card className={`bg-neutral-950 border ${recommended === 'Old Regime' ? 'border-indigo-500 shadow-sm shadow-indigo-500/10' : 'border-neutral-800'}`}>
            <div className={`p-4 border-b ${recommended === 'Old Regime' ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-neutral-800 bg-neutral-900/50'} flex justify-between items-center rounded-t-xl`}>
               <h3 className="font-semibold text-white">Old Regime</h3>
               {recommended === 'Old Regime' && <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-medium">Recommended</span>}
            </div>
            <div className="p-5 space-y-4 text-sm">
               <div className="flex justify-between text-neutral-300">
                  <span>Gross Taxable Income</span>
                  <span>₹{oldRegime.gti.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between text-emerald-400 border-b border-neutral-800 pb-3">
                  <span>Less: Deductions (Ch VI-A)</span>
                  <span>-₹{oldRegime.deductions.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between text-white font-medium pt-1">
                  <span>Net Taxable Income</span>
                  <span>₹{oldRegime.taxableIncome.toLocaleString('en-IN')}</span>
               </div>
               
               <div className="pt-4 mt-4 border-t border-neutral-800 space-y-3">
                 <div className="flex justify-between text-neutral-400">
                    <span>Tax on Income</span>
                    <span>₹{oldRegime.slabTax.toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex justify-between text-emerald-400 border-b border-neutral-800 pb-3">
                    <span>Less: Rebate 87A</span>
                    <span>-₹{oldRegime.rebate87A.toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex justify-between text-neutral-400 pt-1">
                    <span>Tax after Rebate</span>
                    <span>₹{oldRegime.taxAfterRebate.toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex justify-between text-neutral-400 border-b border-neutral-800 pb-3">
                    <span>Add: Health & Edu Cess (4%)</span>
                    <span>+₹{Math.round(oldRegime.cess).toLocaleString('en-IN')}</span>
                 </div>
               </div>

               <div className="flex justify-between text-lg font-bold text-white pt-2">
                  <span>Total Tax Payable</span>
                  <span>₹{Math.round(oldRegime.finalTax).toLocaleString('en-IN')}</span>
               </div>
            </div>
          </Card>

          {/* New Regime Card */}
          <Card className={`bg-neutral-950 border ${recommended === 'New Regime' ? 'border-indigo-500 shadow-sm shadow-indigo-500/10' : 'border-neutral-800'}`}>
            <div className={`p-4 border-b ${recommended === 'New Regime' ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-neutral-800 bg-neutral-900/50'} flex justify-between items-center rounded-t-xl`}>
               <h3 className="font-semibold text-white">New Regime</h3>
               {recommended === 'New Regime' && <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-medium">Recommended</span>}
            </div>
            <div className="p-5 space-y-4 text-sm">
               <div className="flex justify-between text-neutral-300">
                  <span>Gross Taxable Income</span>
                  <span>₹{newRegime.gti.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between text-neutral-500 border-b border-neutral-800 pb-3 italic">
                  <span>Less: Deductions (Not allowed)</span>
                  <span>-₹0</span>
               </div>
               <div className="flex justify-between text-white font-medium pt-1">
                  <span>Net Taxable Income</span>
                  <span>₹{newRegime.taxableIncome.toLocaleString('en-IN')}</span>
               </div>
               
               <div className="pt-4 mt-4 border-t border-neutral-800 space-y-3">
                 <div className="flex justify-between text-neutral-400">
                    <span>Tax on Income</span>
                    <span>₹{newRegime.slabTax.toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex justify-between text-emerald-400 border-b border-neutral-800 pb-3">
                    <span>Less: Rebate 87A</span>
                    <span>-₹{newRegime.rebate87A.toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex justify-between text-neutral-400 pt-1">
                    <span>Tax after Rebate</span>
                    <span>₹{newRegime.taxAfterRebate.toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex justify-between text-neutral-400 border-b border-neutral-800 pb-3">
                    <span>Add: Health & Edu Cess (4%)</span>
                    <span>+₹{Math.round(newRegime.cess).toLocaleString('en-IN')}</span>
                 </div>
               </div>

               <div className="flex justify-between text-lg font-bold text-white pt-2">
                  <span>Total Tax Payable</span>
                  <span>₹{Math.round(newRegime.finalTax).toLocaleString('en-IN')}</span>
               </div>
            </div>
          </Card>

        </div>
      </div>

      <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 rounded-b-xl flex justify-end">
        <Button onClick={() => router.push(`/dashboard/itr/${id}/verify`)} className="bg-indigo-600 hover:bg-indigo-700">
          Continue to E-File <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
