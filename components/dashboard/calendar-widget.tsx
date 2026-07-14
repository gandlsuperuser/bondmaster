"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ShieldAlert, User } from "lucide-react";

interface CaseMilestone {
  id: string;
  defendantName: string;
  arrestDate: any;
  releasedDate: any;
  courtDate: any;
  courtName: string | null;
  status: string;
}

interface CalendarWidgetProps {
  appearances: CaseMilestone[];
}

export function CalendarWidget({ appearances: milestones }: CalendarWidgetProps) {
  // Align from January 1, 2026, to August 31, 2026
  const startTimeline = new Date(2026, 0, 1).getTime();
  const endTimeline = new Date(2026, 7, 31).getTime();
  const totalDuration = endTimeline - startTimeline;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

  // Helper to calculate percentage position on the 2026 timeline
  const getPct = (dateInput: any) => {
    if (!dateInput) return null;
    const dateMs = new Date(dateInput).getTime();
    const pct = ((dateMs - startTimeline) / totalDuration) * 100;
    return Math.max(0, Math.min(100, pct)); // clamp between 0% and 100%
  };

  const formatDate = (date: any) => {
    if (!date) return "—";
    return format(new Date(date), "MMM d");
  };

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl bg-card p-5 flex flex-col gap-4 shadow-sm h-full lg:col-span-3">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
        <div>
          <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <span>Case Progress Gantt Chart (2026)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Timeline mapping case states from Arrest to Court Date</p>
        </div>
      </div>

      {/* Gantt Calendar View */}
      <div className="flex-1 overflow-x-auto min-w-full">
        <div className="min-w-[700px] flex flex-col relative pb-4">
          
          {/* 1. Timeline Header (Months Scale) */}
          <div className="grid grid-cols-12 border-b border-slate-300 dark:border-slate-700 pb-2.5 mb-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg py-1.5 px-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
            <div className="col-span-3 text-left pl-2">Defendant Name</div>
            <div className="col-span-9 grid grid-cols-8 text-center relative pr-4">
              {months.map((m, idx) => (
                <div key={idx} className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Gantt Rows */}
          <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto no-scrollbar pr-1 relative">
            
            {/* Grid background lines - High Contrast */}
            <div className="absolute inset-0 grid grid-cols-12 pointer-events-none z-0">
              <div className="col-span-3" />
              <div className="col-span-9 grid grid-cols-8 h-full border-l border-slate-300 dark:border-slate-700">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border-r border-slate-300 dark:border-slate-700 h-full" />
                ))}
              </div>
            </div>

            {milestones.length === 0 ? (
              <div className="text-xs text-slate-400 py-10 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl col-span-12 z-10 bg-white/50 dark:bg-slate-900/50">
                No active case milestones found.
              </div>
            ) : (
              milestones.map((m) => {
                const arrestPct = getPct(m.arrestDate);
                const releasePct = getPct(m.releasedDate);
                const courtPct = getPct(m.courtDate);

                const hasArrest = arrestPct !== null;
                const hasRelease = releasePct !== null;
                const hasCourt = courtPct !== null;

                const releaseStart = hasArrest ? arrestPct : (hasRelease ? releasePct : 0);
                const activeStart = hasRelease ? releasePct : releaseStart;
                const activeEnd = hasCourt ? courtPct : 100;
                const activeWidth = `${activeEnd - activeStart}%`;

                return (
                  <div key={m.id} className="grid grid-cols-12 items-center bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl py-3 z-10 relative group transition-all shadow-2xs">
                    
                    {/* Left Column: Defendant Name */}
                    <div className="col-span-3 pr-2 pl-3 flex flex-col gap-0.5 min-w-0">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                        {m.defendantName}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 truncate max-w-[140px]" title={m.courtName || ""}>
                        {m.courtName || "Pending Court assignment"}
                      </span>
                    </div>

                    {/* Right Column: Calendar Aligned Gantt Track */}
                    <div className="col-span-9 h-9 relative flex items-center pr-4">
                      
                      {/* Gray track base - Darker for higher contrast */}
                      <div className="absolute left-0 right-4 h-2.5 bg-slate-200/90 dark:bg-slate-700/80 rounded-full w-[96%] border border-slate-300 dark:border-slate-600" />

                      {/* Green Active Bond span bar - High Contrast Green */}
                      {hasRelease && (
                        <div
                          className="absolute h-2.5 bg-green-600 dark:bg-green-500 rounded-full shadow-xs cursor-help transition-all z-10 border border-green-700 dark:border-green-400"
                          style={{
                            left: `${activeStart}%`,
                            width: activeWidth,
                          }}
                          title={`Released on Bond: ${formatDate(m.releasedDate)} to ${formatDate(m.courtDate)}`}
                        />
                      )}

                      {/* Red Arrest period bar (Arrest -> Release) - High Contrast Red */}
                      {hasArrest && hasRelease && (
                        <div
                          className="absolute h-2.5 bg-red-600 dark:bg-red-500 rounded-l-full cursor-help z-10 border-y border-l border-red-700 dark:border-red-400"
                          style={{
                            left: `${arrestPct}%`,
                            width: `${releasePct - arrestPct}%`,
                          }}
                          title={`Arrest Duration: ${formatDate(m.arrestDate)} to ${formatDate(m.releasedDate)}`}
                        />
                      )}

                      {/* Milestone Marker: Arrested (Red node) */}
                      {hasArrest && (
                        <div
                          className="absolute -translate-x-1/2 flex flex-col items-center group/node cursor-help z-20"
                          style={{ left: `${arrestPct}%` }}
                          title={`Arrested: ${formatDate(m.arrestDate)}`}
                        >
                          <span className="w-4 h-4 rounded-full bg-red-600 dark:bg-red-500 border-2 border-white dark:border-slate-900 shadow-md ring-2 ring-red-300/30" />
                          <span className="absolute -top-4 text-[9px] font-black text-red-700 dark:text-red-400 whitespace-nowrap bg-white dark:bg-slate-950 px-1 border border-red-200 rounded shadow-xs opacity-0 group-hover/node:opacity-100 transition-opacity">
                            Arr: {formatDate(m.arrestDate)}
                          </span>
                        </div>
                      )}

                      {/* Milestone Marker: Released (Green node) */}
                      {hasRelease && (
                        <div
                          className="absolute -translate-x-1/2 flex flex-col items-center group/node cursor-help z-20"
                          style={{ left: `${releasePct}%` }}
                          title={`Released on Bond: ${formatDate(m.releasedDate)}`}
                        >
                          <span className="w-4 h-4 rounded-full bg-green-600 dark:bg-green-500 border-2 border-white dark:border-slate-900 shadow-md ring-2 ring-green-300/30" />
                          <span className="absolute -top-4 text-[9px] font-black text-green-700 dark:text-green-400 whitespace-nowrap bg-white dark:bg-slate-950 px-1 border border-green-200 rounded shadow-xs opacity-0 group-hover/node:opacity-100 transition-opacity">
                            Rel: {formatDate(m.releasedDate)}
                          </span>
                        </div>
                      )}

                      {/* Milestone Marker: Court Date (Blue node) */}
                      {hasCourt && (
                        <div
                          className="absolute -translate-x-1/2 flex flex-col items-center group/node cursor-help z-20"
                          style={{ left: `${courtPct}%` }}
                          title={`Court Hearing Date: ${formatDate(m.courtDate)}`}
                        >
                          <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 border-2 border-white dark:border-slate-900 shadow-md animate-pulse ring-2 ring-blue-300/30" />
                          <span className="absolute -top-4 text-[9px] font-black text-blue-700 dark:text-blue-400 whitespace-nowrap bg-white dark:bg-slate-950 px-1 border border-blue-200 rounded shadow-xs opacity-0 group-hover/node:opacity-100 transition-opacity">
                            Crt: {formatDate(m.courtDate)}
                          </span>
                        </div>
                      )}

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* Legend & Help */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-3.5 mt-auto shrink-0 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-4 font-bold uppercase tracking-wider text-[9px]">
          <span className="text-slate-800 dark:text-slate-200">Legend:</span>
          <div className="flex items-center gap-1.5 normal-case font-extrabold text-red-600 dark:text-red-500">
            <span className="w-3 h-3 rounded-full bg-red-600 dark:bg-red-500 border border-red-700 dark:border-red-400" />
            <span>Arrest Period</span>
          </div>
          <div className="flex items-center gap-1.5 normal-case font-extrabold text-green-600 dark:text-green-500">
            <span className="w-3 h-3 rounded-full bg-green-600 dark:bg-green-500 border border-green-700 dark:border-green-400" />
            <span>Released on Bond</span>
          </div>
          <div className="flex items-center gap-1.5 normal-case font-extrabold text-blue-600 dark:text-blue-500">
            <span className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 border border-blue-700 dark:border-blue-400 animate-pulse" />
            <span>Upcoming Court Date</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-700 dark:text-slate-300">
          <ShieldAlert className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
          <span>Milestones aligned relative to 2026 month timelines.</span>
        </div>
      </div>

    </div>
  );
}
