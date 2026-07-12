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
  ChevronRight,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission, Permission, Role } from "@/lib/auth/permissions";
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
  ];

  // Filter items based on user's role
  const navItems = allNavItems.filter((item) => hasPermission(user.role, item.permission));

  const roleDisplayNames: Record<string, string> = {
    administrator: "Administrator",
    manager: "Manager",
    agent: "Agent",
    receptionist: "Receptionist",
    collector: "Collector",
    read_only: "Read Only",
  };

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

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
          {navItems.map((item, idx) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={idx}
                href={item.href}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="h-4 w-4 opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick Help & Bottom Info */}
        <div className="p-4 border-t flex flex-col gap-2">
          {hasPermission(user.role, "manage_settings") && (
            <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors w-full text-left">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          )}
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors w-full text-left">
            <HelpCircle className="h-4 w-4" />
            <span>Documentation</span>
          </button>

          {/* User Section / Log Out */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-semibold text-xs border border-blue-500/20">
                {initials || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{roleDisplayNames[user.role] || user.role}</p>
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
                      {active && <ChevronRight className="h-4 w-4 opacity-80" />}
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
          {children}
        </main>
      </div>
    </div>
  );
}
