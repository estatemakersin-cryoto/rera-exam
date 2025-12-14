"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MockTestEntryPage() {
  const router = useRouter();
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!rollNo) {
      alert("Please enter registration number to continue");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/mock-test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start mock test");
      }
      
      const data = await res.json();
      router.push(`/mock-test/attempt/${data.attemptId}`);
      
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to start test";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">
          MahaRERA Mock Test
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Registration Number
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter MahaRERA Exam Registration No"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter MahaRERA Exam Password"
            />
          </div>

          <div className="mt-4 p-3 border rounded bg-gray-50 text-sm">
            <p className="font-semibold mb-1">📌 Important Instructions</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Total Questions: 50</li>
              <li>Duration: 60 Minutes</li>
              <li>No negative marking</li>
              <li>Do not refresh or close the browser</li>
              <li>Answers can be changed anytime before submit</li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full mt-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Starting..." : "Start Mock Test"}
          </button>
        </div>
      </div>
    </div>
  );
}