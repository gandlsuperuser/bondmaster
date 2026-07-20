import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getReminderRules,
  getReminderLogs,
  getReminderStats,
} from "@/actions/reminders";
import { ReminderWorkspace } from "@/components/reminders/reminder-workspace";

export default async function RemindersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [rulesResult, logsResult, statsResult] = await Promise.all([
    getReminderRules(),
    getReminderLogs({ page: 1, pageSize: 50 }),
    getReminderStats(),
  ]);

  if (!rulesResult.success || !logsResult.success || !statsResult.success) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 rounded-xl">
        <p className="font-semibold">Error Loading Reminder Engine</p>
        <p className="text-xs mt-1">
          Please check database connectivity and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <ReminderWorkspace
        rules={rulesResult.data as any}
        logs={logsResult.data?.logs as any}
        logTotal={logsResult.data?.total ?? 0}
        stats={statsResult.data as any}
      />
    </div>
  );
}
