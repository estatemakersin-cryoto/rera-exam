// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/dashboard/page.tsx
// User Dashboard - Dynamic settings, Package & Additional Test Purchase
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentNotification from "@/components/PaymentNotification";
import Link from "next/link";

interface Settings {
  examPackagePrice: number;
  totalMockTests: number;
  totalChapters: number;
  additionalTestPrice: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<Settings>({
    examPackagePrice: 350,
    totalMockTests: 2,
    totalChapters: 11,
    additionalTestPrice: 100,
  });
  const [paymentStatus, setPaymentStatus] =
    useState<"NONE" | "PENDING" | "REJECTED" | "APPROVED">("NONE");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settingsRes = await fetch("/api/public/settings", { cache: "no-store" });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      const res = await fetch("/api/auth/verify", { cache: "no-store" });
      if (!res.ok) return router.push("/login");

      const data = await res.json();
        if (!data.user) return router.push("/login");
        setUser(data.user);

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

  const getInvitationMessage = () => {
    return `🏠 *EstateMakers: Maharashtra's Real Estate Agent Network and MahaRERA Mock Test Platform*

  Prepare for your MahaRERA Real Estate Agent's Certificate of Competency (COC) Exam with us!

  ✅ Revision Notes - All 11 Chapters
  ✅ 2 Mock Tests (50 MCQs each)
  ✅ Bilingual - English + Marathi
  ✅ Instant Results & Certificate
  ✅ Only ₹350/-

  🎁 Use my referral code: *${user?.referralCode}*

  👉 Register now: https://estatemakers.in/register?ref=${user?.referralCode}

  📞 Contact: 8850150878 / 9699091086`;
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(getInvitationMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppShareLink = () => {
    return `https://wa.me/?text=${encodeURIComponent(getInvitationMessage())}`;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const hasPremium = user.packagePurchased === true;
  const testsCompleted = user.testsCompleted ?? 0;
  const testsRemaining = hasPremium ? settings.totalMockTests - testsCompleted : 0;
  const needsAdditionalTest = hasPremium && testsRemaining <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">MahaRERA MCQ Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.fullName}</span>
            <button
              onClick={() => router.push("/login")}
              className="px-3 py-1 bg-red-600 text-sm rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <PaymentNotification />

        {/* STUDY RESOURCES */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <h3 className="text-2xl font-bold mb-4">📚 Study Resources</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-5 text-center hover:bg-white/30 transition-colors">
              <div className="text-4xl mb-2">📖</div>
              <div className="font-semibold text-lg">Revision Center</div>
              <div className="text-sm opacity-90 mb-3">
                All {settings.totalChapters} chapters + FAQs
              </div>

              {hasPremium ? (
                <Link
                  href="/revision"
                  className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-300"
                >
                  Start Revision
                </Link>
              ) : paymentStatus === "PENDING" ? (
                <p className="text-yellow-200">Awaiting Approval</p>
              ) : (
                <p className="text-red-200">Buy Plan to Unlock</p>
              )}
            </div>

            <div className="bg-white/20 rounded-lg p-5 text-center hover:bg-white/30 transition-colors">
              <div className="text-4xl mb-2">📝</div>
              <div className="font-semibold text-lg">Mock Tests</div>
              <div className="text-sm opacity-90 mb-3">
                {testsRemaining}/{settings.totalMockTests} Tests Available
              </div>

              {hasPremium && testsRemaining > 0 ? (
                <Link
                  href="/mock-test"
                  className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-300"
                >
                  Start Test
                </Link>
              ) : hasPremium && testsRemaining <= 0 ? (
                <p className="text-orange-200">No tests remaining</p>
              ) : paymentStatus === "PENDING" ? (
                <p className="text-yellow-200">Awaiting Approval</p>
              ) : (
                <p className="text-red-200">Buy Plan to Unlock</p>
              )}
            </div>
          </div>
        </div>

        {/* USER INFO & STATS */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Status</h4>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Package Status</span>
                {hasPremium ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                    Premium Active
                  </span>
                ) : paymentStatus === "PENDING" ? (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold text-sm">
                    Pending
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold text-sm">
                    Not Purchased
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mock Tests</span>
                <span className="text-2xl font-bold text-blue-600">
                  {testsRemaining}/{settings.totalMockTests}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tests Completed</span>
                <span className="text-lg font-semibold text-gray-800">{testsCompleted}</span>
              </div>

              {!hasPremium && paymentStatus !== "PENDING" && (
                <button
                  onClick={() => router.push("/payment?type=package")}
                  className="w-full mt-4 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Buy Package - Rs.{settings.examPackagePrice}
                </button>
              )}

              {needsAdditionalTest && (
                <button
                  onClick={() => router.push("/payment?type=additional")}
                  className="w-full mt-2 px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Buy Additional Test - Rs.{settings.additionalTestPrice}
                </button>
              )}

              {paymentStatus === "PENDING" && !hasPremium && (
                <p className="text-center text-yellow-600 text-sm mt-4">
                  Awaiting Admin Approval...
                </p>
              )}
            </div>
          </div>

          {/* REFER & EARN CARD */}
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
            <h4 className="text-lg font-semibold mb-4">Refer and Earn</h4>

            <p className="text-sm opacity-90 mb-4">
              Share your referral code with friends and earn rewards when they join!
            </p>

            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <p className="text-xs opacity-80 mb-1">Your Referral Code</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold tracking-wider">
                  {user.referralCode || "N/A"}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    copied
                      ? "bg-green-400 text-green-900"
                      : "bg-white/30 hover:bg-white/40"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {user.referralCount > 0 && (
              <div className="bg-white/20 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Friends Joined</span>
                  <span className="text-xl font-bold">{user.referralCount}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <a
                href={getWhatsAppShareLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Share on WhatsApp
              </a>

              <button
                onClick={() => {
                  const url = `https://estatemakers.in/register?ref=${user.referralCode}`;
                  navigator.clipboard.writeText(url);
                  alert("Referral link copied!");
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                Copy Referral Link
              </button>
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="https://chat.whatsapp.com/BlEjmFbOk1O1w809vKHSHW"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mb-2">💬</span>
              <span className="text-sm text-center text-gray-700">Join WhatsApp Group</span>
            </a>

            <Link
              href="/contact"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mb-2">📞</span>
              <span className="text-sm text-center text-gray-700">Contact Support</span>
            </Link>

            <Link
              href="/profile"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl mb-2">👤</span>
              <span className="text-sm text-center text-gray-700">My Profile</span>
            </Link>

            <Link
              href="/results"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm text-center text-gray-700">My Results</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}