// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/course/enroll/page.tsx
// Course Enrollment Page - Select batch (Online/Offline) and proceed to payment
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Batch {
  id: string;
  name: string;
  description: string | null;
  mode: "ONLINE" | "OFFLINE";
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  fee: number;
  city: string | null;
  address: string | null;
  instituteName: string;
  instituteId: string;
  institutePhone: string | null;
  branchName: string | null;
  maxStudents: number;
  enrolledCount: number;
  seatsAvailable: number;
  isFull: boolean;
}

export default function CourseEnrollPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineBatches, setOnlineBatches] = useState<Batch[]>([]);
  const [offlineBatches, setOfflineBatches] = useState<Batch[]>([]);
  const [activeTab, setActiveTab] = useState<"ONLINE" | "OFFLINE">("OFFLINE");

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/batches");

      if (!res.ok) {
        throw new Error("Failed to load batches");
      }

      const data = await res.json();
      setOnlineBatches(data.onlineBatches || []);
      setOfflineBatches(data.offlineBatches || []);

      if (data.offlineBatches?.length > 0) {
        setActiveTab("OFFLINE");
      } else if (data.onlineBatches?.length > 0) {
        setActiveTab("ONLINE");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const handleEnroll = (batchId: string) => {
    router.push(`/course/payment?batchId=${batchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href="/course/details"
            className="text-green-200 hover:text-white text-sm mb-2 inline-flex items-center gap-1"
          >
            ← Back to Course Details
          </Link>
          <h1 className="text-3xl font-bold">MahaRERA Training Course</h1>
          <p className="text-green-200 mt-1">Select a batch to enroll</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">MahaRERA Agent Training Course</h2>
              <p className="text-gray-600 text-sm mt-1">
                20 Hours Training • Training Certificate • Study Material • Exam Guidance
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Course Fee</p>
              <p className="text-3xl font-bold text-green-600">₹5,900/-</p>
              <p className="text-xs text-gray-500">(₹5,000 + 18% GST)</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("OFFLINE")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "OFFLINE"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow"
            }`}
          >
            🏢 Offline Batches ({offlineBatches.length})
          </button>
          <button
            onClick={() => setActiveTab("ONLINE")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "ONLINE"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-100 shadow"
            }`}
          >
            🌐 Online Batches ({onlineBatches.length})
          </button>
        </div>

        {activeTab === "ONLINE" && (
          <div>
            {onlineBatches.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Online Batches Available</h3>
                <p className="text-gray-600 mb-4">Online batches will be announced soon.</p>
                <a
                  href="https://wa.me/918850150878?text=Hi, I want to know about upcoming online MahaRERA training batches"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  💬 Contact for Online Batches
                </a>
              </div>
            ) : (
              <div className="grid gap-4">
                {onlineBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                            🌐 ONLINE
                          </span>
                          {batch.isFull && (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">FULL</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{batch.instituteName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>📅 {formatDateRange(batch.startDate, batch.endDate)}</p>
                          {batch.startTime && batch.endTime && <p>⏰ {batch.startTime} - {batch.endTime}</p>}
                          <p>👥 {batch.seatsAvailable} seats available</p>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-2xl font-bold text-green-600">₹{batch.fee.toLocaleString("en-IN")}/-</p>
                        <button
                          onClick={() => handleEnroll(batch.id)}
                          disabled={batch.isFull}
                          className={`mt-3 px-6 py-2 rounded-lg font-semibold transition-all ${
                            batch.isFull
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          }`}
                        >
                          {batch.isFull ? "Batch Full" : "Enroll Now →"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "OFFLINE" && (
          <div>
            {offlineBatches.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Offline Batches Available</h3>
                <p className="text-gray-600 mb-4">New batches will be announced soon.</p>
                <a
                  href="https://wa.me/918850150878?text=Hi, I want to know about upcoming offline MahaRERA training batches"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  💬 Contact for Batches
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Institute</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Seats</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {offlineBatches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800">{batch.instituteName}</p>
                            {batch.branchName && <p className="text-xs text-gray-500">{batch.branchName}</p>}
                          </td>
                          <td className="px-6 py-4 text-gray-700">{batch.city || "-"}</td>
                          <td className="px-6 py-4 text-gray-700">{formatDateRange(batch.startDate, batch.endDate)}</td>
                          <td className="px-6 py-4 text-gray-700">
                            {batch.startTime && batch.endTime ? `${batch.startTime} - ${batch.endTime}` : "-"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {batch.isFull ? (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Full</span>
                            ) : (
                              <span className="text-sm text-gray-600">{batch.seatsAvailable}/{batch.maxStudents}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEnroll(batch.id)}
                              disabled={batch.isFull}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                                batch.isFull
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                            >
                              {batch.isFull ? "Full" : "Enroll →"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-gray-100">
                  {offlineBatches.map((batch) => (
                    <div key={batch.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{batch.instituteName}</h3>
                          <p className="text-sm text-gray-500">📍 {batch.city || "Location TBA"}</p>
                        </div>
                        {batch.isFull && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Full</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <p>📅 {formatDateRange(batch.startDate, batch.endDate)}</p>
                        {batch.startTime && batch.endTime && <p>⏰ {batch.startTime} - {batch.endTime}</p>}
                        <p>👥 {batch.seatsAvailable} seats available</p>
                      </div>
                      <button
                        onClick={() => handleEnroll(batch.id)}
                        disabled={batch.isFull}
                        className={`w-full py-2 rounded-lg font-semibold text-sm ${
                          batch.isFull
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {batch.isFull ? "Batch Full" : "Enroll Now →"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800">Need Help Choosing?</h3>
              <p className="text-sm text-gray-600">Contact us for guidance on selecting the right batch</p>
            </div>
            <div className="flex gap-3">
              <a href="tel:8850150878" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                📞 8850150878
              </a>
              <a href="https://wa.me/918850150878" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}