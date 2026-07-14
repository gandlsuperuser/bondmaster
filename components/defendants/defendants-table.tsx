"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  ShieldAlert,
  Trash2,
  Eye,
  FileSpreadsheet,
  Filter,
  Tag as TagIcon,
} from "lucide-react";
import Link from "next/link";
import { deleteDefendant } from "@/actions/defendants";

interface Defendant {
  id: string;
  firstName: string;
  lastName: string;
  dob: Date | null;
  ssn: string | null;
  tags: string[];
  createdAt: Date;
  bonds: { id: string; amount: number; status: string }[];
  courtAppearances: { id: string; courtDate: any }[];
}

interface DefendantsTableProps {
  defendants: Defendant[];
  uniqueTags?: string[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function DefendantsTable({
  defendants,
  uniqueTags = [],
  pagination,
}: DefendantsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "all";
  const currentTag = searchParams.get("tag") || "all";

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;

    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }
    params.set("page", "1"); // Reset to page 1

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "all") {
      params.set("status", val);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "all") {
      params.set("tag", val);
    } else {
      params.delete("tag");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this defendant? This will remove all associated bonds, addresses, and contacts."
      )
    ) {
      startTransition(async () => {
        const res = await deleteDefendant(id);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || "Failed to delete defendant");
        }
      });
    }
  };

  const formatSSN = (ssn: string | null) => {
    if (!ssn) return "N/A";
    if (ssn.length === 9) {
      return `***-**-${ssn.slice(-4)}`;
    }
    return ssn;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportToCSV = () => {
    const headers = ["First Name", "Last Name", "DOB", "SSN", "Tags", "Created At"];
    const rows = defendants.map((d) => [
      d.firstName,
      d.lastName,
      d.dob ? new Date(d.dob).toISOString().split("T")[0] : "",
      d.ssn || "",
      (d.tags || []).join(";"),
      new Date(d.createdAt).toISOString().split("T")[0],
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `defendants_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to color tags dynamically
  const getTagStyle = (tag: string) => {
    const colors: Record<string, string> = {
      "high risk": "bg-rose-50 text-rose-700 border-rose-500/20 dark:bg-rose-950/20 dark:text-rose-400",
      vip: "bg-amber-50 text-amber-700 border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400",
      "payment plan": "bg-blue-50 text-blue-700 border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-400",
      fta: "bg-red-50 text-red-700 border-red-500/20 dark:bg-red-950/20 dark:text-red-400",
    };
    return (
      colors[tag.toLowerCase()] ||
      "bg-slate-50 text-slate-700 border-slate-500/20 dark:bg-slate-800/40 dark:text-slate-350"
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col xl:flex-row gap-3 justify-between items-stretch xl:items-center">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Text Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.get("query") || ""}
              placeholder="Search by name or SSN..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <button
              type="submit"
              className="absolute right-2 top-1.5 px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex gap-2 items-center">
            {/* Status Select */}
            <div className="relative">
              <select
                value={currentStatus}
                onChange={handleStatusChange}
                className="pl-8 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Bonds</option>
                <option value="inactive">Inactive Bonds</option>
              </select>
              <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            {/* Tag Select */}
            {uniqueTags.length > 0 && (
              <div className="relative">
                <select
                  value={currentTag}
                  onChange={handleTagChange}
                  className="pl-8 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Tags</option>
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <TagIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export CSV
          </button>

          <Link
            href="/dashboard/defendants/new"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            Add Defendant
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Name & Tags</th>
                <th className="px-6 py-4">Date of Birth</th>
                <th className="px-6 py-4">SSN</th>
                <th className="px-6 py-4">Active Bonds</th>
                <th className="px-6 py-4">Liability</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {defendants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldAlert className="h-8 w-8 text-slate-400" />
                      <p className="font-semibold text-slate-800 dark:text-slate-200">No Defendants Found</p>
                      <p className="text-xs">Create a new profile or clear filter options.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                defendants.map((defendant) => {
                  const activeBonds = (defendant.bonds || []).filter((b) => b.status === "Active");
                  const totalLiability = activeBonds.reduce((sum, b) => sum + b.amount, 0);

                  return (
                    <tr
                      key={defendant.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-950 dark:text-white">
                            {defendant.lastName}, {defendant.firstName}
                          </span>
                          {defendant.tags && defendant.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {defendant.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${getTagStyle(
                                    tag
                                  )}`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(defendant.dob)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {formatSSN(defendant.ssn)}
                      </td>
                      <td className="px-6 py-4">
                        {activeBonds.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            {activeBonds.length} Active
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        ${totalLiability.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/defendants/${defendant.id}`}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            title="View / Edit Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(defendant.id)}
                            disabled={isPending}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Defendant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-slate-800/30 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total defendants)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
