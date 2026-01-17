"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    referredBy: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get referral code once
  const [refCode, setRefCode] = useState("");

  // Pick referral code from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      console.log("Referral from URL:", ref);

      if (ref && ref.trim() !== "") {
        const code = ref.toUpperCase();
        setRefCode(code);
        setFormData((prev) => ({
          ...prev,
          referredBy: code,
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          referredBy: formData.referredBy || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        alert("Registration successful! Please login.");
        router.push("/login");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-blue-800">Create Account</h1>
        <p className="text-gray-500 text-sm">MahaRERA Mock Test Platform</p>
      </div>

      {refCode && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm text-center">
          🎁 Referral <strong>{refCode.toUpperCase()}</strong> applied!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">
            Full Name *
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">
            Email *
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">
            Mobile *
          </label>
          <input
            type="tel"
            pattern="[0-9]{10}"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-600">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 text-sm"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                className="absolute right-2 top-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-gray-600">
              Confirm *
            </label>
            <div className="relative">
              <input
                type={showPassword2 ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 text-sm"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
              <button
                type="button"
                className="absolute right-2 top-2"
                onClick={() => setShowPassword2(!showPassword2)}
              >
                {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">
            Referral Code
          </label>
          <input
            type="text"
            readOnly={!!refCode}
            className={`w-full border rounded-lg px-3 py-2 text-sm ${
              formData.referredBy
                ? "border-green-400 bg-green-50"
                : "border-gray-300"
            } ${refCode ? "cursor-not-allowed" : ""}`}
            value={formData.referredBy}
            placeholder="Optional"
            onChange={(e) =>
              setFormData({
                ...formData,
                referredBy: e.target.value.toUpperCase(),
              })
            }
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-gray-500">
        Already registered?{" "}
        <Link href="/login" className="text-blue-600 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 p-4">
      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
            Loading...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
