import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { DefendantForm } from "@/components/defendants/defendant-form";

export default async function NewDefendantPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="py-6">
      <DefendantForm />
    </div>
  );
}
