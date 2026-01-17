// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/admin/page.tsx
// Admin Dashboard - 4 column layout, compact cards, pending payments alert
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  usersToday: number;
  paidToday: number;
  revenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  examPackagePrice: number;
  pendingPayments: number;
  activeInstitutes: number;
  totalBranches: number;
  totalBatches: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch stats");
        }

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error("Admin Stats Error:", err);
        setError(err.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">MahaRERA Mock Test Platform</p>
      </div>

      {/* Pending Payments Alert */}
      {(stats?.pendingPayments || 0) > 0 && (
        <Link
          href="/admin/payments"
          className="block mb-6 bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                {stats?.pendingPayments}
              </div>
              <div>
                <p className="font-semibold text-red-800">Payments Awaiting Approval</p>
                <p className="text-red-600 text-sm">Click to review and approve</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Platform Users Stats - 4 columns */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Platform Users</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-xs font-medium">Total Users</p>
            <p className="text-2xl font-bold text-blue-700">{stats?.totalUsers || 0}</p>
          </div>

          {/* Paid Users */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-xs font-medium">Paid Users</p>
            <p className="text-2xl font-bold text-green-700">{stats?.paidUsers || 0}</p>
            <p className="text-xs text-gray-400">
              {stats?.totalUsers ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(0) : 0}% conversion
            </p>
          </div>

          {/* Today Signups */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-gray-500 text-xs font-medium">Today Signups</p>
            <p className="text-2xl font-bold text-orange-700">{stats?.usersToday || 0}</p>
          </div>

          {/* Payments Today */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-gray-500 text-xs font-medium">Paid Today</p>
            <p className="text-2xl font-bold text-purple-700">{stats?.paidToday || 0}</p>
          </div>
        </div>
      </div>

      {/* Revenue Stats - 3 columns */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-xs font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-yellow-700">
              &#8377;{stats?.revenue?.toLocaleString("en-IN") || 0}
            </p>
            <p className="text-xs text-gray-400">{stats?.paidUsers || 0} paid users</p>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
            <p className="text-gray-500 text-xs font-medium">This Month</p>
            <p className="text-2xl font-bold text-emerald-700">
              &#8377;{stats?.revenueThisMonth?.toLocaleString("en-IN") || 0}
            </p>
          </div>

          {/* Today */}
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
            <p className="text-gray-500 text-xs font-medium">Today</p>
            <p className="text-2xl font-bold text-cyan-700">
              &#8377;{stats?.revenueToday?.toLocaleString("en-IN") || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Institute Stats - 4 columns */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Institutes</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
            <p className="text-gray-500 text-xs font-medium">Active Institutes</p>
            <p className="text-2xl font-bold text-teal-700">{stats?.activeInstitutes || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <p className="text-gray-500 text-xs font-medium">Total Branches</p>
            <p className="text-2xl font-bold text-indigo-700">{stats?.totalBranches || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500">
            <p className="text-gray-500 text-xs font-medium">Total Batches</p>
            <p className="text-2xl font-bold text-pink-700">{stats?.totalBatches || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <p className="text-gray-500 text-xs font-medium">Institute Students</p>
            <p className="text-2xl font-bold text-gray-700">0</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - 4 columns */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/chapters"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-semibold">Chapters</span>
          </div>
          <p className="text-green-100 text-xs">Manage chapters</p>
        </Link>

        <Link
          href="/admin/questions"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Questions</span>
          </div>
          <p className="text-blue-100 text-xs">Manage MCQs</p>
        </Link>

        <Link
          href="/admin/revision"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold">Revision</span>
          </div>
          <p className="text-purple-100 text-xs">Study materials</p>
        </Link>

        <Link
          href="/admin/bulk-upload"
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="font-semibold">Bulk Upload</span>
          </div>
          <p className="text-yellow-100 text-xs">Import data</p>
        </Link>

        <Link
          href="/admin/payments"
          className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg shadow hover:shadow-lg transition-all relative"
        >
          {(stats?.pendingPayments || 0) > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
              {stats?.pendingPayments}
            </span>
          )}
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-semibold">Payments</span>
          </div>
          <p className="text-red-100 text-xs">Approve payments</p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-semibold">Users</span>
          </div>
          <p className="text-indigo-100 text-xs">Manage users</p>
        </Link>

        <Link
          href="/admin/institutes"
          className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-lg shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-semibold">Institutes</span>
          </div>
          <p className="text-teal-100 text-xs">Manage institutes</p>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-gradient-to-br from-gray-600 to-gray-700 text-white p-4 rounded-lg shadow hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold">Settings</span>
          </div>
          <p className="text-gray-300 text-xs">Platform config</p>
        </Link>
      </div>
    </div>
  );
}