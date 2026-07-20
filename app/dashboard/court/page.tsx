import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAppearances, getJudges, getCourtsList } from "@/actions/courts";
import { CourtWorkspace } from "@/components/court/court-workspace";

export default async function CourtPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [appearancesResult, judgesResult, courtsResult] = await Promise.all([
    getAppearances(),
    getJudges(),
    getCourtsList(),
  ]);

  if (!appearancesResult.success || !judgesResult.success || !courtsResult.success) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 rounded-xl">
        <p className="font-semibold">Error Loading Court Module</p>
        <p className="text-xs mt-1">Please check database connectivity and try again.</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <CourtWorkspace
        appearances={appearancesResult.data as any}
        judges={judgesResult.data as any}
        courts={courtsResult.data as any}
      />
    </div>
  );
}
