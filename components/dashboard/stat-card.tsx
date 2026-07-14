"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral" | "alert";
  color: string;
  bg: string;
  icon: React.ReactNode;
}

    export function StatCard({ title, value, change, trend, color, bg, icon }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="border rounded-xl bg-card p-5 flex flex-col gap-3 shadow-xs"
    >
      <div className="flex items-center justify-between text-muted-foreground text-sm font-medium">
        <span>{title}</span>
        <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {trend === "up" && (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
        )}
        {trend === "alert" && (
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
        )}
        <span className="text-muted-foreground truncate">{change}</span>
      </div>
    </motion.div>
  );
}
