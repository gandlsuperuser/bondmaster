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
  Settings,
  HelpCircle,
  Plus,
  PenTool,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission, Permission } from "@/lib/auth/permissions";
import Link from "next/link";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  // Define navigation items with required permissions
  const allNavItems = [
    { label: "Overview", href: "/dashboard", icon: <Shield className="h-4 w-4" />, permission: "view_dashboard" as Permission },
    { label: "Defendants", href: "/dashboard/defendants", icon: <Users className="h-4 w-4" />, permission: "view_defendants" as Permission },
    { label: "Bonds", href: "/dashboard/bonds", icon: <FileText className="h-4 w-4" />, permission: "view_bonds" as Permission },
    { label: "Payments", href: "/dashboard/payments", icon: <CreditCard className="h-4 w-4" />, permission: "view_payments" as Permission },
    { label: "SMS Center", href: "/dashboard/sms", icon: <MessageSquare className="h-4 w-4" />, permission: "view_sms" as Permission },
    { label: "Signatures", href: "/dashboard/signatures", icon: <CheckSquare className="h-4 w-4" />, permission: "view_signatures" as Permission },
    { label: "Bailbond E-sign", href: "/dashboard/esign", icon: <PenTool className="h-4 w-4" />, permission: "view_signatures" as Permission },
  ];

  const navItems = allNavItems.filter((item) => hasPermission(user.role, item.permission));

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col">
      
      {/* 1. Top Window Frame Header (Chrome-Style Window Bar) */}
      <header className="bg-slate-200 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 pt-2 px-4 flex flex-col gap-2 shrink-0">
        
        {/* Top Control Bar (Toolbar/Omnibox Row) */}
        <div className="flex items-center justify-between gap-4 h-10 pb-1">
          {/* Logo / Windows Controls Mock */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 block opacity-75 hover:opacity-100 cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-amber-500 block opacity-75 hover:opacity-100 cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 block opacity-75 hover:opacity-100 cursor-pointer" />
            </div>
            
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                BondsMaster
              </span>
            </Link>
          </div>

          {/* Omnibox / Search Box */}
          <div className="flex-1 max-w-xl mx-auto hidden md:flex items-center gap-2 rounded-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-4 py-1 text-xs text-muted-foreground shadow-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">Search defendants, bonds, court cases...</span>
            <kbd className="pointer-events-none select-none rounded border bg-muted px-1.5 font-mono text-[9px] font-medium opacity-80 ml-auto">
              ⌘K
            </kbd>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <CommandPalette />
            <ThemeToggle />
            <button className="p-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-muted-foreground relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-800">
              <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-500/20">
                {initials || "U"}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden lg:inline-block">
                {user.firstName}
              </span>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-800 text-muted-foreground hover:text-rose-600 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile Menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2. Chrome-Style Tab Strip */}
        <div className="flex items-end gap-1.5 overflow-x-auto no-scrollbar pt-1 -mb-[1px]">
          {navItems.map((item, idx) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={idx}
                href={item.href}
                className={`relative px-5 py-2 text-xs font-medium transition-all duration-150 rounded-t-lg flex items-center gap-2 select-none min-w-[130px] max-w-[180px] shrink-0 ${
                  active
                    ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 border-t border-x border-slate-300 dark:border-slate-800 font-semibold shadow-xs z-10"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {/* Left curve highlight for authentic tab feel */}
                {active && (
                  <>
                    <div className="absolute bottom-0 -left-[6px] w-[6px] h-[6px] bg-white dark:bg-slate-950 rounded-br-[6px] border-r border-b border-slate-300 dark:border-slate-800 z-10" />
                    <div className="absolute bottom-0 -right-[6px] w-[6px] h-[6px] bg-white dark:bg-slate-950 rounded-bl-[6px] border-l border-b border-slate-300 dark:border-slate-800 z-10" />
                  </>
                )}
                {item.icon}
                <span className="truncate">{item.label}</span>
                {!active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400/40 ml-auto" />
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col md:hidden"
            >
              <div className="h-16 px-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-lg text-foreground">
                    BondsMaster
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
                {navItems.map((item, idx) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
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

      {/* 3. Main content area below the tab bar */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
