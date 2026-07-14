import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  // Allow everyone with at least 'view_dashboard' permission to access the dashboard routes
  if (!hasPermission(session.role, "view_dashboard")) {
    redirect("/unauthorized"); // Or any other fallback page
  }

  return (
    <DashboardShell user={session}>
      {children}
    </DashboardShell>
  );
}
