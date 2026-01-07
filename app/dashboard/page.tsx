"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<"NONE" | "PENDING" | "REJECTED" | "APPROVED">("NONE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  // ------------------------------
  // LOAD USER + PAYMENT STATUS
  // ------------------------------
  const loadUser = async () => {
    try {
      const res = await fetch("/api/auth/verify", { cache: "no-store" });
      if (!res.ok) return router.push("/login");

      const data = await res.json();
      setUser(data.user);

      // Latest payment status
      const payRes = await fetch("/api/payment/latest", { cache: "no-store" });
      if (payRes.ok) {
        const payData = await payRes.json();
        setPaymentStatus(payData.status);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ------------------------------
  // BUSINESS LOGIC
  // ------------------------------

  const hasPremium = user.packagePurchased === true;

  const TOTAL_TESTS = 5;
  const testsCompleted = user.testsCompleted ?? 0;
  const testsRemaining = hasPremium ? TOTAL_TESTS - testsCompleted : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-blue-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">MahaRERA MCQ Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.fullName}</span>
            <button
              onClick={() => router.push("/login")}
              className="px-3 py-1 bg-red-600 text-sm rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">

        {/* PAYMENT PENDING MESSAGE */}
        {paymentStatus === "PENDING" && !hasPremium && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mb-6">
            <h2 className="text-lg font-bold text-yellow-800">
              Payment Submitted – Pending Verification
            </h2>
            <p className="text-sm text-yellow-700 mt-1">
              Step 1: Join the official WhatsApp group  
              <br />
              Step 2: Send your payment screenshot with name & mobile number.
            </p>

            <div className="flex flex-col gap-3 mt-4">
              <a
                href="https://chat.whatsapp.com/BlEjmFbOk1O1w809vKHSHW"
                target="_blank"
                className="px-4 py-2 bg-green-600 text-white rounded text-center font-semibold"
              >
                ✅ Join WhatsApp Group
              </a>

              <a
                href="https://wa.me/8850150878?text=I%20have%20submitted%20my%20payment.%20Here%20is%20my%20screenshot.%20My%20Name%20is%20______%20and%20Mobile%20Number%20______."
                target="_blank"
                className="px-4 py-2 bg-blue-600 text-white rounded text-center font-semibold"
              >
                📤 Send Screenshot to Admin
              </a>
            </div>
          </div>
        )}

        {/* STUDY RESOURCES */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h3 className="text-2xl font-bold mb-4">📚 Study Resources</h3>

          <div className="grid md:grid-cols-2 gap-4">

            {/* REVISION CARD */}
            <div className="bg-white/20 rounded-lg p-5 text-center">
              <div className="text-4xl mb-2">📖</div>
              <div className="font-semibold text-lg">Revision Center</div>
              <div className="text-sm opacity-90 mb-2">All 11 chapters + FAQs</div>

              {hasPremium ? (
                <Link href="/revision" className="text-yellow-300 font-semibold">
                  Start Revision →
                </Link>
              ) : paymentStatus === "PENDING" ? (
                <p className="text-yellow-200">⏳ Awaiting Approval</p>
              ) : (
                <p className="text-red-200">🔒 Buy Plan to Unlock</p>
              )}
            </div>

            {/* MOCK TEST CARD */}
            <div className="bg-white/20 rounded-lg p-5 text-center">
              <div className="text-4xl mb-2">📝</div>
              <div className="font-semibold text-lg">Mock Tests</div>

              <div className="text-sm opacity-90 mb-2">
                {testsRemaining}/{TOTAL_TESTS} Tests Available
              </div>

              {hasPremium ? (
                <Link href="/mock-test" className="text-yellow-300 font-semibold">
                  Start Test →
                </Link>
              ) : paymentStatus === "PENDING" ? (
                <p className="text-yellow-200">⏳ Awaiting Approval</p>
              ) : (
                <p className="text-red-200">🔒 Buy Plan to Unlock</p>
              )}
            </div>
          </div>
        </div>

        {/* USER INFO */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid md:grid-cols-4 gap-6">

            <div>
              <p className="text-sm text-gray-600">Referral Code</p>
              <p className="text-xl font-bold">{user.referralCode || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Package Status</p>
              {hasPremium ? (
                <p className="text-lg font-bold text-purple-600">Premium Active</p>
              ) : paymentStatus === "PENDING" ? (
                <p className="text-lg font-bold text-yellow-600">Pending</p>
              ) : (
                <p className="text-lg font-bold text-red-600">Not Purchased</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600">Mock Tests Available</p>
              <p className="text-3xl font-bold text-blue-600">
                {testsRemaining}/{TOTAL_TESTS}
              </p>
              <p className="text-xs text-gray-500">
                Completed: {testsCompleted}
              </p>
            </div>

            {/* BUY BUTTON */}
            <div className="flex flex-col justify-center">
              {!hasPremium && paymentStatus === "NONE" && (
                <button
                  onClick={() => router.push("/payment")}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold"
                >
                  Buy Premium – ₹750
                </button>
              )}

              {paymentStatus === "PENDING" && !hasPremium && (
                <p className="text-center text-gray-600">Awaiting Admin Approval...</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
