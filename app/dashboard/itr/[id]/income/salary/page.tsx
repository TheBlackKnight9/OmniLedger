"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DownloadCloud, Save } from "lucide-react";
import { updateITRDraft, getITRDraft } from "@/lib/actions/itr";

export default function SalaryIncomePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [data, setData] = useState({
    employerName: "",
    grossSalary: "",
    basic: "",
    hraReceived: "",
    rentPaid: "",
    hraCity: "non-metro",
    professionalTax: "",
  });

  const [computedHra, setComputedHra] = useState(0);

  useEffect(() => {
    // Fetch existing draft data
    getITRDraft(id).then(draft => {
      if (draft.salaryIncome) {
        setData(draft.salaryIncome as any);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [id]);

  // Auto-compute HRA exemption
  useEffect(() => {
    const basic = Number(data.basic || 0);
    const hraRec = Number(data.hraReceived || 0);
    const rentAnnual = Number(data.rentPaid || 0) * 12;
    
    const limit1 = hraRec;
    const limit2 = rentAnnual - (0.1 * basic);
    const limit3 = (data.hraCity === 'metro' ? 0.5 : 0.4) * basic;
    
    const exemption = Math.max(0, Math.min(limit1, limit2, limit3));
    setComputedHra(exemption);
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateITRDraft(id, "salaryIncome", data);
      router.push(`/dashboard/itr/${id}/deductions`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync26AS = () => {
    // Mock auto-fill
    setData(prev => ({
      ...prev,
      employerName: "Tech Corp India Pvt Ltd",
      grossSalary: "1250000",
      basic: "600000",
      hraReceived: "250000",
      professionalTax: "2400",
    }));
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  const gross = Number(data.grossSalary || 0);
  const stdDeduction = 75000;
  const profTax = Number(data.professionalTax || 0);
  const taxableSalary = Math.max(0, gross - computedHra - stdDeduction - profTax);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 rounded-t-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Income from Salary</h2>
          <p className="text-sm text-neutral-400">Enter details from your Form 16</p>
        </div>
        <Button variant="outline" onClick={handleSync26AS} className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
          <DownloadCloud className="w-4 h-4 mr-2" /> Sync 26AS/AIS
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-neutral-300">Employer Name</Label>
              <Input 
                value={data.employerName} 
                onChange={e => handleChange('employerName', e.target.value)} 
                className="bg-neutral-950 border-neutral-800 mt-1" 
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-neutral-300">Gross Salary</Label>
                <Input 
                  type="number"
                  value={data.grossSalary} 
                  onChange={e => handleChange('grossSalary', e.target.value)} 
                  className="bg-neutral-950 border-neutral-800 mt-1" 
                  placeholder="₹"
                />
              </div>
              <div>
                <Label className="text-neutral-300">Professional Tax (Sec 16)</Label>
                <Input 
                  type="number"
                  value={data.professionalTax} 
                  onChange={e => handleChange('professionalTax', e.target.value)} 
                  className="bg-neutral-950 border-neutral-800 mt-1" 
                  placeholder="₹"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">HRA Exemption Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-neutral-300">Basic Salary (Annual)</Label>
                <Input 
                  type="number"
                  value={data.basic} 
                  onChange={e => handleChange('basic', e.target.value)} 
                  className="bg-neutral-950 border-neutral-800 mt-1" 
                  placeholder="₹"
                />
              </div>
              <div>
                <Label className="text-neutral-300">HRA Received (Annual)</Label>
                <Input 
                  type="number"
                  value={data.hraReceived} 
                  onChange={e => handleChange('hraReceived', e.target.value)} 
                  className="bg-neutral-950 border-neutral-800 mt-1" 
                  placeholder="₹"
                />
              </div>
              <div>
                <Label className="text-neutral-300">Rent Paid (Per Month)</Label>
                <Input 
                  type="number"
                  value={data.rentPaid} 
                  onChange={e => handleChange('rentPaid', e.target.value)} 
                  className="bg-neutral-950 border-neutral-800 mt-1" 
                  placeholder="₹"
                />
              </div>
              <div>
                <Label className="text-neutral-300">City Type</Label>
                <Select value={data.hraCity} onValueChange={v => handleChange('hraCity', v)}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-800 mt-1">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metro">Metro (50%)</SelectItem>
                    <SelectItem value="non-metro">Non-Metro (40%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Taxable Panel */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-neutral-950 rounded-xl p-5 border border-neutral-800 sticky top-6">
            <h3 className="text-sm font-semibold text-white mb-4">Computation</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Gross Salary</span>
                <span>₹{gross.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Less: Standard Ded.</span>
                <span>-₹{stdDeduction.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Less: HRA Exempt</span>
                <span>-₹{Math.round(computedHra).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400 pb-3 border-b border-neutral-800">
                <span>Less: Prof. Tax</span>
                <span>-₹{profTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-white font-semibold pt-1">
                <span>Taxable Salary</span>
                <span>₹{Math.round(taxableSalary).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 rounded-b-xl flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
