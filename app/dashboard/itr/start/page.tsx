"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2, PlayCircle } from "lucide-react";
import { createITRDraft } from "@/lib/actions/itr";

const QUESTIONS = [
  {
    id: "q1",
    question: "What is your main source of income?",
    options: ["Salary", "Business", "Both", "Other"],
  },
  {
    id: "q2",
    question: "Did you have more than one employer during the year?",
    options: ["Yes", "No"],
  },
  {
    id: "q3",
    question: "Did you sell any property, stocks, or crypto?",
    options: ["Yes", "No"],
  },
  {
    id: "q4",
    question: "Do you have any income from abroad or foreign assets?",
    options: ["Yes", "No"],
  },
  {
    id: "q5",
    question: "Is your total income above ₹50 Lakhs?",
    options: ["Yes", "No"],
  },
];

export default function ITRStartWizard({ searchParams }: { searchParams?: { entityId?: string } }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  // In a real app, entityId would be fetched from context or selected by user if multiple.
  // We'll mock selecting the first entity for the demo, or pass via URL.
  // Since we don't have entityId here directly, we'll fetch it or use a fallback logic in layout
  // For the sake of the wizard, we'll proceed and pass a placeholder if missing
  const [entityId, setEntityId] = useState<string>("");

  useEffect(() => {
    import("@/lib/actions/itr").then((m) => {
      m.getDefaultEntity().then(id => {
        if (id) setEntityId(id);
      }).catch(console.error);
    });
  }, []);

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      determineForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  const determineForm = () => {
    // Logic: 
    // Capital gains or foreign -> ITR-2
    if (answers.q3 === "Yes" || answers.q4 === "Yes") {
      setRecommendation("ITR-2");
      return;
    }
    // Business -> ITR-4
    if (answers.q1 === "Business" || answers.q1 === "Both") {
      setRecommendation("ITR-4");
      return;
    }
    // >50L -> ITR-2
    if (answers.q5 === "Yes") {
      setRecommendation("ITR-2");
      return;
    }
    // Else -> ITR-1
    setRecommendation("ITR-1");
  };

  const startFiling = async () => {
    if (!recommendation) return;
    setIsSubmitting(true);
    try {
      // Create draft
      // We need a valid entityId. If not loaded, we might fail.
      const eId = entityId || "default-entity-id"; 
      const draft = await createITRDraft(eId, recommendation, "2025-26");
      router.push(`/dashboard/itr/${draft.id}/income/salary`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (recommendation) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="bg-neutral-900 border-neutral-800 text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-indigo-400" />
            </div>
            
            {recommendation === "ITR-2" ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">We recommend ITR-2</h2>
                <p className="text-neutral-400">
                  Because you have capital gains, foreign assets, or income above ₹50L, you need to file ITR-2.
                </p>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 mt-4 inline-block">
                  ITR-2 module is coming soon! A CA Partner will assist you.
                </div>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => setRecommendation(null)}>Start Over</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">We recommend {recommendation}</h2>
                <p className="text-neutral-400">
                  Based on your answers, {recommendation} is the right form for you for AY 2025-26.
                </p>
                <div className="pt-4">
                  <Button onClick={startFiling} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Start {recommendation} Filing
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = QUESTIONS[currentStep];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Let's find the right ITR form</h1>
        <p className="text-neutral-400">Answer 5 simple questions</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-neutral-500 mb-2">
          <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%</span>
        </div>
        <Progress value={((currentStep + 1) / QUESTIONS.length) * 100} className="h-2 bg-neutral-800" />
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl text-white font-medium mb-6">{q.question}</h2>
          
          <RadioGroup 
            value={answers[q.id]} 
            onValueChange={(val: string) => setAnswers(prev => ({ ...prev, [q.id]: val }))}
            className="space-y-3"
          >
            {q.options.map((opt) => (
              <div key={opt} className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${answers[q.id] === opt ? 'border-indigo-500 bg-indigo-500/10' : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900'}`}>
                <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                <Label htmlFor={`${q.id}-${opt}`} className="flex-1 cursor-pointer font-medium">{opt}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between mt-8 pt-6 border-t border-neutral-800">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 0}
              className="border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!answers[q.id]}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {currentStep === QUESTIONS.length - 1 ? 'Show Recommendation' : 'Next'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
