"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleDemoFill = () => {
    setEmail("Countryboybailbond@gmail.com");
    setPassword("123123");
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
    <div className="w-full max-w-md flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Your Account
        </h2>
        <p className="text-slate-500 text-sm">
          Enter your credentials to access your dashboard.
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
              className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-3 flex items-start gap-2.5 overflow-hidden"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-3 flex items-start gap-2.5 overflow-hidden"
            >
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Sign in successful! Loading your dashboard...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              disabled={isPending || success}
            />
          </div>
          {emailError && (
            <span className="text-xs text-rose-600">{emailError}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold text-slate-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-500 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 pr-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
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
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && (
            <span className="text-xs text-rose-600">{passwordError}</span>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending || success}
          className="w-full mt-1 h-11 bg-blue-600 hover:bg-blue-700 font-semibold text-white transition-all shadow-lg shadow-blue-600/25 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Quick Demo Credentials */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleDemoFill}
        className="group border border-blue-200 bg-blue-50/60 hover:bg-blue-50 rounded-xl p-4 cursor-pointer transition-all duration-300 flex items-start gap-3 hover:shadow-md hover:border-blue-300"
      >
        <div className="p-1.5 rounded-lg bg-blue-100 border border-blue-200 group-hover:scale-105 transition-transform">
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <h4 className="text-sm font-semibold text-blue-800">
            Quick Demo Login
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click to auto-fill demo credentials:
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] font-mono text-blue-700">
            <span>Email: <strong className="underline decoration-dotted">Countryboybailbond@gmail.com</strong></span>
            <span>Pass: <strong className="underline decoration-dotted">123123</strong></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
