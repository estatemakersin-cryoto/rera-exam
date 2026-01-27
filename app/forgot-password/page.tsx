// app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetUrl("");
    setSuccess(false);
    setLoading(true);

    if (mobile.length !== 10) {
      setError("Enter valid 10-digit mobile number");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
        setResetUrl(data.resetUrl);
        setUserName(data.userName || "");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetClick = () => {
    if (resetUrl) {
      // Extract token from URL and navigate directly
      const tokenMatch = resetUrl.match(/token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        router.push(`/reset-password?token=${tokenMatch[1]}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your registered mobile number to reset your password.
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* MOBILE */}
            <div>
              <label className="block mb-1 font-medium">Mobile Number</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <span className="text-gray-500 mr-2">+91</span>
                <input
                  type="number"
                  className="w-full outline-none"
                  placeholder="Enter 10-digit mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.slice(0, 10))}
                />
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Mobile Number"}
            </button>
          </form>
        ) : (
          /* SUCCESS STATE - SHOW RESET BUTTON */
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Mobile Verified!</h3>
            
            {userName && (
              <p className="text-gray-600 mb-4">
                Welcome back, <span className="font-semibold">{userName}</span>
              </p>
            )}

            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              Click below to set your new password.
            </div>

            <button
              onClick={handleResetClick}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 mb-4"
            >
              Reset Password Now
            </button>

            <p className="text-gray-500 text-sm mb-4">
              Link expires in 15 minutes.
            </p>

            <Link
              href="/login"
              className="inline-block text-blue-600 hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        )}

        {!success && (
          <div className="mt-6 text-center">
            <Link href="/login" className="text-blue-600 hover:underline">
              ← Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}