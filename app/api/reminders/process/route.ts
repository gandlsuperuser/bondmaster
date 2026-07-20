import { NextRequest, NextResponse } from "next/server";
import { processReminders } from "@/actions/reminders";

/**
 * GET /api/reminders/process
 *
 * Cron endpoint that processes all active reminder rules across all organizations.
 * Protected by CRON_SECRET environment variable.
 *
 * Usage:
 * - Vercel Cron: Add to vercel.json crons config
 * - External: curl -H "Authorization: Bearer <CRON_SECRET>" https://your-domain/api/reminders/process
 * - Manual: Trigger from the Reminder Engine UI
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const token = authHeader?.replace("Bearer ", "");
    if (token !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processReminders();

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to process reminders" },
        { status: 500 }
      );
    }

    const summary = result.data?.reduce(
      (acc, r) => ({
        totalSent: acc.totalSent + r.sent,
        totalFailed: acc.totalFailed + r.failed,
        totalSkipped: acc.totalSkipped + r.skipped,
        orgsProcessed: acc.orgsProcessed + 1,
      }),
      { totalSent: 0, totalFailed: 0, totalSkipped: 0, orgsProcessed: 0 }
    );

    return NextResponse.json({
      success: true,
      processedAt: new Date().toISOString(),
      summary,
      details: result.data,
    });
  } catch (error) {
    console.error("[/api/reminders/process]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
