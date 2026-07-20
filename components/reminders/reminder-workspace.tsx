"use client";

import React, { useState, useTransition } from "react";
import {
  AlarmClock,
  Play,
  Settings2,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  SkipForward,
  Power,
  PowerOff,
  X,
  Zap,
  Clock,
  Mail,
  MessageSquare,
} from "lucide-react";
import {
  createReminderRule,
  updateReminderRule,
  deleteReminderRule,
  toggleReminderRule,
  manualTriggerRule,
} from "@/actions/reminders";

// ─── Types ─────────────────────────────────────────────────

interface ReminderRule {
  id: string;
  name: string;
  eventType: string;
  channel: string;
  offsetMinutes: number;
  messageTemplate: string;
  emailSubject: string | null;
  isActive: boolean;
  maxRetries: number;
  createdAt: string | Date;
  _count: { logs: number };
}

interface ReminderLog {
  id: string;
  ruleId: string;
  defendantId: string | null;
  channel: string;
  status: string;
  retryCount: number;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
  rule: {
    id: string;
    name: string;
    eventType: string;
  };
}

interface ReminderStats {
  totalRules: number;
  activeRules: number;
  sent: number;
  failed: number;
  skipped: number;
}

interface ReminderWorkspaceProps {
  rules: ReminderRule[];
  logs: ReminderLog[];
  logTotal: number;
  stats: ReminderStats;
}

// ─── Helpers ───────────────────────────────────────────────

const EVENT_TYPES = [
  { value: "court_date", label: "Court Date", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" },
  { value: "payment_due", label: "Payment Due", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30" },
  { value: "check_in", label: "Check-In", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" },
  { value: "signature", label: "Signature", color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30" },
];

const CHANNEL_OPTIONS = [
  { value: "sms", label: "SMS", icon: <MessageSquare className="h-3 w-3" /> },
  { value: "email", label: "Email", icon: <Mail className="h-3 w-3" /> },
  { value: "both", label: "Both", icon: <Zap className="h-3 w-3" /> },
];

const OFFSET_PRESETS = [
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "6 hours", value: 360 },
  { label: "12 hours", value: 720 },
  { label: "24 hours", value: 1440 },
  { label: "48 hours", value: 2880 },
  { label: "72 hours", value: 4320 },
  { label: "1 week", value: 10080 },
];

function formatOffset(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

function EventBadge({ eventType }: { eventType: string }) {
  const config = EVENT_TYPES.find((e) => e.value === eventType) || EVENT_TYPES[0];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${config.color}`}>
      {config.label}
    </span>
  );
}

function ChannelBadge({ channel }: { channel: string }) {
  const opt = CHANNEL_OPTIONS.find((c) => c.value === channel);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
      {opt?.icon}
      {opt?.label || channel}
    </span>
  );
}

function LogStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    sent: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    failed: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-600 dark:text-rose-400",
      icon: <XCircle className="h-3 w-3" />,
    },
    skipped: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-500 dark:text-slate-400",
      icon: <SkipForward className="h-3 w-3" />,
    },
  };
  const c = config[status] || config.skipped;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${c.bg} ${c.text}`}>
      {c.icon}
      {status}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────

export function ReminderWorkspace({
  rules: initialRules,
  logs: initialLogs,
  logTotal,
  stats,
}: ReminderWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "logs">("rules");
  const [rules, setRules] = useState(initialRules);
  const [logs] = useState(initialLogs);
  const [isPending, startTransition] = useTransition();

  // ─── Rule Form State ────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEventType, setFormEventType] = useState("court_date");
  const [formChannel, setFormChannel] = useState("sms");
  const [formOffset, setFormOffset] = useState(1440);
  const [formTemplate, setFormTemplate] = useState("");
  const [formEmailSubject, setFormEmailSubject] = useState("");
  const [formMaxRetries, setFormMaxRetries] = useState(2);
  const [formActive, setFormActive] = useState(true);

  // ─── Log Filters ────────────────────────────────────────
  const [logSearch, setLogSearch] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // ─── Trigger feedback ───────────────────────────────────
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  const resetForm = () => {
    setFormName("");
    setFormEventType("court_date");
    setFormChannel("sms");
    setFormOffset(1440);
    setFormTemplate("");
    setFormEmailSubject("");
    setFormMaxRetries(2);
    setFormActive(true);
    setShowForm(false);
    setEditingRuleId(null);
  };

  const startEdit = (rule: ReminderRule) => {
    setEditingRuleId(rule.id);
    setFormName(rule.name);
    setFormEventType(rule.eventType);
    setFormChannel(rule.channel);
    setFormOffset(rule.offsetMinutes);
    setFormTemplate(rule.messageTemplate);
    setFormEmailSubject(rule.emailSubject || "");
    setFormMaxRetries(rule.maxRetries);
    setFormActive(rule.isActive);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formTemplate) return;

    const payload = {
      name: formName,
      eventType: formEventType as "court_date" | "payment_due" | "check_in" | "signature",
      channel: formChannel as "sms" | "email" | "both",
      offsetMinutes: formOffset,
      messageTemplate: formTemplate,
      emailSubject: (formChannel === "email" || formChannel === "both") ? formEmailSubject || null : null,
      isActive: formActive,
      maxRetries: formMaxRetries,
    };

    startTransition(async () => {
      const res = editingRuleId
        ? await updateReminderRule(editingRuleId, payload)
        : await createReminderRule(payload);

      if (res.success && res.data) {
        if (editingRuleId) {
          setRules((prev) =>
            prev.map((r) => (r.id === editingRuleId ? { ...r, ...res.data! } : r))
          );
        } else {
          const newRule: ReminderRule = {
            ...(res.data as any),
            _count: { logs: 0 },
          };
          setRules((prev) => [newRule, ...prev]);
        }
        resetForm();
      } else {
        alert(res.error || "Failed to save rule");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this reminder rule and all its logs?")) return;
    startTransition(async () => {
      const res = await deleteReminderRule(id);
      if (res.success) {
        setRules((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(res.error || "Failed to delete rule");
      }
    });
  };

  const handleToggle = (id: string) => {
    startTransition(async () => {
      const res = await toggleReminderRule(id);
      if (res.success && res.data) {
        setRules((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: res.data!.isActive } : r))
        );
      }
    });
  };

  const handleManualTrigger = (ruleId: string) => {
    startTransition(async () => {
      setTriggerResult(null);
      const res = await manualTriggerRule(ruleId);
      if (res.success && res.data) {
        setTriggerResult(
          `✅ Sent: ${res.data.sent}, Failed: ${res.data.failed}, Skipped: ${res.data.skipped}${res.data.message ? ` — ${res.data.message}` : ""}`
        );
        setTimeout(() => setTriggerResult(null), 6000);
      } else {
        setTriggerResult(`❌ ${res.error || "Failed to trigger rule"}`);
        setTimeout(() => setTriggerResult(null), 6000);
      }
    });
  };

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      !logSearch ||
      l.rule.name.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.channel.toLowerCase().includes(logSearch.toLowerCase());
    const matchesStatus = !logStatusFilter || l.status === logStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reminder Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure automated reminders for court dates, payments, check-ins,
          and signature requests. Rules are evaluated automatically via cron or
          triggered manually.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Rules" value={stats.totalRules} color="text-slate-900 dark:text-white" />
        <StatCard label="Active Rules" value={stats.activeRules} color="text-blue-600 dark:text-blue-400" />
        <StatCard label="Sent" value={stats.sent} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Failed" value={stats.failed} color="text-rose-600 dark:text-rose-400" />
        <StatCard label="Skipped" value={stats.skipped} color="text-slate-500 dark:text-slate-400" />
      </div>

      {/* Trigger Feedback Banner */}
      {triggerResult && (
        <div className={`p-3 rounded-lg text-sm font-medium border ${
          triggerResult.startsWith("✅")
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
        }`}>
          {triggerResult}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "rules" as const, label: "Reminder Rules", icon: <Settings2 className="h-4 w-4" /> },
          { id: "logs" as const, label: "Execution Log", icon: <FileText className="h-4 w-4" /> },
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

      {/* ── Tab: Reminder Rules ── */}
      {activeTab === "rules" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Active Reminder Rules
            </h3>
            <button
              onClick={() => {
                if (showForm) resetForm();
                else setShowForm(true);
              }}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              {showForm ? (
                <><X className="h-3.5 w-3.5" /> Cancel</>
              ) : (
                <><Plus className="h-3.5 w-3.5" /> Create Rule</>
              )}
            </button>
          </div>

          {/* Create / Edit Rule Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/20 space-y-4 max-w-2xl"
            >
              <p className="font-bold uppercase text-[10px] text-slate-400">
                {editingRuleId ? "Edit Reminder Rule" : "Create New Reminder Rule"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Rule Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="24hr Court Date Reminder"
                    className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm"
                    required
                  />
                </div>

                {/* Event Type */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Event Type <span className="text-rose-500">*</span></label>
                  <select
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value)}
                    className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm"
                  >
                    {EVENT_TYPES.map((et) => (
                      <option key={et.value} value={et.value}>{et.label}</option>
                    ))}
                  </select>
                </div>

                {/* Channel */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Channel <span className="text-rose-500">*</span></label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value)}
                    className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm"
                  >
                    {CHANNEL_OPTIONS.map((ch) => (
                      <option key={ch.value} value={ch.value}>{ch.label}</option>
                    ))}
                  </select>
                </div>

                {/* Offset */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">
                    Time Offset (before event)
                  </label>
                  <select
                    value={formOffset}
                    onChange={(e) => setFormOffset(Number(e.target.value))}
                    className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm"
                  >
                    {OFFSET_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Subject (conditional) */}
              {(formChannel === "email" || formChannel === "both") && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Email Subject</label>
                  <input
                    type="text"
                    value={formEmailSubject}
                    onChange={(e) => setFormEmailSubject(e.target.value)}
                    placeholder="Reminder: Your court date is approaching"
                    className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm"
                  />
                </div>
              )}

              {/* Message Template */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">
                  Message Template <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formTemplate}
                  onChange={(e) => setFormTemplate(e.target.value)}
                  placeholder={"Hi {{defendant_name}}, this is a reminder about your upcoming court date on {{court_date}} at {{court_name}}."}
                  rows={4}
                  className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm resize-y"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Available merge fields: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{"{{defendant_name}}"}</code>{" "}
                  <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{"{{court_date}}"}</code>{" "}
                  <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{"{{court_name}}"}</code>{" "}
                  <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{"{{case_number}}"}</code>{" "}
                  <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{"{{bond_amount}}"}</code>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Max Retries */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Max Retries</label>
                  <input
                    type="number"
                    value={formMaxRetries}
                    onChange={(e) => setFormMaxRetries(Number(e.target.value))}
                    min={0}
                    max={10}
                    className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className={`p-2 rounded-lg border text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                      formActive
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-500"
                    }`}
                  >
                    {formActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    {formActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Saving..." : editingRuleId ? "Update Rule" : "Create Rule"}
              </button>
            </form>
          )}

          {/* Rules List */}
          {rules.length === 0 ? (
            <div className="text-center py-12 border border-slate-200 dark:border-slate-800 rounded-xl">
              <AlarmClock className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No reminder rules created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`border rounded-xl p-4 transition-all group ${
                    rule.isActive
                      ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      : "border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/10 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {rule.name}
                        </span>
                        <EventBadge eventType={rule.eventType} />
                        <ChannelBadge channel={rule.channel} />
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {formatOffset(rule.offsetMinutes)} before
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-md">
                        {rule.messageTemplate}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {rule._count.logs} executions · Max {rule.maxRetries} retries
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Manual Trigger */}
                      <button
                        onClick={() => handleManualTrigger(rule.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Run Now"
                      >
                        <Play className="h-4 w-4" />
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggle(rule.id)}
                        disabled={isPending}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          rule.isActive
                            ? "hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-500 hover:text-emerald-700"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                        }`}
                        title={rule.isActive ? "Disable" : "Enable"}
                      >
                        {rule.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => startEdit(rule)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(rule.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Execution Log ── */}
      {activeTab === "logs" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden">
          {/* Search & Filter */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search by rule name..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <select
              value={logStatusFilter}
              onChange={(e) => setLogStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Rule</th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Event</th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Channel</th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Retries</th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">Time</th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-16 text-xs">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p>No execution logs yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors cursor-pointer"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                            {log.rule.name}
                          </td>
                          <td className="px-4 py-3">
                            <EventBadge eventType={log.rule.eventType} />
                          </td>
                          <td className="px-4 py-3">
                            <ChannelBadge channel={log.channel} />
                          </td>
                          <td className="px-4 py-3">
                            <LogStatusBadge status={log.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                            {log.retryCount}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </td>
                        </tr>
                        {isExpanded && log.errorMessage && (
                          <tr>
                            <td colSpan={7} className="bg-slate-50 dark:bg-slate-950/30 px-6 py-3">
                              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                                <strong>Error:</strong> {log.errorMessage}
                              </div>
                            </td>
                          </tr>
                        )}
                        {isExpanded && !log.errorMessage && (
                          <tr>
                            <td colSpan={7} className="bg-slate-50 dark:bg-slate-950/30 px-6 py-3">
                              <p className="text-xs text-slate-500">No additional details.</p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>Showing {filteredLogs.length} of {logTotal} log entries</span>
          </div>
        </div>
      )}
    </div>
  );
}
