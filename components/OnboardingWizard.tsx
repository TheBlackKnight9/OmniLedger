"use client";

import React, { useState } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Building, 
  Briefcase, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Building2, 
  Sparkles 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RoleType = "INDIVIDUAL" | "BUSINESS" | "CA_PARTNER";

export default function OnboardingWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [role, setRole] = useState<RoleType | null>(null);
  const [pan, setPan] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [gstin, setGstin] = useState("");
  const [cin, setCin] = useState("");
  const [tan, setTan] = useState("");
  const [firmName, setFirmName] = useState("");
  const [salarySources, setSalarySources] = useState<string[]>([]);

  // PAN Verification states
  const [panVerified, setPanVerified] = useState(false);
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);

  // Validate PAN Format: 5 Letters, 4 Digits, 1 Letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
  const isPanValid = panRegex.test(pan);

  const handleSelectRole = (selectedRole: RoleType) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleVerifyPan = () => {
    if (!isPanValid) return;
    setIsVerifyingPan(true);
    // Mocking an official API verification request with a visual skeleton delay
    setTimeout(() => {
      setIsVerifyingPan(false);
      setPanVerified(true);
      toast({
        title: "PAN Verified Successfully",
        description: `Linked to Taxpayer Record via NSDL`,
        className: "bg-emerald-950 border-emerald-800 text-emerald-100",
      });
      // Autofill display name if empty
      if (!displayName && role === "INDIVIDUAL") {
        setDisplayName("Aditya Sharma"); // Mock name fetched from PAN registry
      }
    }, 2000);
  };

  const toggleSalarySource = (source: string) => {
    setSalarySources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !panVerified) return;

    setIsSubmitting(true);
    try {
      await completeOnboarding({
        role,
        pan: pan.toUpperCase(),
        displayName: displayName || (role === "CA_PARTNER" ? firmName : "Entity Profile"),
        gstin: gstin ? gstin.toUpperCase() : undefined,
        cin: cin ? cin.toUpperCase() : undefined,
        tan: tan ? tan.toUpperCase() : undefined,
        salarySources: role === "INDIVIDUAL" ? salarySources : undefined,
        firmName: role === "CA_PARTNER" ? firmName : undefined,
      });
      toast({
        title: "Onboarding Completed",
        description: "Your compliance workspace is fully configured.",
        className: "bg-emerald-950 border-emerald-800 text-emerald-100",
      });
    } catch (err: any) {
      toast({
        title: "Onboarding Failed",
        description: err.message || "Failed to finalize profile. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Indicator Progress Bar */}
      <div className="mb-8 relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-neutral-800 z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-500 z-0 transition-all duration-300"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            disabled={s > step && !role}
            onClick={() => setStep(s)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border relative z-10 ${
              s === step
                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110"
                : s < step
                ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
          >
            {s < step ? <CheckCircle className="w-5 h-5" /> : s}
          </button>
        ))}
      </div>

      <Card className="bg-neutral-900/50 border-neutral-800/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Step 1: Who Are You? */}
        {step === 1 && (
          <div>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 animate-pulse" /> Step 1 of 3
              </div>
              <CardTitle className="text-3xl font-extrabold text-neutral-100 tracking-tight">
                Select Your Profile Role
              </CardTitle>
              <CardDescription className="text-neutral-400 text-base">
                Choose the profile that matches your legal and tax workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
              {/* Card 1: Individual */}
              <button
                type="button"
                onClick={() => handleSelectRole("INDIVIDUAL")}
                className={`group text-left border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] ${
                  role === "INDIVIDUAL"
                    ? "bg-indigo-950/40 border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.15)] text-indigo-100"
                    : "bg-neutral-950/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40 text-neutral-300"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/20 transition-all duration-300">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-300 transition-colors">Individual</h3>
                <p className="text-sm text-neutral-400">Salaried employees, freelancers, and single taxpayers filing ITR.</p>
              </button>

              {/* Card 2: Business */}
              <button
                type="button"
                onClick={() => handleSelectRole("BUSINESS")}
                className={`group text-left border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] ${
                  role === "BUSINESS"
                    ? "bg-indigo-950/40 border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.15)] text-indigo-100"
                    : "bg-neutral-950/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40 text-neutral-300"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:bg-amber-500/20 transition-all duration-300">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-amber-300 transition-colors">Business</h3>
                <p className="text-sm text-neutral-400">Proprietorships, LLPs, Private Limiteds filing GST, PF, and ROC.</p>
              </button>

              {/* Card 3: CA Firm */}
              <button
                type="button"
                onClick={() => handleSelectRole("CA_PARTNER")}
                className={`group text-left border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] ${
                  role === "CA_PARTNER"
                    ? "bg-indigo-950/40 border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.15)] text-indigo-100"
                    : "bg-neutral-950/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40 text-neutral-300"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-all duration-300">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-300 transition-colors">CA Professional</h3>
                <p className="text-sm text-neutral-400">Chartered Accountants managing multiple clients and teams.</p>
              </button>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-neutral-800/60 pt-6">
              {role && (
                <Button 
                  onClick={() => setStep(2)} 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 group"
                >
                  Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </CardFooter>
          </div>
        )}

        {/* Step 2: Enter PAN & Verify */}
        {step === 2 && (
          <div>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4" /> Step 2 of 3
              </div>
              <CardTitle className="text-3xl font-extrabold text-neutral-100 tracking-tight">
                Taxpayer PAN Verification
              </CardTitle>
              <CardDescription className="text-neutral-400 text-base">
                Provide your Permanent Account Number (PAN) to verify identity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-300 block">PAN Number (Format: ABCDE1234F)</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Enter 10-digit PAN"
                      maxLength={10}
                      value={pan}
                      onChange={(e) => {
                        setPan(e.target.value.toUpperCase());
                        setPanVerified(false);
                      }}
                      disabled={isVerifyingPan || panVerified}
                      className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500 tracking-widest text-lg font-mono uppercase h-11"
                    />
                    {panVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-emerald-400 font-semibold gap-1 text-xs">
                        <ShieldCheck className="w-5 h-5" /> VERIFIED
                      </div>
                    )}
                  </div>
                  {!panVerified && (
                    <Button
                      type="button"
                      disabled={!isPanValid || isVerifyingPan}
                      onClick={handleVerifyPan}
                      className="h-11 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-600 font-semibold px-6"
                    >
                      {isVerifyingPan ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  )}
                </div>
                {!panVerified && pan && !isPanValid && (
                  <p className="text-rose-500 text-xs mt-1">Invalid PAN format. Standard format: 5 letters, 4 numbers, 1 letter.</p>
                )}
              </div>

              {/* Skeleton/Loader State during Verification */}
              {isVerifyingPan && (
                <div className="border border-indigo-500/20 bg-indigo-950/10 rounded-xl p-4 space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span className="text-sm font-medium text-indigo-300">Fetching taxpayer record from NSDL...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-800 rounded w-3/4" />
                    <div className="h-4 bg-neutral-800 rounded w-1/2" />
                  </div>
                </div>
              )}

              {/* Verified taxpayer state */}
              {panVerified && (
                <div className="border border-emerald-800/30 bg-emerald-950/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" /> Official Record Linked
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-neutral-400">
                    <div>Taxpayer Name:</div>
                    <div className="text-neutral-200 font-semibold">Aditya Sharma</div>
                    <div>PAN Category:</div>
                    <div className="text-neutral-200 font-semibold">Individual / Taxpayer</div>
                    <div>Status:</div>
                    <div className="text-emerald-400 font-semibold">Active & Seeding Enabled</div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-neutral-800/60 pt-6">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-neutral-800 hover:bg-neutral-800 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                disabled={!panVerified}
                onClick={() => setStep(3)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 group"
              >
                Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </div>
        )}

        {/* Step 3: Setup Specific Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4" /> Step 3 of 3
              </div>
              <CardTitle className="text-3xl font-extrabold text-neutral-100 tracking-tight">
                Setup Compliance Workspace
              </CardTitle>
              <CardDescription className="text-neutral-400 text-base">
                Provide configuration parameters to seed your filing dates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              {/* Individual Profile Setup */}
              {role === "INDIVIDUAL" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 block">Full Name (Filing Entity)</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Aditya Sharma"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-300 block">Select your income sources</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Salary Income",
                        "House Property / Rental Income",
                        "Capital Gains (Stocks, Mutual Funds, Crypto)",
                        "Professional/Freelancer Receipts"
                      ].map((source) => (
                        <div
                          key={source}
                          onClick={() => toggleSalarySource(source)}
                          className={`border rounded-lg p-3 cursor-pointer select-none transition-all duration-200 ${
                            salarySources.includes(source)
                              ? "bg-indigo-950/30 border-indigo-500/80 text-indigo-100"
                              : "bg-neutral-950/30 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              salarySources.includes(source) ? "bg-indigo-600 border-indigo-500" : "border-neutral-700"
                            }`}>
                              {salarySources.includes(source) && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-medium">{source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Business Profile Setup */}
              {role === "BUSINESS" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 block">Business / Entity Legal Name</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Acme Technologies Private Limited"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 block">GSTIN (Optional)</label>
                    <Input
                      type="text"
                      placeholder="e.g. 27AAAAA1111A1Z1"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500 font-mono"
                    />
                    <p className="text-xs text-neutral-500">Provide if registered under GST</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-300 block">CIN (Optional)</label>
                      <Input
                        type="text"
                        placeholder="U12345MH2021PTC123456"
                        maxLength={21}
                        value={cin}
                        onChange={(e) => setCin(e.target.value.toUpperCase())}
                        className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500 font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-300 block">TAN (Optional)</label>
                      <Input
                        type="text"
                        placeholder="ABCD12345E"
                        maxLength={10}
                        value={tan}
                        onChange={(e) => setTan(e.target.value.toUpperCase())}
                        className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CA Professional Profile Setup */}
              {role === "CA_PARTNER" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 block">CA Firm Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <Input
                        type="text"
                        required
                        placeholder="e.g. K. N. & Associates"
                        value={firmName}
                        onChange={(e) => {
                          setFirmName(e.target.value);
                          setDisplayName(e.target.value);
                        }}
                        className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500 pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-300 block">ICAI Firm Registration Number (FRN)</label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. 123456W"
                        className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-300 block">CA Membership Number (MRN)</label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. 098765"
                        className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-neutral-800/60 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="border-neutral-800 hover:bg-neutral-800 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing Workspace
                  </>
                ) : (
                  <>
                    Complete Onboarding <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
