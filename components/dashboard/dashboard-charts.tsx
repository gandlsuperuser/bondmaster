"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface DashboardChartsProps {
  data: {
    month: string;
    revenue: number;
    bonds: number;
  }[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="border rounded-xl bg-card p-5 flex flex-col gap-4 shadow-xs lg:col-span-2">
      <div>
        <h3 className="font-bold text-lg">Revenue & Bond Volume</h3>
        <p className="text-xs text-muted-foreground">Monthly premium collection vs new bonds issued</p>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b" }} 
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
            />
            <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue ($)" />
            <Bar yAxisId="right" dataKey="bonds" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Bonds Issued" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
