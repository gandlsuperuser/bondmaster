import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEmails, getEmailTemplates, getEmailStats } from "@/actions/emails";
import { getDefendants } from "@/actions/defendants";
import { EmailWorkspace } from "@/components/email/email-workspace";

export default async function EmailCenterPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch all data in parallel
  const [emailsResult, templatesResult, defendantsResult, statsResult] =
    await Promise.all([
      getEmails({ page: 1, pageSize: 50 }),
      getEmailTemplates(),
      getDefendants({ page: 1, pageSize: 100 }),
      getEmailStats(),
    ]);

  if (
    !emailsResult.success ||
    !templatesResult.success ||
    !defendantsResult.success ||
    !statsResult.success
  ) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 rounded-xl">
        <p className="font-semibold">Error Loading Email Center</p>
        <p className="text-xs mt-1">
          Please check database connectivity and try again.
        </p>
      </div>
    );
  }

  const defendants = defendantsResult.data?.defendants || [];

  return (
    <div className="py-2">
      <EmailWorkspace
        emails={emailsResult.data?.emails as any}
        emailTotal={emailsResult.data?.total ?? 0}
        templates={templatesResult.data as any}
        defendants={defendants as any}
        stats={statsResult.data as any}
      />
    </div>
  );
}
