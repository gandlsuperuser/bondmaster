"use client";

import React, { useState, useTransition } from "react";
import { DefendantForm } from "./defendant-form";
import {
  User,
  FileText,
  MapPin,
  Phone,
  Briefcase,
  AlertCircle,
  Plus,
  Clock,
  MessageSquare,
  Mail,
  Notebook,
  Lock,
  UserCheck,
  CheckCircle,
  X,
  CreditCard,
  Calendar,
  Send,
  Loader2,
} from "lucide-react";
import {
  createNoteAction,
  registerCheckInAction,
  sendSMSAction,
  sendEmailAction,
  createPaymentAction,
} from "@/actions/defendant-details";

interface DefendantDetailsProps {
  defendant: {
    id: string;
    firstName: string;
    lastName: string;
    dob: Date | null;
    ssn: string | null;
    phone: string | null;
    email: string | null;
    tags: string[];
    aliases: { id: string; name: string }[];
    addresses: { id: string; street: string; city: string; state: string; zip: string; isPrimary: boolean }[];
    employments: { id: string; employer: string; title: string | null }[];
    emergencyContacts: { id: string; name: string; phone: string; relation: string | null }[];
    bonds: { id: string; amount: number; status: string; payments?: any[] }[];
    courtAppearances: { id: string; courtDate: any; reason?: string }[];
    notes: { id: string; content: string; createdAt: Date }[];
    privateNotes: { id: string; content: string; createdAt: Date }[];
    conversations: { id: string; channel: string; messages: { id: string; content: string; direction: string; createdAt: Date }[] }[];
    emails: { id: string; subject: string; body: string; to: string; createdAt?: Date }[];
    checkIns: { id: string; timestamp: Date; status: string; location?: { lat: number; lng: number } | null; photo?: { url: string } | null }[];
  };
}

type TabType =
  | "profile"
  | "bonds"
  | "contacts"
  | "timeline"
  | "communication"
  | "notes"
  | "checkins"
  | "court";

export function DefendantDetails({ defendant }: DefendantDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isPending, startTransition] = useTransition();

  // Local Form States
  const [noteContent, setNoteContent] = useState("");
  const [noteIsPrivate, setNoteIsPrivate] = useState(false);
  const [smsContent, setSmsContent] = useState("");
  
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTo, setEmailTo] = useState(defendant.email || "");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentBondId, setPaymentBondId] = useState(defendant.bonds[0]?.id || "");

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "bonds" as TabType, label: "Bonds & Payments", icon: <FileText className="h-4 w-4" /> },
    { id: "court" as TabType, label: "Court Dates", icon: <Calendar className="h-4 w-4" /> },
    { id: "contacts" as TabType, label: "Contacts & Addresses", icon: <MapPin className="h-4 w-4" /> },
    { id: "notes" as TabType, label: "Notes", icon: <Notebook className="h-4 w-4" /> },
    { id: "communication" as TabType, label: "Communications", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "checkins" as TabType, label: "Check-ins", icon: <UserCheck className="h-4 w-4" /> },
    { id: "timeline" as TabType, label: "Timeline History", icon: <Clock className="h-4 w-4" /> },
  ];

  // SMS chat resolution
  const smsConversation = defendant.conversations.find((c) => c.channel === "sms");
  const smsMessages = smsConversation?.messages || [];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    startTransition(async () => {
      const res = await createNoteAction(defendant.id, noteContent.trim(), noteIsPrivate);
      if (res.success) {
        setNoteContent("");
      }
    });
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsContent.trim()) return;

    startTransition(async () => {
      const res = await sendSMSAction(defendant.id, smsContent.trim());
      if (res.success) {
        setSmsContent("");
      }
    });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim() || !emailTo.trim()) return;

    startTransition(async () => {
      const res = await sendEmailAction(defendant.id, emailSubject.trim(), emailBody.trim(), emailTo.trim());
      if (res.success) {
        setEmailSubject("");
        setEmailBody("");
      }
    });
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0 || !paymentBondId) return;

    startTransition(async () => {
      const res = await createPaymentAction(paymentBondId, amt, defendant.id);
      if (res.success) {
        setPaymentAmount("");
      }
    });
  };

  const handleTriggerCheckIn = async (status: string) => {
    startTransition(async () => {
      const res = await registerCheckInAction({
        defendantId: defendant.id,
        status,
        lat: 34.0522 + (Math.random() - 0.5) * 0.1, // mock coordinates around LA
        lng: -118.2437 + (Math.random() - 0.5) * 0.1,
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      });
      if (!res.success) {
        alert(res.error || "Failed to submit check-in");
      }
    });
  };

  // Compile all payments across all bonds
  const allPayments = defendant.bonds
    .flatMap((b) => (b.payments || []).map((p) => ({ ...p, bondId: b.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Helper format function
  const formatDateTime = (date: any) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return "N/A";
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Defendant Profile
            </span>
            {defendant.tags.map((tag) => (
              <span key={tag} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {defendant.lastName}, {defendant.firstName}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium">
            <span>SSN: <span className="font-mono">{defendant.ssn ? `***-**-${defendant.ssn.slice(-4)}` : "N/A"}</span></span>
            <span>Phone: <span>{formatPhone(defendant.phone)}</span></span>
            <span>Email: <span>{defendant.email || "N/A"}</span></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {defendant.bonds.some((b) => b.status === "Active") ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Case File
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-800">
              Closed File
            </span>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-350 dark:border-slate-850 gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 -mb-[1px] cursor-pointer ${
                isActive
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

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {/* Profile Info */}
        {activeTab === "profile" && <DefendantForm initialData={defendant} />}

        {/* Bonds and Payments */}
        {activeTab === "bonds" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bonds List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active & Past Bonds</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Summary of liability and posting logs.</p>
              </div>

              {defendant.bonds.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">No bonds are listed under this defendant.</p>
              ) : (
                <div className="space-y-3">
                  {defendant.bonds.map((bond) => (
                    <div key={bond.id} className="p-4 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-mono text-slate-400">ID: {bond.id.toUpperCase()}</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                          Amount: ${bond.amount.toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                        bond.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500/20"
                          : "bg-slate-100 text-slate-600 border-slate-300"
                      }`}>
                        {bond.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Record Payment */}
            {defendant.bonds.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Bond Payment</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Log payments from client.</p>
                </div>

                <form onSubmit={handleRecordPayment} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Select Bond</label>
                    <select
                      value={paymentBondId}
                      onChange={(e) => setPaymentBondId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden"
                    >
                      {defendant.bonds.map((b) => (
                        <option key={b.id} value={b.id}>
                          Bond (${b.amount.toLocaleString()}) - {b.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Amount ($)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="e.g. 500"
                      required
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                    Record Payment
                  </button>
                </form>

                {/* Payments list snippet */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Recent Payments</h4>
                  {allPayments.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">No payments logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {allPayments.slice(0, 4).map((p) => (
                        <div key={p.id} className="flex justify-between items-center text-[11px] p-2 bg-slate-50 dark:bg-slate-950/20 border rounded-lg">
                          <span>{formatDateTime(p.date)}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">+${p.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Court Dates */}
        {activeTab === "court" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Hearings & Court Dates</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Calendar listings for this defendant's court appearances.</p>
            </div>

            {defendant.courtAppearances.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">No scheduled court appearances.</p>
            ) : (
              <div className="space-y-3">
                {defendant.courtAppearances.map((c) => (
                  <div key={c.id} className="p-4 border rounded-xl flex items-center gap-4 bg-slate-50 dark:bg-slate-950/30 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{formatDateTime(c.courtDate)}</p>
                      <p className="text-muted-foreground mt-0.5">{c.reason || "Scheduled Hearing"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contacts & Addresses */}
        {activeTab === "contacts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Addresses */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Addresses
              </h3>
              {defendant.addresses.length === 0 ? (
                <p className="text-xs text-muted-foreground">No address on file.</p>
              ) : (
                <div className="space-y-3">
                  {defendant.addresses.map((addr) => (
                    <div key={addr.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{addr.street}</span>
                        {addr.isPrimary && (
                          <span className="text-[9px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500">{addr.city}, {addr.state} {addr.zip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Emergency Contacts */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Emergency Contacts
                </h3>
                {defendant.emergencyContacts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No emergency contacts registered.</p>
                ) : (
                  <div className="space-y-3">
                    {defendant.emergencyContacts.map((contact) => (
                      <div key={contact.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{contact.name}</span>
                          {contact.relation && <span className="text-slate-400 text-[10px]">{contact.relation}</span>}
                        </div>
                        <p className="text-slate-500 font-mono">{contact.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Employment */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Employment History
                </h3>
                {defendant.employments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No employment records registered.</p>
                ) : (
                  <div className="space-y-3">
                    {defendant.employments.map((emp) => (
                      <div key={emp.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{emp.employer}</p>
                        {emp.title && <p className="text-slate-500">{emp.title}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notes List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Public Case Notes</h3>
                {defendant.notes.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No public notes added.</p>
                ) : (
                  <div className="space-y-3">
                    {defendant.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-950/20 border rounded-lg text-xs space-y-1">
                        <p className="text-slate-800 dark:text-slate-200">{note.content}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{formatDateTime(note.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-amber-50/20 dark:bg-amber-950/10 border border-amber-500/20 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <Lock className="h-4 w-4" />
                  Internal / Private Notes
                </h3>
                {defendant.privateNotes.length === 0 ? (
                  <p className="text-xs text-amber-600/60 dark:text-amber-400/40 py-2">No internal notes added.</p>
                ) : (
                  <div className="space-y-3">
                    {defendant.privateNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 rounded-lg text-xs space-y-1">
                        <p className="text-slate-800 dark:text-slate-200">{note.content}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{formatDateTime(note.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Note Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Note</h3>
              <form onSubmit={handleAddNote} className="space-y-4">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type note content..."
                  rows={4}
                  required
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={noteIsPrivate}
                    onChange={(e) => setNoteIsPrivate(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPrivate" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    Internal / Private Note
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Save Note
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Communication History */}
        {activeTab === "communication" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SMS UI */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4 flex flex-col h-[500px]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  SMS Center
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Two-way text communication channel.</p>
              </div>

              {/* Chat messages box */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-lg p-4 overflow-y-auto space-y-3 font-medium text-xs">
                {smsMessages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">No messages exchanged yet.</p>
                ) : (
                  smsMessages.map((msg) => {
                    const outbound = msg.direction === "outbound";
                    return (
                      <div key={msg.id} className={`flex flex-col ${outbound ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[75%] p-3 rounded-xl border ${
                          outbound
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1">{formatDateTime(msg.createdAt)}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Text input */}
              <form onSubmit={handleSendSMS} className="flex gap-2">
                <input
                  type="text"
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                >
                  {isPending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
                </button>
              </form>
            </div>

            {/* Email UI */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4 flex flex-col h-[500px]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-purple-500" />
                  Email History
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Send custom email alerts.</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {/* Email Form */}
                <form onSubmit={handleSendEmail} className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Compose Email</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      required
                      className="col-span-2 p-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md focus:outline-hidden"
                    />
                    <input
                      type="email"
                      placeholder="Recipient Email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      required
                      className="col-span-2 p-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md focus:outline-hidden"
                    />
                  </div>

                  <textarea
                    placeholder="Body..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={2}
                    required
                    className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-md focus:outline-hidden"
                  />

                  <button
                    type="submit"
                    disabled={isPending}
                    className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                    Send Email
                  </button>
                </form>

                {/* Email History list */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Email Sent Logs</h4>
                  {defendant.emails.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground">No email logs found.</p>
                  ) : (
                    defendant.emails.map((email) => (
                      <div key={email.id} className="p-3 border rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{email.subject}</span>
                          <span className="text-[10px] text-slate-400">To: {email.to}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{email.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Check-ins Tab */}
        {activeTab === "checkins" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly/Monthly Check-Ins</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Records of defendant check-ins including GPS and photo verification.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTriggerCheckIn("Verified")}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Mock Verify Check-in
                </button>
                <button
                  onClick={() => handleTriggerCheckIn("Failed")}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Mock Fail Check-in
                </button>
              </div>
            </div>

            {defendant.checkIns.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">No check-ins have been recorded.</p>
            ) : (
              <div className="space-y-4">
                {defendant.checkIns.map((ci) => (
                  <div key={ci.id} className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-950/30 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      {ci.photo && (
                        <img src={ci.photo.url} alt="Verification" className="w-10 h-10 rounded-lg object-cover border border-slate-300" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{formatDateTime(ci.timestamp)}</p>
                        {ci.location && (
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            GPS: {ci.location.lat.toFixed(4)}, {ci.location.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      ci.status === "Verified"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-500/20"
                        : "bg-rose-50 text-rose-700 border-rose-500/20"
                    }`}>
                      {ci.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline & Activity History */}
        {activeTab === "timeline" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Log & Timeline</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Audit history representing actions on this client record.</p>
            </div>

            {/* We'll display mock activities or retrieve from ActivityLog relation if loaded */}
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6 py-2 text-xs">
              <div className="relative">
                <span className="absolute -left-[31px] top-0 p-1 bg-blue-100 text-blue-600 rounded-full border border-white dark:border-slate-900">
                  <CheckCircle className="h-3 w-3" />
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">Defendant Profile Registered</p>
                <p className="text-slate-400 mt-0.5">{formatDateTime(defendant.dob)}</p>
              </div>

              {defendant.bonds.map((bond, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-0 p-1 bg-emerald-100 text-emerald-600 rounded-full border border-white dark:border-slate-900">
                    <FileText className="h-3 w-3" />
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Bond Created: ${bond.amount.toLocaleString()}</p>
                  <p className="text-slate-400 mt-0.5">Status set to {bond.status}</p>
                </div>
              ))}

              {allPayments.map((p, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-0 p-1 bg-purple-100 text-purple-600 rounded-full border border-white dark:border-slate-900">
                    <CreditCard className="h-3 w-3" />
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Payment Processed: ${p.amount}</p>
                  <p className="text-slate-400 mt-0.5">{formatDateTime(p.date)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
