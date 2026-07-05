"use client";

import React, { useState, useTransition } from "react";
import { forgotPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const validate = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Invalid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);

      const result = await forgotPasswordAction(null, formData);

      if (result.success) {
        setSuccessMessage(result.message || "Recovery email sent.");
      } else {
        setError(result.error || "Failed to process request.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 -z-10 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 -z-10 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 w-fit">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            BondMaster
          </span>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-2xl bg-card p-6 md:p-8 shadow-sm flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Recover Password</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

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

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg p-3 flex items-start gap-2.5 overflow-hidden"
                >
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span>{successMessage}</span>
                    {/* Simulated email inbox link in mock mode */}
                    {email.endsWith("@bondmaster.com") && (
                      <Link
                        href={`/reset-password?email=${encodeURIComponent(email)}`}
                        className="text-xs font-semibold underline text-emerald-700 dark:text-emerald-300 mt-2 hover:opacity-90 block"
                      >
                        [Simulate Mail Link] Go to Password Reset Page &rarr;
                      </Link>
                    )}
                  </div>
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
                  placeholder="name@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  disabled={isPending || !!successMessage}
                />
              </div>
              {emailError && (
                <span className="text-xs text-destructive">{emailError}</span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending || !!successMessage}
              className="w-full mt-2 h-10 bg-blue-600 hover:bg-blue-500 font-medium text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </Button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mt-2"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Sign In</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
