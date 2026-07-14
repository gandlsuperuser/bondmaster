import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDefendants } from "@/actions/defendants";
import { DefendantsTable } from "@/components/defendants/defendants-table";
import { prisma } from "@/lib/db";
import { Users, UserCheck, Calendar } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
    status?: string;
    tag?: string;
  }>;
}

export default async function DefendantsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";
  const page = parseInt(resolvedParams.page || "1", 10);
  const status = resolvedParams.status || "all";
  const tag = resolvedParams.tag || "all";

  const result = await getDefendants({
    query,
    page,
    pageSize: 10,
    status: status !== "all" ? status : undefined,
    tag: tag !== "all" ? tag : undefined,
  });

  if (!result.success || !result.data) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 rounded-xl">
        <p className="font-semibold">Error Loading Defendants</p>
        <p className="text-xs mt-1">{result.error || "Please try again later."}</p>
      </div>
    );
  }

  // Dashboard Stats queries
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalCount, activeCount, monthlyCount] = await Promise.all([
    prisma.defendant.count({ where: { orgId: session.orgId } }),
    prisma.defendant.count({
      where: {
        orgId: session.orgId,
        bonds: { some: { status: "Active" } },
      },
    }),
    prisma.defendant.count({
      where: {
        orgId: session.orgId,
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  const stats = [
    {
      title: "Total Defendants",
      value: totalCount,
      description: "Lifetime registered profiles",
      icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-500/10",
    },
    {
      title: "Active Defendants",
      value: activeCount,
      description: "Currently on active bonds",
      icon: <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/10",
    },
    {
      title: "New This Month",
      value: monthlyCount,
      description: "Added since 1st of month",
      icon: <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      bg: "bg-purple-50 dark:bg-purple-950/30 border-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Defendant CRM
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage profiles, track active bonds, filter by labels, and view statuses.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-xl border flex items-center justify-between shadow-xs ${stat.bg}`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stat.value}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {stat.description}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border rounded-lg shadow-2xs">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Table component */}
      <DefendantsTable
        defendants={result.data.defendants as any}
        uniqueTags={result.data.uniqueTags}
        pagination={result.data.pagination}
      />
    </div>
  );
}
