"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Calendar, ShieldAlert, X, Plus } from "lucide-react";
import Link from "next/link";
import { createDefendant, updateDefendant } from "@/actions/defendants";

interface DefendantFormProps {
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    dob: Date | null;
    ssn: string | null;
    phone?: string | null;
    email?: string | null;
    tags?: string[];
  };
}

export function DefendantForm({ initialData }: DefendantFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Convert Date object to YYYY-MM-DD string for date input
  const initialDobStr = initialData?.dob
    ? new Date(initialData.dob).toISOString().split("T")[0]
    : "";

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    dob: initialDobStr,
    ssn: initialData?.ssn || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
  });

  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // SSN formatting handler
  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // strip non-digits
    if (val.length > 9) val = val.slice(0, 9);
    
    // Format as XXX-XX-XXXX
    let formatted = val;
    if (val.length > 5) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 5)}-${val.slice(5)}`;
    } else if (val.length > 3) {
      formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
    }

    setFormData((prev) => ({ ...prev, ssn: formatted }));
  };

  // Phone formatting handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 10) val = val.slice(0, 10);

    let formatted = val;
    if (val.length > 6) {
      formatted = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
    } else if (val.length > 3) {
      formatted = `(${val.slice(0, 3)}) ${val.slice(3)}`;
    }

    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleAddTag = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") {
      return;
    }
    e.preventDefault();
    const cleanTag = tagInput.trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and Last name are required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dob: formData.dob || null,
        ssn: formData.ssn.replace(/\D/g, "") || null, // send raw 9 digit SSN
        phone: formData.phone.replace(/\D/g, "") || null, // send raw 10 digit Phone
        email: formData.email.trim() || null,
        tags,
      };

      let res;
      if (initialData?.id) {
        res = await updateDefendant(initialData.id, payload);
      } else {
        res = await createDefendant(payload);
      }

      if (res.success) {
        router.push("/dashboard/defendants");
        router.refresh();
      } else {
        setError(res.error || "Something went wrong. Please check your input.");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/defendants"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Defendants
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {initialData ? "Edit Defendant Profile" : "Create Defendant Profile"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in the details below to configure the defendant client file.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex gap-2 items-start p-3.5 text-xs rounded-lg border bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-500/20">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                />
                <Calendar className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* SSN */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Social Security Number (SSN)
              </label>
              <input
                type="text"
                name="ssn"
                value={formData.ssn}
                onChange={handleSSNChange}
                placeholder="000-00-0000"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(000) 000-0000"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Defendant Tags (Labels)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag (e.g., High Risk, VIP) and press enter"
                className="flex-1 px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-850 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            {/* Tag Badges Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/defendants"
              className="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {initialData ? "Save Changes" : "Create Defendant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
