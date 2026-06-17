"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Save, ChevronDown, CheckCircle2 } from "lucide-react";
import { updateITRDraft, getITRDraft } from "@/lib/actions/itr";

export default function DeductionsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [data, setData] = useState({
    sec80C: "",
    sec80CCD1B: "",
    sec80D: "",
    sec80G: "",
  });

  useEffect(() => {
    getITRDraft(id).then(draft => {
      if (draft.deductions) {
        setData(draft.deductions as any);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateITRDraft(id, "deductions", data);
      router.push(`/dashboard/itr/${id}/tax`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  const val80C = Number(data.sec80C || 0);
  const val80CCD = Number(data.sec80CCD1B || 0);
  const val80D = Number(data.sec80D || 0);
  const val80G = Number(data.sec80G || 0);

  const eligible80C = Math.min(150000, val80C);
  const eligible80CCD = Math.min(50000, val80CCD);
  
  const totalDeductions = eligible80C + eligible80CCD + val80D + val80G;

  const pct80C = Math.min(100, (val80C / 150000) * 100);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 rounded-t-xl">
        <h2 className="text-xl font-bold text-white">Tax Deductions (Chapter VI-A)</h2>
        <p className="text-sm text-neutral-400">Maximize your tax savings</p>
      </div>

      <div className="p-6 flex-1 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          
          {/* Section 80C */}
          <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-950">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Section 80C</h3>
                <p className="text-xs text-neutral-500 mt-1">EPF, PPF, ELSS, LIC, Home Loan Principal, Tuition Fees</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500 block mb-1">Max limit: ₹1,50,000</span>
                <span className={`text-sm font-bold ${val80C >= 150000 ? 'text-emerald-400' : 'text-white'}`}>
                  ₹{eligible80C.toLocaleString('en-IN')} claimed
                </span>
              </div>
            </div>
            <Input 
              type="number"
              value={data.sec80C} 
              onChange={e => handleChange('sec80C', e.target.value)} 
              className="bg-neutral-900 border-neutral-800 mb-3" 
              placeholder="Total 80C Investments (₹)"
            />
            <Progress value={pct80C} className={`h-2 ${pct80C === 100 ? 'bg-emerald-500/20 [&>div]:bg-emerald-500' : 'bg-neutral-800'}`} />
            {pct80C === 100 && <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Max limit reached</p>}
          </div>

          {/* Section 80CCD(1B) */}
          <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-950">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Section 80CCD(1B)</h3>
                <p className="text-xs text-neutral-500 mt-1">Additional NPS Contribution</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500 block mb-1">Max limit: ₹50,000</span>
              </div>
            </div>
            <Input 
              type="number"
              value={data.sec80CCD1B} 
              onChange={e => handleChange('sec80CCD1B', e.target.value)} 
              className="bg-neutral-900 border-neutral-800" 
              placeholder="NPS Contribution (₹)"
            />
          </div>

          {/* Section 80D */}
          <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-950">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Section 80D</h3>
                <p className="text-xs text-neutral-500 mt-1">Medical Insurance Premium & Preventive Checkup</p>
              </div>
            </div>
            <Input 
              type="number"
              value={data.sec80D} 
              onChange={e => handleChange('sec80D', e.target.value)} 
              className="bg-neutral-900 border-neutral-800" 
              placeholder="Total 80D Premium (₹)"
            />
          </div>

          {/* Section 80G */}
          <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-950">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Section 80G</h3>
                <p className="text-xs text-neutral-500 mt-1">Donations to Charitable Institutions</p>
              </div>
            </div>
            <Input 
              type="number"
              value={data.sec80G} 
              onChange={e => handleChange('sec80G', e.target.value)} 
              className="bg-neutral-900 border-neutral-800" 
              placeholder="Eligible Donation Amount (₹)"
            />
          </div>

        </div>

        {/* Live Total Panel */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-indigo-600 rounded-xl p-6 shadow-lg shadow-indigo-600/20 sticky top-6 text-white text-center">
            <p className="text-indigo-200 text-sm font-medium mb-1">Total Deductions Saved</p>
            <h3 className="text-3xl font-bold">₹{totalDeductions.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-indigo-300 mt-4 leading-relaxed">
              These deductions are only applicable if you choose the <strong>Old Tax Regime</strong>. The new regime does not allow most Chapter VI-A deductions.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 rounded-b-xl flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Compute Tax
        </Button>
      </div>
    </div>
  );
}
