// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT: InstitutesPreview
// components/dashboard/InstitutesPreview.tsx
// Shows preview of training institutes on user dashboard
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Institute {
  id: string;
  name: string;
  city: string | null;
  logo: string | null;
  primaryColor: string;
  upcomingBatchCount: number;
  hasOnlineBatches: boolean;
  hasOfflineBatches: boolean;
}

export default function InstitutesPreview() {
  const [loading, setLoading] = useState(true);
  const [institutes, setInstitutes] = useState<Institute[]>([]);

  useEffect(() => {
    loadInstitutes();
  }, []);

  const loadInstitutes = async () => {
    try {
      const res = await fetch("/api/public/institutes?limit=4");
      if (res.ok) {
        const data = await res.json();
        setInstitutes(data.institutes || []);
      }
    } catch (err) {
      console.error("Error loading institutes:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">🏛️ Training Institutes</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (institutes.length === 0) {
    return null; // Don't show section if no institutes
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">🏛️ Training Institutes</h2>
        <Link
          href="/institutes"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        Verified MahaRERA training partners with upcoming batches
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {institutes.map((institute) => (
          <Link
            key={institute.id}
            href={`/course/enroll?institute=${institute.id}`}
            className="group"
          >
            <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all">
              {/* Logo/Icon */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 mx-auto"
                style={{ backgroundColor: (institute.primaryColor || "#1E40AF") + "20" }}
              >
                {institute.logo ? (
                  <img
                    src={institute.logo}
                    alt={institute.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-2xl">🏛️</span>
                )}
              </div>

              {/* Name */}
              <h3 className="font-semibold text-gray-800 text-sm text-center truncate group-hover:text-blue-600">
                {institute.name}
              </h3>

              {/* City */}
              <p className="text-xs text-gray-500 text-center truncate">
                📍 {institute.city || "Maharashtra"}
              </p>

              {/* Batch count */}
              {institute.upcomingBatchCount > 0 && (
                <p className="text-xs text-green-600 text-center mt-1 font-medium">
                  {institute.upcomingBatchCount} batch{institute.upcomingBatchCount > 1 ? "es" : ""}
                </p>
              )}

              {/* Mode badges */}
              <div className="flex justify-center gap-1 mt-1">
                {institute.hasOfflineBatches && (
                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                    🏢
                  </span>
                )}
                {institute.hasOnlineBatches && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                    🌐
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4 text-center">
        <Link
          href="/course/enroll"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Browse All Batches →
        </Link>
      </div>
    </div>
  );
}