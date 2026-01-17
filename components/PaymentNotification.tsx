// ══════════════════════════════════════════════════════════════════════════════
// PATH: components/PaymentNotification.tsx
// Shows payment status notification on dashboard
// Add this component to your dashboard page
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PaymentStatus {
  latestPayment: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    planType: string;
    amount: number;
    createdAt: string;
  } | null;
  packagePurchased: boolean;
  testsCompleted: number;
}

export default function PaymentNotification() {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch("/api/user/payment-status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error("Failed to load payment status");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  if (loading || dismissed || !status) return null;

  const { latestPayment, packagePurchased } = status;

  // No payment submitted yet
  if (!latestPayment) return null;

  // Payment is PENDING
  if (latestPayment.status === "PENDING") {
    return (
      <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-400 rounded-full p-2">
              <svg className="w-5 h-5 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">Payment Awaiting Approval</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Your payment of &#8377;{latestPayment.amount} is being verified. 
                You will be notified once approved.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Payment was APPROVED (show only if recently approved - within 24 hours)
  if (latestPayment.status === "APPROVED" && packagePurchased) {
    const approvedDate = new Date(latestPayment.createdAt);
    const now = new Date();
    const hoursSinceApproval = (now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60);

    // Only show for 24 hours after approval
    if (hoursSinceApproval > 24) return null;

    return (
      <div className="mb-6 bg-green-50 border border-green-300 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Payment Approved!</h3>
              <p className="text-green-700 text-sm mt-1">
                Your payment has been verified. You now have access to Revision Notes and 2 Mock Tests.
              </p>
              <p className="text-green-600 text-sm mt-2 font-medium">
                Best of luck with your MahaRERA preparation!
              </p>
              <div className="flex gap-3 mt-3">
                <Link
                  href="/revision"
                  className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  Start Revision
                </Link>
                <Link
                  href="/mock-test"
                  className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Take Mock Test
                </Link>
              </div>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Payment was REJECTED
  if (latestPayment.status === "REJECTED") {
    return (
      <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-red-500 rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Payment Rejected</h3>
              <p className="text-red-700 text-sm mt-1">
                Your payment could not be verified. Please contact admin or try again.
              </p>
              <Link
                href="/payment"
                className="inline-block mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                Try Again
              </Link>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
}