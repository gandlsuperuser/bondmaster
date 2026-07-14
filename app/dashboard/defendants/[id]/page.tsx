import React from "react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDefendantById } from "@/actions/defendants";
import { DefendantDetails } from "@/components/defendants/defendant-details";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DefendantDetailsPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const result = await getDefendantById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="py-6">
      <DefendantDetails defendant={result.data as any} />
    </div>
  );
}
