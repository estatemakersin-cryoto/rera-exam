// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE DASHBOARD
// app/institute/dashboard/page.tsx
// Main dashboard for institute owners - stats, branches, quick actions
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
  city: string | null;
  isHeadOffice: boolean;
  isOnline: boolean;
  isActive: boolean;
  _count: {
    batches: number;
    students: number;
  };
}

interface DashboardData {
  institute: {
    id: string;
    name: string;
    code: string;
    validUntil: string | null;
    isActive: boolean;
  };
  stats: {
    totalBranches: number;
    totalBatches: number;
    activeBatches: number;
    totalStudents: number;
    completedStudents: number;
  };
  branches: Branch[];
  recentBatches: {
    id: string;
    name: string;
    mode: string;
    startDate: string;
    _count: { students: number };
    branch: { name: string } | null;
  }[];
}

export default function InstituteDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/institute/dashboard");
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to load dashboard");
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const daysUntilExpiry = (validUntil: string | null) => {
    if (!validUntil) return null;
    const expiry = new Date(validUntil);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Failed to load dashboard"}
        </div>
      </div>
    );
  }

  const expiryDays = daysUntilExpiry(data.institute.validUntil);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{data.institute.name}</h1>
        <p className="text-gray-500 font-mono text-sm">{data.institute.code}</p>
      </div>

      {/* Subscription Warning */}
      {expiryDays !== null && expiryDays <= 30 && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-3 ${
            expiryDays <= 7
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-yellow-50 border border-yellow-200 text-yellow-700"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            {expiryDays <= 0
              ? "Your subscription has expired. Contact support to renew."
              : `Your subscription expires in ${expiryDays} days. Contact support to renew.`}
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-blue-600">{data.stats.totalBranches}</div>
          <div className="text-sm text-gray-500">Branches</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-green-600">{data.stats.totalBatches}</div>
          <div className="text-sm text-gray-500">Total Batches</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-purple-600">{data.stats.activeBatches}</div>
          <div className="text-sm text-gray-500">Active Batches</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-orange-600">{data.stats.totalStudents}</div>
          <div className="text-sm text-gray-500">Enrolled Students</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-teal-600">{data.stats.completedStudents}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/institute/batches/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <div>
            <div className="font-semibold">Create New Batch</div>
            <div className="text-sm text-blue-200">Start a new training batch</div>
          </div>
        </Link>
        <Link
          href="/institute/branches"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div>
            <div className="font-semibold">Manage Branches</div>
            <div className="text-sm text-purple-200">Add or edit locations</div>
          </div>
        </Link>
        <Link
          href="/institute/students"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div>
            <div className="font-semibold">View Students</div>
            <div className="text-sm text-green-200">Manage enrollments</div>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Branches */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Branches</h2>
            <Link
              href="/institute/branches/new"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Branch
            </Link>
          </div>
          <div className="divide-y">
            {data.branches.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No branches found</div>
            ) : (
              data.branches.map((branch) => (
                <div key={branch.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{branch.name}</span>
                        {branch.isHeadOffice && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            HQ
                          </span>
                        )}
                        {branch.isOnline && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            Online
                          </span>
                        )}
                      </div>
                      {branch.city && (
                        <p className="text-sm text-gray-500">📍 {branch.city}</p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-600">{branch._count.batches} batches</div>
                      <div className="text-gray-400">{branch._count.students} students</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Batches */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Batches</h2>
            <Link
              href="/institute/batches"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y">
            {data.recentBatches.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No batches yet.{" "}
                <Link href="/institute/batches/new" className="text-blue-600 hover:underline">
                  Create one
                </Link>
              </div>
            ) : (
              data.recentBatches.map((batch) => (
                <div key={batch.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{batch.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            batch.mode === "ONLINE"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {batch.mode}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {batch.branch?.name || "No branch"} • Starts{" "}
                        {formatDate(batch.startDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-700">
                        {batch._count.students}
                      </div>
                      <div className="text-xs text-gray-400">students</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
