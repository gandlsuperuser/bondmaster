"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Client validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleDemoFill = () => {
    setEmail("admin@bondmaster.com");
    setPassword("admin123");
    setEmailError("");
    setPasswordError("");
    setError(null);
  };

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Invalid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await loginAction(null, formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(redirectedFrom);
          router.refresh();
        }, 800);
      } else {
        setError(result.error || "Login failed");
      }
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground overflow-hidden">
      {/* Left Column: Interactive Hero Panel (Premium Desktop Branding) */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-linear-to-br from-blue-950 via-slate-900 to-purple-950 text-white overflow-hidden border-r border-border/20">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.08),transparent)]" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30">
            <Shield className="h-6 w-6 text-blue-400" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            BondMaster
          </span>
        </div>

        <div className="relative z-10 max-w-md my-auto flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Next-Gen Bail Bond Automations</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight leading-tight"
          >
            Secure, efficient, and mobile-first management.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 leading-relaxed"
          >
            Streamline defendant tracking, orchestrate payment plans, send automated reminders, and capture check-ins with selfie GPS verification in a unified dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid gap-4 mt-4"
          >
            {[
              "Real-time SMS alerts & reminders",
              "Interactive Defendant check-in timelines",
              "Supabase PostgreSQL security models"
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-sm" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center gap-2">
          <span>&copy; 2026 BondMaster Platform</span>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Security Audit</a>
        </div>
      </div>

      {/* Right Column: Responsive Login Box */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 xl:px-24 relative">
        <div className="absolute top-4 right-4 lg:hidden">
          <div className="flex items-center gap-1.5 font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>BondMaster</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials or use the quick login option to access your dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 flex items-start gap-2.5 overflow-hidden"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg p-3 flex items-start gap-2.5 overflow-hidden"
                >
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Sign in successful! Loading your dashboard...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground/80">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  disabled={isPending || success}
                />
              </div>
              {emailError && (
                <span className="text-xs text-destructive">{emailError}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-foreground/80">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  disabled={isPending || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <span className="text-xs text-destructive">{passwordError}</span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending || success}
              className="w-full mt-2 h-10 bg-blue-600 hover:bg-blue-500 font-medium text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleDemoFill}
            className="group relative border border-blue-500/20 bg-blue-500/[0.03] hover:bg-blue-500/[0.06] rounded-xl p-4 cursor-pointer transition-all duration-300 flex items-start gap-3 shadow-xs hover:shadow-md hover:border-blue-500/30"
          >
            <div className="p-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Quick Demo Login
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click this box to auto-fill the dummy administrator login credentials:
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] font-mono text-blue-800 dark:text-blue-200">
                <span>Email: <strong className="underline decoration-dotted">admin@bondmaster.com</strong></span>
                <span>Pass: <strong className="underline decoration-dotted">admin123</strong></span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
