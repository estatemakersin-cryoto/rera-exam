"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function MockTestEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    
    try {
      const res = await fetch("/api/mock-test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start mock test");
      }

      const data = await res.json();
      router.push(`/mock-test/attempt/${data.attemptId}`);
    } catch (error) {
      console.error("Mock test start error:", error);
      alert("Failed to start test. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MahaRERA Mock Test</h1>
          <p className="text-sm text-gray-600">Real Estate Regulatory Authority</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Registration Number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter Registration Number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter Password"
            />
          </div>

          <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <p className="font-semibold mb-2 text-blue-900">📌 Important Instructions</p>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li>• Total Questions: 50</li>
              <li>• Duration: 60 Minutes</li>
              <li>• No negative marking</li>
              <li>• Do not refresh or close the browser during the test</li>
              <li>• Answers can be changed anytime before submission</li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {loading ? "Starting Test..." : "Start Mock Test"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">© 2025 MahaRERA. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}