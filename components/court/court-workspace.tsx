"use client";

import React, { useState, useTransition } from "react";
import {
  Calendar as CalendarIcon,
  User,
  Users,
  Building,
  Activity,
  Plus,
  Bell,
  Scale,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { updateAppearanceOutcome, createJudge } from "@/actions/courts";
import Link from "next/link";

interface CourtAppearance {
  id: string;
  status: string;
  defendant: {
    id: string;
    firstName: string;
    lastName: string;
  };
  courtDate: {
    date: Date;
    courtCase: {
      caseNumber: string;
      court: {
        id: string;
        name: string;
        county: string | null;
        state: string | null;
      };
    };
  };
}

interface Judge {
  id: string;
  firstName: string;
  lastName: string;
  courtId: string | null;
  courtName: string;
}

interface Court {
  id: string;
  name: string;
}

interface CourtWorkspaceProps {
  appearances: CourtAppearance[];
  judges: Judge[];
  courts: Court[];
}

export function CourtWorkspace({ appearances, judges, courts }: CourtWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"hearings" | "judges" | "reminders">("hearings");
  const [isPending, startTransition] = useTransition();

  // New Judge Form State
  const [showAddJudge, setShowAddJudge] = useState(false);
  const [judgeFirstName, setJudgeFirstName] = useState("");
  const [judgeLastName, setJudgeLastName] = useState("");
  const [judgeCourtId, setJudgeCourtId] = useState("");

  // Reminder rules simulation state
  const [reminders, setReminders] = useState([
    { id: 1, type: "SMS", timeframe: "24 Hours Before", active: true },
    { id: 2, type: "Email", timeframe: "48 Hours Before", active: true },
    { id: 3, type: "SMS", timeframe: "7 Days Before", active: false },
  ]);

  const handleOutcomeChange = (appearanceId: string, outcome: string) => {
    startTransition(async () => {
      const res = await updateAppearanceOutcome(appearanceId, outcome);
      if (!res.success) {
        alert(res.error || "Failed to update outcome");
      }
    });
  };

  const handleAddJudgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeFirstName || !judgeLastName) return;

    startTransition(async () => {
      const res = await createJudge({
        firstName: judgeFirstName,
        lastName: judgeLastName,
        courtId: judgeCourtId || undefined,
      });

      if (res.success) {
        setJudgeFirstName("");
        setJudgeLastName("");
        setJudgeCourtId("");
        setShowAddJudge(false);
      } else {
        alert(res.error || "Failed to add judge");
      }
    });
  };

  const toggleReminder = (id: number) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Court Case & Appearance Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Schedule hearings, update court attendance outcomes, manage judges, and configure reminder alerts.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "hearings" as const, label: "Hearing Schedule", icon: <CalendarIcon className="h-4 w-4" /> },
          { id: "judges" as const, label: "Judges Directory", icon: <Scale className="h-4 w-4" /> },
          { id: "reminders" as const, label: "Appearance Reminders", icon: <Bell className="h-4 w-4" /> },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 -mb-[1px] cursor-pointer ${
                active
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Sub-tab View: Hearing Schedule ── */}
      {activeTab === "hearings" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Court dates</h3>

          {appearances.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-xl">
              No scheduled hearings or court dates found.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-350 dark:border-slate-800 rounded-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                    <th className="py-3 px-4">Defendant Name</th>
                    <th className="py-3 px-4">Case Number</th>
                    <th className="py-3 px-4">Court Name</th>
                    <th className="py-3 px-4">Hearing Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-250 dark:divide-slate-800">
                  {appearances.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-450">
                        <Link href={`/dashboard/defendants/${app.defendant.id}`} className="hover:underline">
                          {app.defendant.lastName}, {app.defendant.firstName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {app.courtDate.courtCase.caseNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {app.courtDate.courtCase.court.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-650 dark:text-slate-400 font-mono">
                        {new Date(app.courtDate.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          app.status === "Attended"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-500/20"
                            : app.status === "FTA"
                            ? "bg-rose-50 text-rose-700 border-rose-500/20"
                            : "bg-amber-50 text-amber-700 border-amber-500/20"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <select
                            value={app.status}
                            onChange={(e) => handleOutcomeChange(app.id, e.target.value)}
                            disabled={isPending}
                            className="text-xs border border-slate-300 dark:border-slate-850 rounded bg-white dark:bg-slate-950 p-1 outline-hidden"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Attended">Attended</option>
                            <option value="FTA">FTA (Default)</option>
                            <option value="Postponed">Postponed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sub-tab View: Judges Directory ── */}
      {activeTab === "judges" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active County Judges</h3>
            <button
              onClick={() => setShowAddJudge(!showAddJudge)}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Register Judge
            </button>
          </div>

          {showAddJudge && (
            <form onSubmit={handleAddJudgeSubmit} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950/20 text-xs space-y-3 max-w-md">
              <p className="font-bold uppercase text-[10px] text-slate-400">Add New Judge Profile</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-500">First Name</label>
                  <input
                    type="text"
                    value={judgeFirstName}
                    onChange={(e) => setJudgeFirstName(e.target.value)}
                    placeholder="John"
                    className="p-2 border rounded bg-white dark:bg-slate-955 outline-hidden"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-500">Last Name</label>
                  <input
                    type="text"
                    value={judgeLastName}
                    onChange={(e) => setJudgeLastName(e.target.value)}
                    placeholder="Doe"
                    className="p-2 border rounded bg-white dark:bg-slate-955 outline-hidden"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">Assigned Courtroom</label>
                <select
                  value={judgeCourtId}
                  onChange={(e) => setJudgeCourtId(e.target.value)}
                  className="p-2 border rounded bg-white dark:bg-slate-955 outline-hidden"
                >
                  <option value="">Unassigned / Floating</option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-all cursor-pointer"
              >
                Save Judge Profile
              </button>
            </form>
          )}

          {judges.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-xl">
              No registered judges.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-350 dark:border-slate-800 rounded-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                    <th className="py-3 px-4">Judge Name</th>
                    <th className="py-3 px-4">Assigned Court</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-250 dark:divide-slate-800">
                  {judges.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        Hon. {j.firstName} {j.lastName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {j.courtName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sub-tab View: Reminder Rules ── */}
      {activeTab === "reminders" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Automated Court Date Reminders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Toggle notification dispatches to defendants prior to court appearances.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-xl text-sm">
            {reminders.map((r) => (
              <div key={r.id} className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">{r.timeframe}</span>
                  <p className="text-xs text-slate-500 mt-0.5">Medium: {r.type}</p>
                </div>
                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    r.active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-500/20"
                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  }`}
                >
                  {r.active ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
