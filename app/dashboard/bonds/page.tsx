"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  FolderOpen,
  Filter,
  Printer,
  FileText,
  Tag,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

// Mock data for Bonds page to match the user's screenshot
const INITIAL_BONDS = [
  { id: "1", powerNumber: "2018AA-987", caseNumber: "23M-0210-B", name: "Ashan, Warsi", date: "07/30/24", agent: "Inventory", amount: 1500, status: "Active", label: "Credit Invest" },
  { id: "2", powerNumber: "2018AA-800", caseNumber: "", name: "Vigil, Elinita", date: "05/15/24", agent: "Inventory", amount: 4500, status: "Active", label: "Bond Splits" },
  { id: "3", powerNumber: "2018AA-799", caseNumber: "", name: "Payton, John", date: "05/11/24", agent: "Inventory", amount: 15000, status: "Active", label: "Deed of Trust" },
  { id: "4", powerNumber: "2018AA-798", caseNumber: "23M-0210-B", name: "Anderson, Terry", date: "03/24/24", agent: "Inventory", amount: 1500, status: "Active", label: "Cash Collateral" },
  { id: "5", powerNumber: "2018AA-797", caseNumber: "", name: "Smith, Janet", date: "02/26/24", agent: "Inventory", amount: 3000, status: "Active", label: "Reinstated" },
  { id: "6", powerNumber: "2018AA-794", caseNumber: "", name: "Black, Tyrone", date: "01/05/24", agent: "Inventory", amount: 1500, status: "Active", label: "No Label" },
  { id: "7", powerNumber: "2018AA-792", caseNumber: "", name: "Anderson, Terry", date: "12/05/23", agent: "Inventory", amount: 1500, status: "Active", label: "Credit Invest" },
  { id: "8", powerNumber: "2018AA-791", caseNumber: "", name: "Anderson, Terry", date: "12/05/23", agent: "Inventory", amount: 1500, status: "Active", label: "Credit Invest" },
  { id: "9", powerNumber: "2018AA-790", caseNumber: "", name: "Franks, Rhonda", date: "09/22/23", agent: "Inventory", amount: 1500, status: "Active", label: "Cash Collateral" },
  { id: "10", powerNumber: "2018AA-786", caseNumber: "", name: "Micheal, Georger", date: "08/10/23", agent: "Inventory", amount: 1500, status: "Active", label: "No Label" },
  { id: "11", powerNumber: "2018AA-789", caseNumber: "", name: "Micheal, Georger", date: "08/10/23", agent: "Inventory", amount: 500, status: "Active", label: "Bond Splits" },
  { id: "12", powerNumber: "2018AA-785", caseNumber: "4434", name: "Reemer, Gary", date: "07/09/23", agent: "Inventory", amount: 1650, status: "Active", label: "No Label" },
  { id: "13", powerNumber: "2018AA-784", caseNumber: "111", name: "Solutions, DCode", date: "07/07/23", agent: "Inventory", amount: 50000, status: "Active", label: "Deed of Trust" },
  { id: "14", powerNumber: "2018AA-787", caseNumber: "", name: "Aldene, Jamest R", date: "02/20/23", agent: "Inventory", amount: 1200, status: "Active", label: "Reinstated" },
  { id: "15", powerNumber: "2018AA-779", caseNumber: "", name: "Brown, Casso", date: "02/04/23", agent: "Inventory", amount: 15000, status: "Active", label: "Credit Invest" },
];

const LAST_OPENED = [
  "ANDERSON, TERRY",
  "VIGIL, ELINITA",
  "ASHAN, WARSI",
  "PAYTON, JOHN",
  "BIGSBY, GARY",
  "BLACK, TYRONE",
  "MICHEAL, GEORGER",
  "FRANKS, RHONDA",
  "ALDEEN, DOREEN",
  "GARCIA, TYRONE",
  "CASSO, NICOLAS",
  "ALDENE, JAMEST R",
  "BRADY, GARY",
];

const LABELS = [
  { name: "Credit Invest", color: "bg-red-500" },
  { name: "Bond Splits", color: "bg-orange-400" },
  { name: "Deed of Trust", color: "bg-yellow-500" },
  { name: "Cash Collateral", color: "bg-green-500" },
  { name: "Reinstated", color: "bg-purple-500" },
  { name: "No Label", color: "bg-slate-300 dark:bg-slate-700" },
];

export default function BondsPage() {
  const [bonds, setBonds] = useState(INITIAL_BONDS);
  const [activeFilter, setActiveFilter] = useState("Active Bonds");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("Bonds");
  const [letterFilter, setLetterFilter] = useState("");

  // Stats calculations
  const totalLiability = bonds.reduce((acc, b) => acc + b.amount, 0);

  // Filters from top bar
  const [insurer, setInsurer] = useState("All");
  const [office, setOffice] = useState("All");
  const [agent, setAgent] = useState("All");
  const [court, setCourt] = useState("All");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Handle filtering
  const filteredBonds = bonds.filter((bond) => {
    // Search query
    if (searchQuery && !bond.name.toLowerCase().includes(searchQuery.toLowerCase()) && !bond.powerNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Alphabetical filter
    if (letterFilter && !bond.name.toUpperCase().startsWith(letterFilter)) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex gap-6 h-full items-start">
      
      {/* LEFT COLUMN: Sub-Sidebar (approx. 20% width / w-64 or w-72 shrink-0) */}
      <div className="w-64 shrink-0 flex flex-col gap-6">
        
        {/* 1. Bond Section Navigator */}
        <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-xs overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Bond Section</h3>
          </div>
          <div className="p-2 flex flex-col gap-1 text-xs">
            {[
              { name: "Saved Drafts", count: 1, color: "text-rose-600" },
              { name: "Recently Added", count: 30 },
              { name: "All Bonds", count: 175 },
              { name: "Active Bonds", count: 114, isBold: true },
              { name: "FTA Bonds", count: 5 },
              { name: "Discharged Bonds", count: 56 },
              { name: "Not Reported", count: 149 },
              { name: "Premium Balances", count: 117 },
              { name: "Transfer Posting", count: 2 },
              { name: "Quick Discharge Tool", count: null },
              { name: "Payment Plan Bonds", count: null },
            ].map((item, idx) => {
              const active = activeFilter === item.name;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveFilter(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <span className={item.color || ""}>{item.name}</span>
                  {item.count !== null && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full font-semibold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Search Panel */}
        <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-xs overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Quick Search</h3>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 outline-hidden shrink-0"
              >
                <option>Bonds</option>
                <option>Defendants</option>
                <option>Case #</option>
              </select>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-white dark:bg-slate-950 border rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 outline-hidden flex-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <button className="text-blue-600 dark:text-blue-400 hover:underline">Advanced Search</button>
              <button 
                onClick={() => { setSearchQuery(""); setLetterFilter(""); }}
                className="text-slate-400 hover:text-slate-600 text-[10px]"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* 3. Last 15 Bonds Opened */}
        <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-xs overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Last 15 Opened</h3>
          </div>
          <div className="p-2 flex flex-col max-h-60 overflow-y-auto no-scrollbar gap-2 text-xs">
            {LAST_OPENED.map((name, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(name.split(",")[0])}
                className="w-full text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-md font-semibold hover:underline tracking-wide leading-normal"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Bond Tags */}
        <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-xs overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Bond Tags</h3>
          </div>
          <div className="p-3 text-xs">
            <button 
              onClick={() => setSearchQuery("Pre_Trial")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
            >
              <Tag className="h-3 w-3 text-slate-500" />
              <span>Pre_Trial</span>
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Active Bonds Dashboard Grid (approx. 80% width) */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs p-6">
        
        {/* Title and Top Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Active Bonds Ledger
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage status labels, track active liabilities, and record discharges.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Total Liability</span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-50">
                ${totalLiability.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Top Filter Selection Panel */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-end bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Insurer</label>
            <select value={insurer} onChange={(e) => setInsurer(e.target.value)} className="text-xs border rounded-lg bg-white dark:bg-slate-950 p-2 outline-hidden">
              <option>All</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Office</label>
            <select value={office} onChange={(e) => setOffice(e.target.value)} className="text-xs border rounded-lg bg-white dark:bg-slate-950 p-2 outline-hidden">
              <option>All</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Agent</label>
            <select value={agent} onChange={(e) => setAgent(e.target.value)} className="text-xs border rounded-lg bg-white dark:bg-slate-950 p-2 outline-hidden">
              <option>All</option>
              <option>Inventory</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Court Name</label>
            <select value={court} onChange={(e) => setCourt(e.target.value)} className="text-xs border rounded-lg bg-white dark:bg-slate-950 p-2 outline-hidden">
              <option>All</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase">Min Bond</label>
            <input type="text" placeholder="$10.00" className="text-xs border rounded-lg bg-white dark:bg-slate-950 p-2 outline-hidden" />
          </div>
          <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-colors text-xs shadow-xs flex items-center justify-center">
            Go
          </button>
        </div>

        {/* Bond Labels Indicator Row */}
        <div className="flex flex-wrap gap-4 items-center justify-between text-xs py-2 px-1 border-y border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Labels:</span>
            <div className="flex flex-wrap gap-2">
              {LABELS.map((lbl, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 border rounded-full bg-slate-50 dark:bg-slate-800/40">
                  <span className={`w-2.5 h-2.5 rounded-full ${lbl.color}`} />
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{lbl.name}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Edit Labels</button>
        </div>

        {/* Alphabetical Jump Bar */}
        <div className="flex flex-wrap justify-between items-center gap-1 bg-slate-50 dark:bg-slate-800/30 p-1.5 rounded-lg border">
          <button
            onClick={() => setLetterFilter("")}
            className={`px-2 py-1 rounded text-xs font-semibold ${
              !letterFilter ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            ALL
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setLetterFilter(letter)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                letterFilter === letter
                  ? "bg-blue-600 text-white scale-105"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-wrap gap-3 items-center justify-between border-b pb-4">
          <div className="flex flex-wrap gap-2">
            <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-colors text-xs flex items-center gap-2 shadow-xs cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              <span>New Bond - Add All Info</span>
            </button>
            <button className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold text-slate-700 dark:text-slate-300 transition-colors text-xs flex items-center gap-2 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              <span>Quick Add</span>
            </button>
            <button className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold text-slate-700 dark:text-slate-300 transition-colors text-xs flex items-center gap-2 cursor-pointer">
              <span>Batch Discharge</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button className="h-9 px-3 rounded-lg border text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center" title="Print List">
              <Printer className="h-4 w-4" />
            </button>
            <button className="h-9 px-4 rounded-lg border font-semibold text-slate-700 dark:text-slate-300 transition-colors text-xs flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              <span>Rewrite Bond Report</span>
            </button>
          </div>
        </div>

        {/* Main Table Grid */}
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <th className="py-3 px-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-3 px-4">Power Number</th>
                <th className="py-3 px-4">Case Number</th>
                <th className="py-3 px-4">Bond Date</th>
                <th className="py-3 px-4">Defendant Name</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4 text-right">Bond Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBonds.length > 0 ? (
                filteredBonds.map((bond) => {
                  const currentLabel = LABELS.find((lbl) => lbl.name === bond.label);
                  return (
                    <tr key={bond.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${currentLabel?.color || "bg-slate-300"}`} />
                          <span>{bond.powerNumber}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {bond.caseNumber || <span className="text-slate-300 dark:text-slate-700">—</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {bond.date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-blue-400">
                        <button className="hover:underline flex items-center gap-1">
                          {bond.name}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {bond.agent}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 text-right">
                        ${bond.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button className="p-1 rounded-md border text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No active bonds match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
