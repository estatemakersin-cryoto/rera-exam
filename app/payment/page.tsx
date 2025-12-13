"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_WA_1 = "918850150878";
const ADMIN_WA_2 = "919699091086";

const UPI_ID = "vaishkamath@oksbi";
const UPI_NAME = "Vaishali Kamath";
const UPI_MOBILE = "9699091086";

export default function PaymentPage() {
  const router = useRouter();

  // STATES
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // PLAN — only one
  const amount = 750;

  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");

  // LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/verify", { cache: "no-store" });
        if (!res.ok) return router.push("/login");

        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [router]);

  // FORM SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      alert("Please enter UPI Transaction ID / Reference No.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to submit payment.");
        return;
      }

      // Show the success screen
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // LOADING STATE
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // =======================
  // 🎉 SUCCESS SCREEN
  // =======================
  if (success) {
    const msg =
      `Payment submitted for EstateMakers MahaRERA ₹750 Plan:\n\n` +
      `Name: ${user?.fullName}\n` +
      `Mobile: ${user?.mobile}\n` +
      `Plan: Premium – ₹750\n` +
      `Amount: ₹${amount}\n` +
      `UPI Ref: ${transactionId}\n\n` +
      `Please verify and activate.`;

    const wa1 = `https://wa.me/${ADMIN_WA_1}?text=${encodeURIComponent(msg)}`;
    const wa2 = `https://wa.me/${ADMIN_WA_2}?text=${encodeURIComponent(msg)}`;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-green-100 border border-green-500 p-6 rounded-lg max-w-md text-center shadow">
          <h2 className="font-bold text-xl text-green-800 mb-2">
            Payment Submitted Successfully! ✅
          </h2>

          <p className="text-green-700 text-sm mb-4">
            Send your payment screenshot to admin for quick activation.
          </p>

          <a
            href={wa1}
            target="_blank"
            className="block w-full px-4 py-2 mb-3 bg-blue-600 text-white rounded"
          >
            📤 Send to Admin 1 (8850150878)
          </a>

          <a
            href={wa2}
            target="_blank"
            className="block w-full px-4 py-2 mb-3 bg-blue-600 text-white rounded"
          >
            📤 Send to Admin 2 (9699091086)
          </a>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // =======================
  // MAIN PAYMENT PAGE
  // =======================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-blue-900 text-white px-6 py-4 shadow">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">
            Buy MahaRERA Premium Plan (₹750)
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm bg-blue-700 px-4 py-2 rounded hover:bg-blue-600"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* UPI PAYMENT SECTION */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">
            Step 1: Pay using UPI / QR
          </h2>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-gray-50 text-center">
                <p className="font-semibold mb-2">Scan & Pay</p>

                <img
                  src="/vaishali-qr.png"
                  alt="UPI QR"
                  className="mx-auto w-48 h-48 object-contain border rounded-lg bg-white shadow"
                />

                <div className="text-sm text-gray-700 mt-3">
                  <p><strong>UPI Name:</strong> {UPI_NAME}</p>
                  <p><strong>UPI ID:</strong> {UPI_ID}</p>
                  <p><strong>Mobile:</strong> {UPI_MOBILE}</p>
                  <p><strong>Amount:</strong> ₹{amount}</p>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Make sure you pay the exact amount before submitting the form.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">Important:</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Complete payment first through your UPI app.</li>
                <li>Copy the UPI Reference / Transaction ID.</li>
                <li>Submit below to activate your account.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SUBMISSION FORM */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">
            Step 2: Submit Payment Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Selected
              </label>
              <input
                type="text"
                disabled
                value="Premium Plan – ₹750"
                className="w-full border rounded px-3 py-2 bg-gray-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid (₹)
              </label>
              <input
                type="number"
                disabled
                value={amount}
                className="w-full border rounded px-3 py-2 bg-gray-100 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI Transaction / Reference ID *
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. UTRXXXXXXXXX"
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any extra info (GPay, Paytm, time, etc.)"
                className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {submitting ? "Submitting..." : "Submit Payment Details"}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              After verification, your Premium Plan (₹750) will be activated.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
