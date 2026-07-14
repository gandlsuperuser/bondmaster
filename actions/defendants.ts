"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { defendantSchema } from "@/lib/validations/defendant";

export async function getDefendants(params?: {
  query?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  tag?: string;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const query = params?.query || "";
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const skip = (page - 1) * pageSize;

  try {
    const where: any = {
      orgId: session.orgId,
    };

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { ssn: { contains: query } },
      ];
    }

    if (params?.status === "active") {
      where.bonds = { some: { status: "Active" } };
    } else if (params?.status === "inactive") {
      where.bonds = { none: { status: "Active" } };
    }

    if (params?.tag) {
      where.tags = { has: params.tag };
    }

    const [defendants, total, allDefendantsWithTagsForTags] = await Promise.all([
      prisma.defendant.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          bonds: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
          courtAppearances: {
            select: {
              id: true,
              courtDate: true,
            },
          },
        },
      }),
      prisma.defendant.count({ where }),
      // Fetch unique tags in the org
      prisma.defendant.findMany({
        where: { orgId: session.orgId },
        select: { tags: true },
      }),
    ]);

    const uniqueTags = Array.from(
      new Set(allDefendantsWithTagsForTags.flatMap((d) => d.tags))
    );

    return {
      success: true,
      data: {
        defendants,
        uniqueTags,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  } catch (error: any) {
    console.error("[getDefendants]", error);
    return { success: false, error: "Failed to fetch defendants" };
  }
}

export async function getDefendantById(id: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const defendant = await prisma.defendant.findFirst({
      where: {
        id,
        orgId: session.orgId,
      },
      include: {
        aliases: true,
        addresses: true,
        employments: true,
        emergencyContacts: true,
        documents: true,
        bonds: {
          include: {
            payments: true,
          },
        },
        courtAppearances: true,
        notes: { orderBy: { createdAt: "desc" } },
        privateNotes: { orderBy: { createdAt: "desc" } },
        conversations: {
          include: { messages: { orderBy: { createdAt: "asc" } } },
        },
        emails: true,
        checkIns: {
          include: { location: true, photo: true },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!defendant) {
      return { success: false, error: "Defendant not found" };
    }

    return { success: true, data: defendant };
  } catch (error: any) {
    console.error("[getDefendantById]", error);
    return { success: false, error: "Failed to fetch defendant" };
  }
}

export async function createDefendant(formData: {
  firstName: string;
  lastName: string;
  dob?: string | null;
  ssn?: string | null;
  phone?: string | null;
  email?: string | null;
  tags?: string[];
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate inputs
  const parsed = defendantSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const { firstName, lastName, dob, ssn, phone, email, tags } = parsed.data;

    const defendant = await prisma.defendant.create({
      data: {
        orgId: session.orgId,
        firstName,
        lastName,
        dob,
        ssn,
        phone,
        email,
        tags,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        orgId: session.orgId,
        userId: session.id,
        action: "defendant_created",
        entityType: "Defendant",
        entityId: defendant.id,
        metadata: { firstName, lastName },
      },
    });

    revalidatePath("/dashboard/defendants");
    return { success: true, data: defendant };
  } catch (error: any) {
    console.error("[createDefendant]", error);
    return { success: false, error: "Failed to create defendant" };
  }
}

export async function updateDefendant(
  id: string,
  formData: {
    firstName: string;
    lastName: string;
    dob?: string | null;
    ssn?: string | null;
    phone?: string | null;
    email?: string | null;
    tags?: string[];
  }
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate inputs
  const parsed = defendantSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    // Check if defendant exists and belongs to the org
    const existing = await prisma.defendant.findFirst({
      where: { id, orgId: session.orgId },
    });

    if (!existing) {
      return { success: false, error: "Defendant not found" };
    }

    const { firstName, lastName, dob, ssn, phone, email, tags } = parsed.data;

    const defendant = await prisma.defendant.update({
      where: { id },
      data: {
        firstName,
        lastName,
        dob,
        ssn,
        phone,
        email,
        tags,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        orgId: session.orgId,
        userId: session.id,
        action: "defendant_updated",
        entityType: "Defendant",
        entityId: defendant.id,
        metadata: { firstName, lastName },
      },
    });

    revalidatePath("/dashboard/defendants");
    revalidatePath(`/dashboard/defendants/${id}`);
    return { success: true, data: defendant };
  } catch (error: any) {
    console.error("[updateDefendant]", error);
    return { success: false, error: "Failed to update defendant" };
  }
}

export async function deleteDefendant(id: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if defendant exists and belongs to the org
    const existing = await prisma.defendant.findFirst({
      where: { id, orgId: session.orgId },
    });

    if (!existing) {
      return { success: false, error: "Defendant not found" };
    }

    await prisma.defendant.delete({
      where: { id },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        orgId: session.orgId,
        userId: session.id,
        action: "defendant_deleted",
        entityType: "Defendant",
        entityId: id,
        metadata: { firstName: existing.firstName, lastName: existing.lastName },
      },
    });

    revalidatePath("/dashboard/defendants");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteDefendant]", error);
    return { success: false, error: "Failed to delete defendant" };
  }
}
