"use client";

import React, { useState, useTransition } from "react";
import {
  Mail,
  Send,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ArrowUpRight,
  Inbox,
  X,
} from "lucide-react";
import {
  sendEmail,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "@/actions/emails";

// ─── Types ─────────────────────────────────────────────────

interface EmailRecord {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  direction: string;
  status: string;
  resendId: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  failedReason: string | null;
  createdAt: string;
  defendant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface Defendant {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface EmailStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
}

interface EmailWorkspaceProps {
  emails: EmailRecord[];
  emailTotal: number;
  templates: EmailTemplate[];
  defendants: Defendant[];
  stats: EmailStats;
}

// ─── Status Badge ──────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    queued: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      icon: <Clock className="h-3 w-3" />,
    },
    sent: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
      icon: <Send className="h-3 w-3" />,
    },
    delivered: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    opened: {
      bg: "bg-violet-50 dark:bg-violet-950/30",
      text: "text-violet-600 dark:text-violet-400",
      icon: <Eye className="h-3 w-3" />,
    },
    failed: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-600 dark:text-rose-400",
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const c = config[status] || config.queued;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${c.bg} ${c.text}`}
    >
      {c.icon}
      {status}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────

export function EmailWorkspace({
  emails: initialEmails,
  emailTotal,
  templates: initialTemplates,
  defendants,
  stats,
}: EmailWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"inbox" | "compose" | "templates">("inbox");
  const [emails, setEmails] = useState(initialEmails);
  const [templates, setTemplates] = useState(initialTemplates);
  const [isPending, startTransition] = useTransition();

  // ─── Inbox State ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ─── Compose State ──────────────────────────────────────
  const [composeDefendantId, setComposeDefendantId] = useState("");
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeTemplateId, setComposeTemplateId] = useState("");
  const [composeSent, setComposeSent] = useState(false);

  // ─── Template State ─────────────────────────────────────
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [tplName, setTplName] = useState("");
  const [tplSubject, setTplSubject] = useState("");
  const [tplBody, setTplBody] = useState("");

  // ─── Inbox Helpers ──────────────────────────────────────

  const filteredEmails = emails.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.defendant &&
        `${e.defendant.firstName} ${e.defendant.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ─── Compose Handlers ──────────────────────────────────

  const handleDefendantSelect = (id: string) => {
    setComposeDefendantId(id);
    const def = defendants.find((d) => d.id === id);
    if (def?.email) {
      setComposeTo(def.email);
    } else {
      setComposeTo("");
    }
  };

  const handleTemplateLoad = (templateId: string) => {
    setComposeTemplateId(templateId);
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setComposeSubject(tpl.subject);
      setComposeBody(tpl.body);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeDefendantId || !composeTo || !composeSubject || !composeBody) return;

    startTransition(async () => {
      const res = await sendEmail({
        defendantId: composeDefendantId,
        to: composeTo,
        subject: composeSubject,
        body: composeBody,
      });

      if (res.success && res.data) {
        // Add the new email to the list optimistically
        const newEmail: EmailRecord = {
          ...res.data,
          createdAt: res.data.createdAt.toString(),
          sentAt: res.data.sentAt?.toString() ?? null,
          deliveredAt: res.data.deliveredAt?.toString() ?? null,
          openedAt: res.data.openedAt?.toString() ?? null,
          defendant: defendants.find((d) => d.id === composeDefendantId) ?? null,
        };
        setEmails((prev) => [newEmail, ...prev]);

        // Reset form
        setComposeDefendantId("");
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");
        setComposeTemplateId("");
        setComposeSent(true);
        setTimeout(() => setComposeSent(false), 4000);
      } else {
        alert(res.error || "Failed to send email");
      }
    });
  };

  // ─── Template Handlers ─────────────────────────────────

  const resetTemplateForm = () => {
    setTplName("");
    setTplSubject("");
    setTplBody("");
    setShowAddTemplate(false);
    setEditingTemplateId(null);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName || !tplSubject || !tplBody) return;

    startTransition(async () => {
      const res = await createEmailTemplate({
        name: tplName,
        subject: tplSubject,
        body: tplBody,
      });

      if (res.success && res.data) {
        setTemplates((prev) => [...prev, res.data as EmailTemplate]);
        resetTemplateForm();
      } else {
        alert(res.error || "Failed to create template");
      }
    });
  };

  const handleUpdateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplateId || !tplName || !tplSubject || !tplBody) return;

    startTransition(async () => {
      const res = await updateEmailTemplate(editingTemplateId, {
        name: tplName,
        subject: tplSubject,
        body: tplBody,
      });

      if (res.success && res.data) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === editingTemplateId ? (res.data as EmailTemplate) : t))
        );
        resetTemplateForm();
      } else {
        alert(res.error || "Failed to update template");
      }
    });
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    startTransition(async () => {
      const res = await deleteEmailTemplate(id);
      if (res.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(res.error || "Failed to delete template");
      }
    });
  };

  const startEditTemplate = (t: EmailTemplate) => {
    setEditingTemplateId(t.id);
    setTplName(t.name);
    setTplSubject(t.subject);
    setTplBody(t.body);
    setShowAddTemplate(true);
  };

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Email Communication Center
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Compose emails, manage templates, and track delivery status for all
          outbound email communications.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Sent" value={stats.total} color="text-slate-900 dark:text-white" />
        <StatCard label="Sent" value={stats.sent} color="text-blue-600 dark:text-blue-400" />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard label="Opened" value={stats.opened} color="text-violet-600 dark:text-violet-400" />
        <StatCard label="Failed" value={stats.failed} color="text-rose-600 dark:text-rose-400" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 overflow-x-auto no-scrollbar">
        {[
          {
            id: "inbox" as const,
            label: "Email Log",
            icon: <Inbox className="h-4 w-4" />,
          },
          {
            id: "compose" as const,
            label: "Compose Email",
            icon: <Send className="h-4 w-4" />,
          },
          {
            id: "templates" as const,
            label: "Email Templates",
            icon: <FileText className="h-4 w-4" />,
          },
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

      {/* ── Tab: Email Log ── */}
      {activeTab === "inbox" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject, recipient, or defendant..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    Recipient
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    Subject
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    Sent At
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-muted-foreground py-16 text-xs"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Mail className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p>No emails found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((email) => {
                    const isExpanded = expandedEmailId === email.id;
                    return (
                      <React.Fragment key={email.id}>
                        <tr
                          className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedEmailId(isExpanded ? null : email.id)
                          }
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              {email.defendant ? (
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {email.defendant.lastName},{" "}
                                  {email.defendant.firstName}
                                </span>
                              ) : (
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  —
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-mono">
                                {email.to}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                            {email.subject}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={email.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {email.sentAt
                              ? new Date(email.sentAt).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : new Date(email.createdAt).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </td>
                        </tr>

                        {/* Expanded Body */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={5}
                              className="bg-slate-50 dark:bg-slate-950/30 px-6 py-4"
                            >
                              <div className="space-y-3 max-w-3xl">
                                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                  <span>
                                    <strong className="text-slate-700 dark:text-slate-300">
                                      From:
                                    </strong>{" "}
                                    {email.from}
                                  </span>
                                  <span>
                                    <strong className="text-slate-700 dark:text-slate-300">
                                      To:
                                    </strong>{" "}
                                    {email.to}
                                  </span>
                                  {email.resendId && (
                                    <span>
                                      <strong className="text-slate-700 dark:text-slate-300">
                                        Resend ID:
                                      </strong>{" "}
                                      <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">
                                        {email.resendId}
                                      </code>
                                    </span>
                                  )}
                                </div>
                                {email.failedReason && (
                                  <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                                    <strong>Error:</strong> {email.failedReason}
                                  </div>
                                )}
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                  {email.body}
                                </div>
                              </div>
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

          {/* Footer Stats */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>
              Showing {filteredEmails.length} of {emailTotal} emails
            </span>
          </div>
        </div>
      )}

      {/* ── Tab: Compose Email ── */}
      {activeTab === "compose" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Compose New Email
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a defendant, compose your message, and send it via the
              Resend email service.
            </p>
          </div>

          {composeSent && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg p-3 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Email sent successfully!
            </div>
          )}

          <form onSubmit={handleSendEmail} className="space-y-4 text-sm">
            {/* Template Loader */}
            <div className="flex flex-col gap-1 max-w-sm">
              <label className="text-xs text-slate-500 font-semibold uppercase">
                Load Template (optional)
              </label>
              <select
                value={composeTemplateId}
                onChange={(e) => handleTemplateLoad(e.target.value)}
                className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="">Select a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Defendant Selector */}
            <div className="flex flex-col gap-1 max-w-sm">
              <label className="text-xs text-slate-500 font-semibold uppercase">
                Recipient Defendant <span className="text-rose-500">*</span>
              </label>
              <select
                value={composeDefendantId}
                onChange={(e) => handleDefendantSelect(e.target.value)}
                className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-300"
                required
              >
                <option value="">Select defendant...</option>
                {defendants
                  .filter((d) => d.email)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.lastName}, {d.firstName} — {d.email}
                    </option>
                  ))}
              </select>
            </div>

            {/* To Email */}
            <div className="flex flex-col gap-1 max-w-sm">
              <label className="text-xs text-slate-500 font-semibold uppercase">
                To Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="defendant@email.com"
                className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Email subject line..."
                className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-900 dark:text-slate-100"
                required
                maxLength={200}
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">
                Email Body <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your email content here..."
                rows={8}
                className="p-3 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-900 dark:text-slate-100 leading-relaxed resize-y"
                required
              />
            </div>

            {/* Send Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending || !composeDefendantId || !composeTo}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Send className="h-4 w-4" />
                {isPending ? "Sending..." : "Send Email"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setComposeDefendantId("");
                  setComposeTo("");
                  setComposeSubject("");
                  setComposeBody("");
                  setComposeTemplateId("");
                }}
                className="py-2.5 px-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab: Email Templates ── */}
      {activeTab === "templates" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Email Templates
            </h3>
            <button
              onClick={() => {
                if (showAddTemplate) {
                  resetTemplateForm();
                } else {
                  setShowAddTemplate(true);
                }
              }}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              {showAddTemplate ? (
                <>
                  <X className="h-3.5 w-3.5" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Create Template
                </>
              )}
            </button>
          </div>

          {/* Create / Edit Template Form */}
          {showAddTemplate && (
            <form
              onSubmit={editingTemplateId ? handleUpdateTemplate : handleCreateTemplate}
              className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/20 text-xs space-y-3 max-w-lg"
            >
              <p className="font-bold uppercase text-[10px] text-slate-400">
                {editingTemplateId ? "Edit Email Template" : "Create New Email Template"}
              </p>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">
                  Template Name
                </label>
                <input
                  type="text"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="Court Hearing Notification"
                  className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">Subject</label>
                <input
                  type="text"
                  value={tplSubject}
                  onChange={(e) => setTplSubject(e.target.value)}
                  placeholder="Important: Upcoming Court Date"
                  className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">
                  Email Body
                </label>
                <textarea
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  placeholder="Write email template content..."
                  rows={5}
                  className="p-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-sm resize-y"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all cursor-pointer"
              >
                {isPending
                  ? "Saving..."
                  : editingTemplateId
                    ? "Update Template"
                    : "Save Template"}
              </button>
            </form>
          )}

          {/* Template List */}
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl">
              No email templates saved yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 text-sm font-medium">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {t.name}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditTemplate(t)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Subject: {t.subject}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-normal whitespace-pre-wrap line-clamp-3">
                    {t.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
