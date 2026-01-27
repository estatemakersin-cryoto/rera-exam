// ══════════════════════════════════════════════════════════════════════════════
// PATH: components/PaymentNotification.tsx
// Shows payment & course enrollment status notifications on dashboard
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

interface CourseEnrollment {
  id: string;
  status: "PENDING" | "ENROLLED" | "COMPLETED" | "CANCELLED";
  batch: {
    name: string;
    startDate: string;
    mode: string;
    institute: {
      name: string;
    };
  };
}

export default function PaymentNotification() {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedPayment, setDismissedPayment] = useState(false);
  const [dismissedCourse, setDismissedCourse] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load payment status
        const payRes = await fetch("/api/user/payment-status", { cache: "no-store" });
        if (payRes.ok) {
          const data = await payRes.json();
          setStatus(data);
        }

        // Load course enrollment
        const enrollRes = await fetch("/api/course/enrollment/latest", { cache: "no-store" });
        if (enrollRes.ok) {
          const data = await enrollRes.json();
          if (data.enrollment) {
            setEnrollment(data.enrollment);
          }
        }
      } catch (err) {
        console.error("Failed to load status");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderPaymentNotification = () => {
    if (dismissedPayment || !status?.latestPayment) return null;

    const { latestPayment, packagePurchased } = status;

    // Payment is PENDING
    if (latestPayment.status === "PENDING") {
      return (
        <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Exam Package Payment Pending</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Your payment of ₹{latestPayment.amount} is being verified.
                </p>
              </div>
            </div>
            <button onClick={() => setDismissedPayment(true)} className="text-yellow-600 hover:text-yellow-800">
              ✕
            </button>
          </div>
        </div>
      );
    }

    // Payment APPROVED (show for 24 hours)
    if (latestPayment.status === "APPROVED" && packagePurchased) {
      const approvedDate = new Date(latestPayment.createdAt);
      const hoursSinceApproval = (Date.now() - approvedDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceApproval > 24) return null;

      return (
        <div className="mb-4 bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-green-800">Exam Package Activated!</h3>
                <p className="text-green-700 text-sm mt-1">
                  You now have access to Revision Notes and Mock Tests.
                </p>
                <div className="flex gap-3 mt-3">
                  <Link href="/revision" className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                    Start Revision
                  </Link>
                  <Link href="/mock-test" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Take Mock Test
                  </Link>
                </div>
              </div>
            </div>
            <button onClick={() => setDismissedPayment(true)} className="text-green-600 hover:text-green-800">
              ✕
            </button>
          </div>
        </div>
      );
    }

    // Payment REJECTED
    if (latestPayment.status === "REJECTED") {
      return (
        <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-800">Exam Package Payment Rejected</h3>
                <p className="text-red-700 text-sm mt-1">
                  Your payment could not be verified. Please contact admin or try again.
                </p>
                <Link href="/payment" className="inline-block mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                  Try Again
                </Link>
              </div>
            </div>
            <button onClick={() => setDismissedPayment(true)} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderCourseNotification = () => {
    if (dismissedCourse || !enrollment) return null;

    // Course PENDING
    if (enrollment.status === "PENDING") {
      return (
        <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Course Enrollment Pending</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Your enrollment is awaiting admin verification.
                </p>
                <div className="mt-2 text-sm text-yellow-700">
                  <p><strong>Institute:</strong> {enrollment.batch.institute.name}</p>
                  <p><strong>Batch:</strong> {enrollment.batch.name} ({enrollment.batch.mode})</p>
                  <p><strong>Starts:</strong> {formatDate(enrollment.batch.startDate)}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setDismissedCourse(true)} className="text-yellow-600 hover:text-yellow-800">
              ✕
            </button>
          </div>
        </div>
      );
    }

    // Course ENROLLED
    if (enrollment.status === "ENROLLED") {
      return (
        <div className="mb-4 bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-green-800">Course Enrollment Confirmed!</h3>
                <p className="text-green-700 text-sm mt-1">
                  You are enrolled for the MahaRERA Training Course.
                </p>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Institute:</strong> {enrollment.batch.institute.name}</p>
                  <p><strong>Batch:</strong> {enrollment.batch.name} ({enrollment.batch.mode})</p>
                  <p><strong>Starts:</strong> {formatDate(enrollment.batch.startDate)}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setDismissedCourse(true)} className="text-green-600 hover:text-green-800">
              ✕
            </button>
          </div>
        </div>
      );
    }

    // Course CANCELLED
    if (enrollment.status === "CANCELLED") {
      return (
        <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-800">Course Enrollment Cancelled</h3>
                <p className="text-red-700 text-sm mt-1">
                  Your enrollment was cancelled. Contact support for help.
                </p>
                <Link href="/course/enroll" className="inline-block mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                  Enroll Again
                </Link>
              </div>
            </div>
            <button onClick={() => setDismissedCourse(true)} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderPaymentNotification()}
      {renderCourseNotification()}
    </>
  );
}