"use client";

import React, { useState, useTransition } from "react";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import {
  Shield,
  Users,
  FileText,
  MessageSquare,
  CreditCard,
  CheckSquare,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
  Calendar,
  Settings,
  HelpCircle,
  ChevronRight,
  User,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const navItems = [
    { label: "Overview", icon: <Shield className="h-4 w-4" />, active: true },
    { label: "Defendants", icon: <Users className="h-4 w-4" /> },
    { label: "Bonds", icon: <FileText className="h-4 w-4" /> },
    { label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
    { label: "SMS Center", icon: <MessageSquare className="h-4 w-4" /> },
    { label: "Signatures", icon: <CheckSquare className="h-4 w-4" /> }
  ];

  const stats = [
    {
      title: "Active Bonds",
      value: "142",
      change: "+8.4% from last month",
      trend: "up",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Active Defendants",
      value: "89",
      change: "3 pending check-ins today",
      trend: "alert",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Premium Outstanding",
      value: "$48,200",
      change: "Next auto-draw: July 6",
      trend: "neutral",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Hearings (This Week)",
      value: "14",
      change: "4 designated high-priority",
      trend: "up",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    }
  ];

  const recentCheckins = [
    { name: "John Doe", time: "10 mins ago", status: "Verified", location: "Dallas, TX", devInfo: "iPhone 15 • GPS Accur." },
    { name: "Sarah Smith", time: "42 mins ago", status: "Verified", location: "Austin, TX", devInfo: "Galaxy S24 • GPS Accur." },
    { name: "Michael Johnson", time: "1 hour ago", status: "Pending Selfie", location: "Houston, TX", devInfo: "Web Upload" },
    { name: "Emily Davis", time: "3 hours ago", status: "Failed Location", location: "Chicago, IL", devInfo: "IP Mismatch" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* 1. Sidebar (Desktop Navigation) */}
      <aside className="hidden lg:flex w-64 border-r bg-card flex-col shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            BondMaster
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                item.active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.active && <ChevronRight className="h-4 w-4 opacity-80" />}
            </button>
          ))}
        </nav>

        {/* Quick Help & Bottom Info */}
        <div className="p-4 border-t flex flex-col gap-2">
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors w-full text-left">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors w-full text-left">
            <HelpCircle className="h-4 w-4" />
            <span>Documentation</span>
          </button>

          {/* User Section / Log Out */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-semibold text-xs border border-blue-500/20">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">Administrator</p>
                <p className="text-[10px] text-muted-foreground truncate">Demo Account</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="p-1.5 rounded-lg border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
              title="Log Out"
            >
              {isPending ? (
                <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col lg:hidden"
            >
              <div className="h-16 px-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-lg text-foreground">
                    BondMaster
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 flex flex-col gap-1">
                {navItems.map((item, idx) => (
                  <button
                    key={idx}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      item.active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.active && <ChevronRight className="h-4 w-4 opacity-80" />}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main Dashboard Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 max-w-sm rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <Search className="h-4.5 w-4.5 text-muted-foreground" />
              <span>Search defendants, bonds, court cases...</span>
              <kbd className="pointer-events-none select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 ml-6">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CommandPalette />
            <ThemeToggle />
            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            {/* Profile Dropdown Placeholder */}
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 p-0.5 shadow-sm">
              <div className="h-full w-full rounded-full bg-card flex items-center justify-center font-bold text-xs text-foreground">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          {/* Dashboard Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
              <p className="text-muted-foreground text-sm">
                Track agency activity, monitor checks-ins, and manage automated payment processing.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-colors shadow-sm flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />
                <span>New Bond Request</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                className="border rounded-xl bg-card p-5 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex items-center justify-between text-muted-foreground text-sm font-medium">
                  <span>{stat.title}</span>
                  <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                    {idx === 0 && <FileText className="h-4 w-4" />}
                    {idx === 1 && <Users className="h-4 w-4" />}
                    {idx === 2 && <CreditCard className="h-4 w-4" />}
                    {idx === 3 && <Calendar className="h-4 w-4" />}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {stat.trend === "up" && (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  {stat.trend === "alert" && (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span className="text-muted-foreground truncate">{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Two Columns Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Check-Ins Table */}
            <div className="border rounded-xl bg-card lg:col-span-2 shadow-xs flex flex-col">
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Recent Mobile Check-Ins</h3>
                  <p className="text-xs text-muted-foreground">Selfie check-in with GPS verification log</p>
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-500 transition-colors font-semibold">
                  View All Log
                </button>
              </div>

              <div className="divide-y overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-muted-foreground font-semibold text-xs border-b">
                      <th className="p-4">Defendant</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Time</th>
                      <th className="p-4">Device Info</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentCheckins.map((checkin, idx) => (
                      <tr key={idx} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-medium">{checkin.name}</td>
                        <td className="p-4 text-muted-foreground">{checkin.location}</td>
                        <td className="p-4 text-muted-foreground text-xs">{checkin.time}</td>
                        <td className="p-4 text-muted-foreground text-xs">{checkin.devInfo}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              checkin.status === "Verified"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : checkin.status.startsWith("Failed")
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {checkin.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick System Actions & Info Panel */}
            <div className="border rounded-xl bg-card p-5 flex flex-col gap-6 shadow-xs h-fit">
              <div>
                <h3 className="font-bold text-lg">System Status</h3>
                <p className="text-xs text-muted-foreground">Connected integration statuses</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-sm font-semibold">Supabase Database</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Operational</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-sm font-semibold">Stripe Gateway</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Operational</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-sm" />
                    <span className="text-sm font-semibold">Twilio SMS Gateway</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Rate limit warnings</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                <strong className="text-blue-700 dark:text-blue-300 block mb-1">Developer Notice:</strong>
                Currently using Mock Authentication mode. You are logged in with dummy credentials under a mock cookie session. Real Supabase integration will active automatically once keys are added to <code>.env.local</code>.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
