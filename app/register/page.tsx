"use client";

import React, { useState } from "react";
import { registerUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await registerUser(formData);

      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Account Created",
          description: "Your credentials have been registered. Redirecting to login...",
          className: "bg-emerald-950 border-emerald-800 text-emerald-100",
        });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] z-0" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-50 via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
            CA OS
          </h1>
          <p className="text-neutral-500 text-sm">
            India&apos;s Chartered Accountant & Taxpayer Portal
          </p>
        </header>

        <Card className="bg-neutral-900/50 border-neutral-800/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-4 h-4 animate-pulse" /> Register Workspace
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-100">Create your account</CardTitle>
            <CardDescription className="text-neutral-400">
              Create credentials to access client profiles and compliance calendar databases.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Full Name</label>
                <Input
                  type="text"
                  required
                  placeholder="Aditya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Email Address</label>
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Password</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-600"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <div className="text-sm text-neutral-400 text-center w-full">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:underline">
                Sign In instead
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
