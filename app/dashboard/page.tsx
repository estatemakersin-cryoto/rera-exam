// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/dashboard/page.tsx
// User Dashboard - Training Course + Study Resources (Revision, Application, Admit Card, Mock Test)
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
  // Training Course Settings (admin editable)
  trainingCourseFee: number;
  trainingCourseName: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<Settings>({
    examPackagePrice: 1000,
    totalMockTests: 2,
    totalChapters: 11,
    additionalTestPrice: 100,
    // Training Course defaults
    trainingCourseFee: 5900,
    trainingCourseName: "MahaRERA Agent Training Course",
  });
  const [upiDetails, setUpiDetails] = useState({
    upiId: "vaishkamath@oksbi",
    upiName: "Vaishali Kamath",
  });
  const [paymentStatus, setPaymentStatus] =
    useState<"NONE" | "PENDING" | "REJECTED" | "APPROVED">("NONE");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    // Load UPI settings
    fetch("/api/public/upi?type=exam")
      .then((res) => res.json())
      .then((data) => setUpiDetails(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settingsRes = await fetch("/api/public/settings", { cache: "no-store" });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(prev => ({ ...prev, ...settingsData }));
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

  // Handle locked card click - show alert and redirect to payment
  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Please purchase the package to access this feature.");
    router.push("/payment?type=package");
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

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 1. JOIN MAHARERA TRAINING COURSE - ₹5,900 (Separate Product) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🎓</span>
                <div>
                  <h3 className="text-2xl font-bold">{settings.trainingCourseName || "MahaRERA Agent Training Course"}</h3>
                  <p className="text-green-200 text-sm">Become a Certified MahaRERA Real Estate Agent</p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">✓</span>
                  <span>20 Hours Training</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">✓</span>
                  <span>MahaRERA Approved</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">✓</span>
                  <span>Training Certificate</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">✓</span>
                  <span>Exam Guidance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">✓</span>
                  <span>Study Material</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">✓</span>
                  <span>Bilingual (EN + MR)</span>
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="tel:8850150878" className="flex items-center gap-1 text-green-200 hover:text-white">
                  📞 8850150878
                </a>
                <a href="tel:9699091086" className="flex items-center gap-1 text-green-200 hover:text-white">
                  📞 9699091086
                </a>
              </div>
            </div>

            {/* Right - Price & CTA */}
            <div className="bg-white/20 rounded-xl p-5 text-center min-w-[220px]">
              <p className="text-green-200 text-sm mb-1">Course Fee</p>
              <div className="text-4xl font-bold mb-0">
                ₹{(settings.trainingCourseFee || 5900).toLocaleString("en-IN")}/-
              </div>
              <p className="text-xs text-green-200 mb-4">(Inclusive of GST)</p>
              
              <Link
                href="/course/enroll"
                className="block w-full px-6 py-3 bg-yellow-400 text-yellow-900 rounded-lg font-bold hover:bg-yellow-300 transition mb-2"
              >
                🎓 Enroll Now
              </Link>
              <Link
                href="/course/details"
                className="block w-full px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition text-sm"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 2. STUDY RESOURCES - ₹1000 Package (Revision, Application, Admit Card, Mock Test) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">📚 Study & Practice Resources</h3>
            <div className="text-right">
              <span className="text-purple-200 text-sm">Package Price</span>
              <span className="block text-2xl font-bold">₹{settings.examPackagePrice}/-</span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {/* 2a. Revision Center */}
            <div className={`bg-white/20 rounded-lg p-5 text-center transition-colors ${hasPremium ? 'hover:bg-white/30' : 'opacity-80'}`}>
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
                <p className="text-yellow-200 text-sm">⏳ Awaiting Approval</p>
              ) : (
                <button
                  onClick={handleLockedClick}
                  className="inline-block px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold cursor-not-allowed"
                >
                  🔒 Locked
                </button>
              )}
            </div>

            {/* 2b. Practice Application */}
            <div className={`bg-white/20 rounded-lg p-5 text-center transition-colors ${hasPremium ? 'hover:bg-white/30' : 'opacity-80'}`}>
              <div className="text-4xl mb-2">📋</div>
              <div className="font-semibold text-lg">Practice Application</div>
              <div className="text-sm opacity-90 mb-3">
                Fill form like real exam
              </div>

              {hasPremium ? (
                <Link
                  href="/exam/apply"
                  className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-300"
                >
                  Fill Application
                </Link>
              ) : paymentStatus === "PENDING" ? (
                <p className="text-yellow-200 text-sm">⏳ Awaiting Approval</p>
              ) : (
                <button
                  onClick={handleLockedClick}
                  className="inline-block px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold cursor-not-allowed"
                >
                  🔒 Locked
                </button>
              )}
            </div>

            {/* 2c. Admit Card (MOVED BEFORE MOCK TEST) */}
            <div className={`bg-white/20 rounded-lg p-5 text-center transition-colors ${hasPremium ? 'hover:bg-white/30' : 'opacity-80'}`}>
              <div className="text-4xl mb-2">🎫</div>
              <div className="font-semibold text-lg">Admit Card</div>
              <div className="text-sm opacity-90 mb-3">
                View status & hall ticket
              </div>

              {hasPremium ? (
                <Link
                  href="/exam/status"
                  className="inline-block px-4 py-2 bg-white/30 text-white rounded-lg font-semibold hover:bg-white/40"
                >
                  Check Status
                </Link>
              ) : paymentStatus === "PENDING" ? (
                <p className="text-yellow-200 text-sm">⏳ Awaiting Approval</p>
              ) : (
                <button
                  onClick={handleLockedClick}
                  className="inline-block px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold cursor-not-allowed"
                >
                  🔒 Locked
                </button>
              )}
            </div>

            {/* 2d. Mock Tests (MOVED AFTER ADMIT CARD) */}
            <div className={`bg-white/20 rounded-lg p-5 text-center transition-colors ${hasPremium && testsRemaining > 0 ? 'hover:bg-white/30' : 'opacity-80'}`}>
              <div className="text-4xl mb-2">📝</div>
              <div className="font-semibold text-lg">Mock Tests</div>
              <div className="text-sm opacity-90 mb-3">
                {hasPremium ? `${testsRemaining}/${settings.totalMockTests} Tests Left` : `${settings.totalMockTests} Tests`}
              </div>

              {hasPremium && testsRemaining > 0 ? (
                <Link
                  href="/mock-test"
                  className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-300"
                >
                  Start Test
                </Link>
              ) : hasPremium && testsRemaining <= 0 ? (
                <button
                  onClick={() => router.push("/payment?type=additional")}
                  className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                >
                  Buy More
                </button>
              ) : paymentStatus === "PENDING" ? (
                <p className="text-yellow-200 text-sm">⏳ Awaiting Approval</p>
              ) : (
                <button
                  onClick={handleLockedClick}
                  className="inline-block px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold cursor-not-allowed"
                >
                  🔒 Locked
                </button>
              )}
            </div>
          </div>

          {/* Buy Package Button (if not purchased) */}
          {!hasPremium && paymentStatus !== "PENDING" && (
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push("/payment?type=package")}
                className="px-8 py-3 bg-yellow-400 text-yellow-900 rounded-lg font-bold hover:bg-yellow-300 transition text-lg"
              >
                🛒 Buy Package - ₹{settings.examPackagePrice}/- + 30 Days Free CRM
              </button>
            </div>
          )}

          {paymentStatus === "PENDING" && !hasPremium && (
            <div className="mt-4 text-center">
              <p className="text-yellow-200">⏳ Your payment is pending admin approval...</p>
            </div>
          )}

          {needsAdditionalTest && (
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push("/payment?type=additional")}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Buy Additional Test - ₹{settings.additionalTestPrice}/-
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* USER INFO & STATS + REFER & EARN */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Your Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Status</h4>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Package Status</span>
                {hasPremium ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                    ✓ Premium Active
                  </span>
                ) : paymentStatus === "PENDING" ? (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold text-sm">
                    ⏳ Pending
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold text-sm">
                    ✗ Not Purchased
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mock Tests</span>
                <span className="text-2xl font-bold text-blue-600">
                  {hasPremium ? testsRemaining : 0}/{settings.totalMockTests}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tests Completed</span>
                <span className="text-lg font-semibold text-gray-800">{testsCompleted}</span>
              </div>
            </div>
          </div>

          {/* REFER & EARN CARD */}
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
            <h4 className="text-lg font-semibold mb-4">🎁 Refer and Earn</h4>

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
                  {copied ? "✓ Copied!" : "Copy"}
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

            <a
              href={getWhatsAppShareLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              📲 Share on WhatsApp
            </a>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* QUICK LINKS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
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