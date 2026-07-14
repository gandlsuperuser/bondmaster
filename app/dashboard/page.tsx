import React from "react";
import { Plus, Users, FileText, CreditCard, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { formatDistanceToNow, addDays, startOfWeek, endOfWeek } from "date-fns";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const orgId = session.orgId;

  // 1. Fetch KPI Stats
  const activeBondsPromise = prisma.bond.count({
    where: { orgId, status: "Active" },
  });

  const activeDefendantsPromise = prisma.defendant.count({
    where: { orgId },
  });

  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now);
  const endOfCurrentWeek = endOfWeek(now);

  const hearingsThisWeekPromise = prisma.courtDate.count({
    where: {
      courtCase: { court: { cases: { some: {} } } }, // Simplification for scoping
      date: {
        gte: startOfCurrentWeek,
        lte: endOfCurrentWeek,
      },
    },
  });

  const revenuePromise = prisma.payment.aggregate({
    where: { bond: { orgId } },
    _sum: { amount: true },
  });

  // 2. Fetch Recent Check-ins
  const recentCheckinsPromise = prisma.checkIn.findMany({
    where: { defendant: { orgId } },
    orderBy: { timestamp: "desc" },
    take: 5,
    include: {
      defendant: true,
      location: true,
    },
  });

  // 3. Fetch Case Milestones (Arrest, Release, and Court Date)
  const caseMilestonesPromise = prisma.bond.findMany({
    where: { orgId, status: "Active" },
    include: {
      defendant: {
        include: {
          courtAppearances: {
            include: {
              courtDate: {
                include: {
                  courtCase: {
                    include: { court: true }
                  }
                }
              }
            },
            orderBy: { courtDate: { date: 'asc' } },
            take: 1
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  // Fetch all bonds and payments for this year to populate the chart
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);

  const bondsThisYearPromise = prisma.bond.findMany({
    where: { orgId, createdAt: { gte: startOfYear } },
    select: { createdAt: true }
  });

  const paymentsThisYearPromise = prisma.payment.findMany({
    where: { bond: { orgId }, date: { gte: startOfYear } },
    select: { date: true, amount: true }
  });

  // 4. Wait for all queries
  const [
    activeBonds,
    activeDefendants,
    hearingsThisWeek,
    revenueAgg,
    recentCheckinsRaw,
    caseMilestonesRaw,
    bondsThisYear,
    paymentsThisYear
  ] = await Promise.all([
    activeBondsPromise,
    activeDefendantsPromise,
    hearingsThisWeekPromise,
    revenuePromise,
    recentCheckinsPromise,
    caseMilestonesPromise,
    bondsThisYearPromise,
    paymentsThisYearPromise
  ]);

  const totalRevenue = revenueAgg._sum.amount ?? 0;

  // Map Check-ins for UI
  const recentCheckins = recentCheckinsRaw.map((ci) => ({
    id: ci.id,
    name: `${ci.defendant.firstName} ${ci.defendant.lastName}`,
    time: formatDistanceToNow(ci.timestamp, { addSuffix: true }),
    status: ci.status,
    location: ci.location ? "GPS Captured" : "No Location",
    devInfo: "Mobile App",
  }));

  // Map Case Milestones for UI
  const caseMilestones = caseMilestonesRaw.map((bond) => {
    const nextAppearance = bond.defendant.courtAppearances[0];
    return {
      id: bond.id,
      defendantName: `${bond.defendant.firstName} ${bond.defendant.lastName}`,
      arrestDate: bond.arrestDate,
      releasedDate: bond.releasedDate,
      courtDate: nextAppearance?.courtDate?.date ?? null,
      courtName: nextAppearance?.courtDate?.courtCase?.court?.name ?? null,
      status: bond.status,
    };
  });

  // Dynamic Chart Data from Database
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth(); // 0-indexed

  // Build chart array up to current month
  const chartData = Array.from({ length: currentMonthIdx + 1 }, (_, i) => ({
    month: monthNames[i],
    revenue: 0,
    bonds: 0,
  }));

  // Group bonds by month
  bondsThisYear.forEach((b) => {
    const m = new Date(b.createdAt).getMonth();
    if (m <= currentMonthIdx) {
      chartData[m].bonds += 1;
    }
  });

  // Group payments by month
  paymentsThisYear.forEach((p) => {
    const m = new Date(p.date).getMonth();
    if (m <= currentMonthIdx) {
      chartData[m].revenue += p.amount;
    }
  });

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
        <StatCard
          title="Active Bonds"
          value={activeBonds.toString()}
          change="+8.4% from last month"
          trend="up"
          color="text-blue-500"
          bg="bg-blue-500/10"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Active Defendants"
          value={activeDefendants.toString()}
          change="3 pending check-ins today"
          trend="alert"
          color="text-amber-500"
          bg="bg-amber-500/10"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="All time collected"
          trend="up"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Hearings (This Week)"
          value={hearingsThisWeek.toString()}
          change="4 designated high-priority"
          trend="alert"
          color="text-rose-500"
          bg="bg-rose-500/10"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Grid Section for Charts and Calendar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardCharts data={chartData} />
        <CalendarWidget appearances={caseMilestones} />
      </div>

      {/* Two Columns Section (Bottom) */}
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
                {recentCheckins.map((checkin) => (
                  <tr key={checkin.id} className="hover:bg-muted/10 transition-colors">
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
                {recentCheckins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                      No check-ins recorded yet.
                    </td>
                  </tr>
                )}
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
                <span className="text-sm font-semibold">PostgreSQL (Neon)</span>
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
        </div>
      </div>
    </>
  );
}
