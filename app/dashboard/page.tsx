"use client";

import React from "react";
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Calendar,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
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
    <>
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
    </>
  );
}
