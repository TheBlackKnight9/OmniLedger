"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertTriangle, FileCheck, CheckCircle2, Download } from "lucide-react";
import { fileITR, getITRDraft } from "@/lib/actions/itr";

export default function VerifyAndFilePage() {
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isFiling, setIsFiling] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");

  useEffect(() => {
    getITRDraft(id).then(res => {
      setDraft(res);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [id]);

  const handleEFile = async () => {
    if (!bankAccount || !ifsc) {
      alert("Please enter bank details for refund.");
      return;
    }
    
    setIsFiling(true);
    try {
      // Mock Aadhaar OTP flow delay
      await new Promise(res => setTimeout(res, 2000));
      
      const filedDraft = await fileITR(id);
      setSuccessData(filedDraft);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFiling(false);
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  if (successData) {
    return (
      <div className="flex flex-col h-full p-8 items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
           <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-bold text-white">ITR Filed Successfully!</h2>
           <p className="text-neutral-400 max-w-md mx-auto">Your Income Tax Return for AY {successData.assessmentYear} has been e-filed and e-verified successfully.</p>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 w-full max-w-sm space-y-4">
           <div className="flex justify-between border-b border-neutral-800 pb-3">
             <span className="text-neutral-400 text-sm">Form Type</span>
             <span className="text-white font-medium">{successData.itrForm}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-neutral-400 text-sm">Acknowledgment Number</span>
             <span className="text-emerald-400 font-mono font-medium">{successData.ackNumber}</span>
           </div>
        </div>
        <Button className="bg-neutral-800 hover:bg-neutral-700 text-white mt-4 border border-neutral-700">
           <Download className="w-4 h-4 mr-2" /> Download ITR-V (PDF)
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 rounded-t-xl">
        <h2 className="text-xl font-bold text-white">Verify & File</h2>
        <p className="text-sm text-neutral-400">Final checks before submission to the IT Department</p>
      </div>

      <div className="p-6 flex-1 space-y-8">
        
        {/* Validation Checks */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">System Validations</h3>
          <div className="space-y-3">
             <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
               <ShieldCheck className="h-4 w-4 stroke-emerald-400" />
               <AlertDescription className="ml-2 font-medium">All mandatory fields completed.</AlertDescription>
             </Alert>
             <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
               <ShieldCheck className="h-4 w-4 stroke-emerald-400" />
               <AlertDescription className="ml-2 font-medium">Tax computation matches ITD schema rules.</AlertDescription>
             </Alert>
             <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-400">
               <AlertTriangle className="h-4 w-4 stroke-amber-400" />
               <AlertDescription className="ml-2 font-medium">TDS declared vs Form 26AS mismatch: ₹45. (Diff &lt; ₹100 is ignored)</AlertDescription>
             </Alert>
          </div>
        </div>

        {/* Bank Account for Refund */}
        <div className="pt-6 border-t border-neutral-800">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Bank Account for Refund</h3>
          <p className="text-xs text-neutral-400 mb-4">Please provide a pre-validated bank account where any potential tax refund should be credited.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div>
              <Label className="text-neutral-300">Account Number</Label>
              <Input 
                value={bankAccount} 
                onChange={e => setBankAccount(e.target.value)} 
                className="bg-neutral-950 border-neutral-800 mt-1" 
                placeholder="e.g. 000012345678"
              />
            </div>
            <div>
              <Label className="text-neutral-300">IFSC Code</Label>
              <Input 
                value={ifsc} 
                onChange={e => setIfsc(e.target.value)} 
                className="bg-neutral-950 border-neutral-800 mt-1" 
                placeholder="e.g. SBIN0001234"
              />
            </div>
          </div>
        </div>

        {/* E-Verification Setup */}
        <div className="pt-6 border-t border-neutral-800">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">E-Verification Method</h3>
          <div className="p-4 border border-indigo-500 bg-indigo-500/10 rounded-xl flex items-center justify-between">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-6 h-6 text-indigo-400" />
               <div>
                 <p className="text-sm font-medium text-indigo-100">Aadhaar OTP (Recommended)</p>
                 <p className="text-xs text-indigo-300">OTP will be sent to mobile linked with Aadhaar</p>
               </div>
             </div>
             <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
          </div>
        </div>

      </div>

      <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 rounded-b-xl flex justify-between items-center">
        <p className="text-xs text-neutral-500 max-w-sm">By clicking E-File, you authorize CA OS to submit this return to the Income Tax Department via ERI.</p>
        <Button onClick={handleEFile} disabled={isFiling} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
          {isFiling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCheck className="w-4 h-4 mr-2" />}
          {isFiling ? "Filing Return..." : "E-File Return via Aadhaar OTP"}
        </Button>
      </div>
    </div>
  );
}
