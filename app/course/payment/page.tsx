// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/course/payment/page.tsx
// Course Payment Page - Admission form + UPI payment for training course
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const ADMIN_WA_1 = "918850150878";
const ADMIN_WA_2 = "919699091086";
const UPI_MOBILE = "9699091086";

interface Batch {
  id: string;
  name: string;
  mode: "ONLINE" | "OFFLINE";
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  fee: number;
  city: string | null;
  instituteName: string;
  instituteId: string;
  seatsAvailable: number;
  isFull: boolean;
}

interface FormData {
  fullName: string;
  mobile: string;
  email: string;
  panNumber: string;
  transactionId: string;
  notes: string;
}

function CoursePaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batchId");

  const [upiDetails, setUpiDetails] = useState({
    upiId: "vaishkamath@oksbi",
    upiName: "Vaishali Kamath",
  });

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobile: "",
    email: "",
    panNumber: "",
    transactionId: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (!batchId) {
      router.push("/course/enroll");
      return;
    }
    loadBatchDetails();
    loadUserData();
  }, [batchId]);

  useEffect(() => {
    fetch("/api/public/upi?type=course")
      .then((res) => res.json())
      .then((data) => setUpiDetails(data))
      .catch(console.error);
  }, []);

  const loadBatchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/batches");
      
      if (!res.ok) {
        throw new Error("Failed to load batch details");
      }

      const data = await res.json();
      const selectedBatch = data.batches?.find((b: Batch) => b.id === batchId);
      
      if (!selectedBatch) {
        setError("Batch not found or no longer available");
        return;
      }

      if (selectedBatch.isFull) {
        setError("This batch is full. Please select another batch.");
        return;
      }

      setBatch(selectedBatch);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const res = await fetch("/api/auth/verify", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setFormData((prev) => ({
            ...prev,
            fullName: data.user.fullName || "",
            mobile: data.user.mobile || "",
            email: data.user.email || "",
          }));
        }
      }
    } catch {
      // User not logged in, continue with empty form
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Name is required";
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = "Name must be at least 3 characters";
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      errors.mobile = "Enter valid 10-digit mobile number";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Enter valid email address";
    }

    // PAN validation
    if (!formData.panNumber.trim()) {
      errors.panNumber = "PAN number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.trim().toUpperCase())) {
      errors.panNumber = "Enter valid PAN (e.g., ABCDE1234F)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.transactionId.trim()) {
      alert("Please enter UPI Transaction ID / Reference No.");
      return;
    }

    if (!batch) return;

    try {
      setSubmitting(true);

      const res = await fetch("/api/course/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: batch.id,
          fullName: formData.fullName.trim().toUpperCase(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim().toLowerCase(),
          panNumber: formData.panNumber.trim().toUpperCase(),
          transactionId: formData.transactionId.trim(),
          notes: formData.notes.trim(),
          amount: batch.fee,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enrollment");
      }

      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleWhatsAppClick = (waLink: string) => {
    window.open(waLink, "_blank");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error || "Batch Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            Please select a valid batch from the enrollment page.
          </p>
          <Link
            href="/course/enroll"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            ← Back to Batches
          </Link>
        </div>
      </div>
    );
  }

  // Success Screen
  if (success) {
    const msg =
      `🎓 MahaRERA Training Course Enrollment\n\n` +
      `Name: ${formData.fullName.toUpperCase()}\n` +
      `Mobile: ${formData.mobile}\n` +
      `Email: ${formData.email}\n` +
      `PAN: ${formData.panNumber.toUpperCase()}\n\n` +
      `Institute: ${batch.instituteName}\n` +
      `Batch Date: ${formatDate(batch.startDate)}\n` +
      `Mode: ${batch.mode}\n` +
      `Amount: ₹${batch.fee}\n` +
      `UPI Ref: ${formData.transactionId}\n\n` +
      `📎 Payment screenshot attached below 👇`;

    const wa1 = `https://wa.me/${ADMIN_WA_1}?text=${encodeURIComponent(msg)}`;
    const wa2 = `https://wa.me/${ADMIN_WA_2}?text=${encodeURIComponent(msg)}`;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white border-2 border-green-500 p-8 rounded-xl max-w-md text-center shadow-xl">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="font-bold text-2xl text-green-800 mb-2">
            Enrollment Submitted!
          </h2>

          <p className="text-gray-600 mb-6">
            Send your payment screenshot to admin for quick confirmation.
          </p>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleWhatsAppClick(wa1)}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
            >
              💬 Send to Admin 1 (8850150878)
            </button>

            <button
              onClick={() => handleWhatsAppClick(wa2)}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
            >
              💬 Send to Admin 2 (9699091086)
            </button>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800"
          >
            Go to Dashboard
          </button>

          <p className="text-xs text-gray-500 mt-4">
            💡 Tap 📎 in WhatsApp to attach your payment screenshot
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/course/enroll"
            className="text-green-200 hover:text-white text-sm mb-2 inline-flex items-center gap-1"
          >
            ← Back to Batches
          </Link>
          <h1 className="text-2xl font-bold">Course Enrollment</h1>
          <p className="text-green-200 mt-1">Complete your admission</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              1
            </div>
            <span className="font-medium">Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              2
            </div>
            <span className="font-medium">Payment</span>
          </div>
        </div>

        {/* Batch Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border-l-4 border-green-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  batch.mode === "ONLINE"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {batch.mode}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{batch.instituteName}</h3>
              <div className="mt-1 text-sm text-gray-600 space-y-0.5">
                {batch.city && <p>📍 {batch.city}</p>}
                <p>📅 {formatDate(batch.startDate)}</p>
                {batch.startTime && batch.endTime && (
                  <p>⏰ {batch.startTime} - {batch.endTime}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Course Fee</p>
              <p className="text-3xl font-bold text-green-600">₹{batch.fee.toLocaleString("en-IN")}/-</p>
            </div>
          </div>
        </div>

        {/* Step 1: Admission Form */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">📋 Admission Details</h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name (as per PAN Card) *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
                  placeholder="RAHUL SHARMA"
                  className={`w-full border rounded-lg px-4 py-3 text-sm uppercase ${
                    formErrors.fullName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="9876543210"
                  className={`w-full border rounded-lg px-4 py-3 text-sm ${
                    formErrors.mobile ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                />
                {formErrors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.mobile}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className={`w-full border rounded-lg px-4 py-3 text-sm ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* PAN Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number *
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase().slice(0, 10) })}
                  placeholder="ABCDE1234F"
                  className={`w-full border rounded-lg px-4 py-3 text-sm uppercase ${
                    formErrors.panNumber ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                />
                {formErrors.panNumber && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.panNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  PAN is required for MahaRERA registration
                </p>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors mt-4"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Admission Summary */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Admission Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">Name:</p>
                <p className="font-medium text-gray-800">{formData.fullName}</p>
                <p className="text-gray-600">Mobile:</p>
                <p className="font-medium text-gray-800">{formData.mobile}</p>
                <p className="text-gray-600">Email:</p>
                <p className="font-medium text-gray-800">{formData.email}</p>
                <p className="text-gray-600">PAN:</p>
                <p className="font-medium text-gray-800">{formData.panNumber}</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-green-600 text-sm font-medium mt-2 hover:underline"
              >
                ← Edit Details
              </button>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">💳 Payment</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* QR Code */}
                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                  <p className="font-semibold mb-3">Scan & Pay</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `upi://pay?pa=${upiDetails.upiId}&pn=${upiDetails.upiName}&am=${batch.fee}&cu=INR`
                    )}`}
                    alt="UPI QR Code"
                    className="mx-auto w-48 h-48 object-contain border rounded-lg bg-white shadow"
                  />
                  <div className="text-sm text-gray-700 mt-3 space-y-1">
                    <p><strong>UPI:</strong> {upiDetails.upiId}</p>
                    <p><strong>Name:</strong> {upiDetails.upiName}</p>
                    <p className="text-xl font-bold text-green-600 mt-2">
                      ₹{batch.fee.toLocaleString("en-IN")}/-
                    </p>
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UPI Transaction ID / Reference No. *
                      </label>
                      <input
                        type="text"
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                        placeholder="e.g., 123456789012"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="GPay / PhonePe / Payment time / Any details"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[80px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {submitting ? "Submitting..." : "Submit Enrollment"}
                    </button>
                  </form>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <p className="font-medium mb-1">📌 Important:</p>
                    <ul className="list-disc pl-4 space-y-1 text-blue-700">
                      <li>Pay exact amount: ₹{batch.fee.toLocaleString("en-IN")}</li>
                      <li>Copy transaction ID from payment app</li>
                      <li>Send screenshot via WhatsApp after submission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CoursePaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <CoursePaymentContent />
    </Suspense>
  );
}