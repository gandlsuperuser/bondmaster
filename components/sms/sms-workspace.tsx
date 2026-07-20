"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import {
  MessageSquare,
  Users,
  FileText,
  Send,
  Plus,
  Check,
  CheckCheck,
  AlertTriangle,
  Search,
} from "lucide-react";
import { sendSMS, bulkSendSMS, createTemplate } from "@/actions/sms";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  direction: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  defendantId: string | null;
  defendant: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;
  messages: Message[];
}

interface Template {
  id: string;
  name: string;
  content: string;
}

interface Defendant {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

interface SMSWorkspaceProps {
  conversations: Conversation[];
  defendants: Defendant[];
  templates: Template[];
}

export function SMSWorkspace({ conversations: initialConversations, defendants, templates: initialTemplates }: SMSWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "bulk" | "templates">("chat");
  const [conversations, setConversations] = useState(initialConversations);
  const [templates, setTemplates] = useState(initialTemplates);

  const [activeConvId, setActiveConvId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );

  const [isPending, startTransition] = useTransition();

  // Chat Input State
  const [messageContent, setMessageContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Bulk State
  const [selectedDefendantIds, setSelectedDefendantIds] = useState<string[]>([]);
  const [bulkContent, setBulkContent] = useState("");
  const [selectedBulkTemplate, setSelectedBulkTemplate] = useState("");

  // New Template State
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  // Handle direct message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent || !activeConv || !activeConv.defendant) return;

    const defId = activeConv.defendant.id;
    const tempMsgId = `temp-${Date.now()}`;

    // Optimistically update UI
    const newMessage: Message = {
      id: tempMsgId,
      content: messageContent,
      direction: "outbound",
      createdAt: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, messages: [...c.messages, newMessage] } : c
      )
    );

    const backupContent = messageContent;
    setMessageContent("");

    startTransition(async () => {
      const res = await sendSMS({
        defendantId: defId,
        conversationId: activeConv.id,
        content: backupContent,
      });

      if (res.success) {
        // Swap temp ID for real ID
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === tempMsgId ? { ...m, id: res.data!.id } : m
                  ),
                }
              : c
          )
        );
      } else {
        alert(res.error || "Failed to send message");
        // Revert message content on failure
        setMessageContent(backupContent);
      }
    });
  };

  // Handle bulk broadcast send
  const handleSendBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDefendantIds.length === 0 || !bulkContent) return;

    startTransition(async () => {
      const res = await bulkSendSMS({
        defendantIds: selectedDefendantIds,
        content: bulkContent,
      });

      if (res.success) {
        alert(`Broadcast dispatched successfully to ${selectedDefendantIds.length} defendants.`);
        setSelectedDefendantIds([]);
        setBulkContent("");
        setSelectedBulkTemplate("");
      } else {
        alert(res.error || "Failed to dispatch broadcast");
      }
    });
  };

  // Handle template creation
  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !templateContent) return;

    startTransition(async () => {
      const res = await createTemplate(templateName, templateContent);
      if (res.success) {
        setTemplates((prev) => [...prev, res.data as Template]);
        setTemplateName("");
        setTemplateContent("");
        setShowAddTemplate(false);
      } else {
        alert(res.error || "Failed to create template");
      }
    });
  };

  const handleTemplateSelect = (val: string, targetSetter: (c: string) => void) => {
    if (!val) return;
    const template = templates.find((t) => t.id === val);
    if (template) {
      targetSetter(template.content);
    }
  };

  const toggleDefendantSelection = (id: string) => {
    setSelectedDefendantIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-xl shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          SMS Communication Center
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Send direct messages, select pre-saved templates, check statuses, and manage bulk broadasts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "chat" as const, label: "Direct Message Chat", icon: <MessageSquare className="h-4 w-4" /> },
          { id: "bulk" as const, label: "Bulk Broadcast", icon: <Users className="h-4 w-4" /> },
          { id: "templates" as const, label: "SMS Templates", icon: <FileText className="h-4 w-4" /> },
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

      {/* ── Direct Chat View ── */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden min-h-[500px] bg-white dark:bg-slate-900">
          
          {/* Thread List Sidebar */}
          <div className="lg:col-span-4 border-r border-slate-350 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Conversations</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[450px]">
              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 text-center">No messages found.</p>
              ) : (
                conversations.map((c) => {
                  if (!c.defendant) return null;
                  const active = c.id === activeConvId;
                  const lastMsg = c.messages[c.messages.length - 1];
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full text-left p-4 border-b flex flex-col gap-1 transition-colors cursor-pointer ${
                        active
                          ? "bg-blue-50/50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-855"
                      }`}
                    >
                      <div className="flex justify-between items-center text-sm font-semibold text-slate-900 dark:text-white">
                        <span>{c.defendant.lastName}, {c.defendant.firstName}</span>
                      </div>
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">
                        {lastMsg ? lastMsg.content : "No messages"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Conversation Bubble Pane */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px]">
            {activeConv && activeConv.defendant ? (
              <>
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                      {activeConv.defendant.lastName}, {activeConv.defendant.firstName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">{activeConv.defendant.phone || "No Phone Number Set"}</p>
                  </div>
                </div>

                {/* Message list bubble pane */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[350px]">
                  {activeConv.messages.map((m) => {
                    const isOutbound = m.direction === "outbound";
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-sm leading-normal shadow-2xs ${
                            isOutbound
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-905 dark:text-slate-100 rounded-tl-none border dark:border-slate-800"
                          }`}
                        >
                          <p>{m.content}</p>
                          <div className={`flex justify-end items-center gap-1 text-[9px] mt-1 ${isOutbound ? "text-blue-200" : "text-slate-400"}`}>
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOutbound && <CheckCheck className="h-3 w-3 text-blue-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Controls */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <select
                      value={selectedTemplate}
                      onChange={(e) => {
                        setSelectedTemplate(e.target.value);
                        handleTemplateSelect(e.target.value, setMessageContent);
                      }}
                      className="text-xs border rounded p-1.5 bg-white dark:bg-slate-950 outline-hidden text-slate-700 dark:text-slate-350"
                    >
                      <option value="">Load SMS Template...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type message..."
                      className="flex-1 bg-white dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-hidden"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select a conversation thread to view chat logs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bulk Broadcast View ── */}
      {activeTab === "bulk" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Broadcast Bulk SMS Notification</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select multiple defendants and send a broadcast message simultaneously.</p>
          </div>

          <form onSubmit={handleSendBulk} className="space-y-4 text-sm font-medium">
            {/* Template select */}
            <div className="flex flex-col gap-1 max-w-xs">
              <label className="text-xs text-slate-500 font-semibold uppercase">Quick Template</label>
              <select
                value={selectedBulkTemplate}
                onChange={(e) => {
                  setSelectedBulkTemplate(e.target.value);
                  handleTemplateSelect(e.target.value, setBulkContent);
                }}
                className="p-2 border rounded bg-white dark:bg-slate-955 outline-hidden text-slate-700 dark:text-slate-350"
              >
                <option value="">Load Template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Content input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">Broadcast Message Body</label>
              <textarea
                value={bulkContent}
                onChange={(e) => setBulkContent(e.target.value)}
                placeholder="Broadcast message text..."
                rows={3}
                className="p-3 border rounded bg-white dark:bg-slate-955 outline-hidden"
                required
              />
            </div>

            {/* Defendant Checkbox List */}
            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-semibold uppercase">Select Recipient Defendants</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border p-4 rounded-xl max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-950/20">
                {defendants.map((d) => {
                  const checked = selectedDefendantIds.includes(d.id);
                  return (
                    <label key={d.id} className="flex items-center gap-2 text-xs p-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDefendantSelection(d.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {d.lastName}, {d.firstName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || selectedDefendantIds.length === 0}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              Dispatch Broadcast to {selectedDefendantIds.length} Defendants
            </button>
          </form>
        </div>
      )}

      {/* ── Templates Editor View ── */}
      {activeTab === "templates" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Message Templates</h3>
            <button
              onClick={() => setShowAddTemplate(!showAddTemplate)}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Create Template
            </button>
          </div>

          {showAddTemplate && (
            <form onSubmit={handleAddTemplate} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950/20 text-xs space-y-3 max-w-md">
              <p className="font-bold uppercase text-[10px] text-slate-400">Save New SMS Template</p>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">Template Title</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Court Hearing Alert"
                  className="p-2 border rounded bg-white dark:bg-slate-955 outline-hidden"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">Message Content</label>
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Write message template..."
                  rows={3}
                  className="p-2 border rounded bg-white dark:bg-slate-955 outline-hidden"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-all cursor-pointer"
              >
                Save Template
              </button>
            </form>
          )}

          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-xl">
              No saved templates found.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 text-sm font-medium">
              {templates.map((t) => (
                <div key={t.id} className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                  <p className="text-xs text-slate-650 dark:text-slate-400 font-normal leading-normal whitespace-pre-wrap">
                    {t.content}
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
