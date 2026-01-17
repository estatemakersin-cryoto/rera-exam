// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/admin/payments/page.tsx
// Admin Payment Approvals - Redirects to dashboard after action
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Payment {
  id: string;
  userId: string;
  amount: number;
  planType: string;
  transactionId: string;
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    fullName: string;
    mobile: string;
    email: string | null;
  };
}

type TabType = "PENDING" | "APPROVED" | "REJECTED";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);

  const [counts, setCounts] = useState({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  });

  useEffect(() => {
    loadPayments();
  }, [activeTab]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/payments?status=${activeTab}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load payments");
      }

      const data = await res.json();
      setPayments(data.payments || []);
      setCounts(data.counts || { PENDING: 0, APPROVED: 0, REJECTED: 0 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (paymentId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

    try {
      setProcessing(paymentId);

      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${action} payment`);
      }

      // Show success message
      alert(`Payment ${action}d successfully!`);

      // Redirect to admin dashboard after action
      router.push("/admin");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case "PACKAGE":
        return "Revision & Mock Test Package";
      case "ADDITIONAL_TEST":
        return "Additional Mock Test";
      case "PREMIUM_PLAN":
        return "Revision & Mock Test Package"; // Legacy support
      default:
        return planType;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment Approvals</h1>
        <p className="text-gray-500 text-sm">Review and approve user payments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === "PENDING"
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Pending ({counts.PENDING})
        </button>
        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === "APPROVED"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Approved ({counts.APPROVED})
        </button>
        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === "REJECTED"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Rejected ({counts.REJECTED})
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading payments...</p>
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">No {activeTab.toLowerCase()} payments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg shadow p-5 border-l-4 border-l-blue-500"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {payment.user.fullName}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : payment.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Mobile:</span>{" "}
                      <span className="text-gray-800">{payment.user.mobile}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Plan:</span>{" "}
                      <span className="text-gray-800">{getPlanLabel(payment.planType)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount:</span>{" "}
                      <span className="text-gray-800 font-semibold">
                        &#8377;{payment.amount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>{" "}
                      <span className="text-gray-800">{formatDate(payment.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">UPI Ref:</span>{" "}
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {payment.transactionId}
                    </code>
                  </div>

                  {payment.notes && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Notes:</span>{" "}
                      <span className="text-gray-600 italic">{payment.notes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {payment.status === "PENDING" && (
                  <div className="flex gap-2 md:flex-col">
                    <button
                      onClick={() => handleAction(payment.id, "approve")}
                      disabled={processing === payment.id}
                      className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {processing === payment.id ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(payment.id, "reject")}
                      disabled={processing === payment.id}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      {processing === payment.id ? "..." : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}