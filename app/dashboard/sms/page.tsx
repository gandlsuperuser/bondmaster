import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getConversations, getTemplates } from "@/actions/sms";
import { getDefendants } from "@/actions/defendants";
import { SMSWorkspace } from "@/components/sms/sms-workspace";

export default async function SMSCenterPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch all threads, template rules, and active defendants
  const [conversationsResult, templatesResult, defendantsResult] = await Promise.all([
    getConversations(),
    getTemplates(),
    getDefendants({ page: 1, pageSize: 100 }), // Get a large batch for recipient listing
  ]);

  if (!conversationsResult.success || !templatesResult.success || !defendantsResult.success) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 rounded-xl">
        <p className="font-semibold">Error Loading SMS Center</p>
        <p className="text-xs mt-1">Please check database connectivity and try again.</p>
      </div>
    );
  }

  const defendants = defendantsResult.data?.defendants || [];

  return (
    <div className="py-2">
      <SMSWorkspace
        conversations={conversationsResult.data as any}
        defendants={defendants as any}
        templates={templatesResult.data as any}
      />
    </div>
  );
}
