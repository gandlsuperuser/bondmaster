"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getAppearances() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const appearances = await prisma.courtAppearance.findMany({
      where: {
        defendant: {
          orgId: session.orgId,
        },
      },
      include: {
        defendant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        courtDate: {
          include: {
            courtCase: {
              include: {
                court: true,
              },
            },
          },
        },
      },
      orderBy: {
        courtDate: {
          date: "asc",
        },
      },
    });

    return { success: true, data: appearances };
  } catch (error) {
    console.error("[getAppearances]", error);
    return { success: false, error: "Failed to fetch appearances" };
  }
}

export async function getJudges() {
  try {
    const judges = await prisma.judge.findMany({
      orderBy: {
        lastName: "asc",
      },
    });

    // Fetch all courts to map court names to judges
    const courts = await prisma.court.findMany();
    const courtMap = new Map(courts.map((c) => [c.id, c.name]));

    const mappedJudges = judges.map((j) => ({
      ...j,
      courtName: j.courtId ? courtMap.get(j.courtId) || "N/A" : "N/A",
    }));

    return { success: true, data: mappedJudges };
  } catch (error) {
    console.error("[getJudges]", error);
    return { success: false, error: "Failed to fetch judges" };
  }
}

export async function createJudge(data: {
  firstName: string;
  lastName: string;
  courtId?: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const judge = await prisma.judge.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        courtId: data.courtId || null,
      },
    });
    revalidatePath("/dashboard/court");
    return { success: true, data: judge };
  } catch (error) {
    console.error("[createJudge]", error);
    return { success: false, error: "Failed to create judge" };
  }
}

export async function updateAppearanceOutcome(appearanceId: string, status: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const updated = await prisma.courtAppearance.update({
      where: { id: appearanceId },
      data: { status },
    });
    revalidatePath("/dashboard/court");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateAppearanceOutcome]", error);
    return { success: false, error: "Failed to update outcome" };
  }
}

export async function getCourtsList() {
  try {
    const courts = await prisma.court.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: courts };
  } catch (error) {
    console.error("[getCourtsList]", error);
    return { success: false, error: "Failed to fetch courts list" };
  }
}
