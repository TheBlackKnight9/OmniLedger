"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast({
          title: "Sign In Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Success",
          description: "Logging you in...",
          className: "bg-emerald-950 border-emerald-800 text-emerald-100",
        });
        // Redirecting to dashboard root (which redirects based on role)
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
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

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
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
              <Sparkles className="w-4 h-4 animate-pulse" /> Welcome back
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-100">Sign in to your account</CardTitle>
            <CardDescription className="text-neutral-400">
              Enter your credentials to manage your tax compliance workspace.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Email Address</label>
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
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
                  disabled={isLoading || isGoogleLoading}
                  className="bg-neutral-950/80 border-neutral-800 text-neutral-100 placeholder-neutral-600"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...
                  </>
                ) : (
                  "Sign In with Credentials"
                )}
              </Button>
            </CardContent>
          </form>

          <div className="px-6 flex items-center justify-between gap-4 py-2">
            <div className="h-[1px] bg-neutral-800 flex-1" />
            <span className="text-xs text-neutral-500 font-medium tracking-wider uppercase">or</span>
            <div className="h-[1px] bg-neutral-800 flex-1" />
          </div>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleLogin}
              className="w-full border-neutral-800 hover:bg-neutral-800 hover:text-white h-11 flex items-center justify-center gap-2"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Sign In with Google
                </>
              )}
            </Button>

            <div className="text-sm text-neutral-400 text-center w-full">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-indigo-400 hover:underline">
                Create one here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
