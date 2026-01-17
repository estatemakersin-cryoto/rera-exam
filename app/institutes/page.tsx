// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC INSTITUTES PAGE
// app/institutes/page.tsx
// Browse MahaRERA certified training institutes
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
  city: string | null;
  isOnline: boolean;
}

interface Institute {
  id: string;
  name: string;
  code: string;
  city: string | null;
  contactPhone: string | null;
  branches: Branch[];
  _count: {
    batches: number;
    students: number;
  };
}

export default function InstitutesPage() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    loadInstitutes();
  }, []);

  const loadInstitutes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/institutes");
      if (res.ok) {
        const data = await res.json();
        setInstitutes(data.institutes || []);

        // Extract unique cities
        const allCities = new Set<string>();
        data.institutes?.forEach((inst: Institute) => {
          if (inst.city) allCities.add(inst.city);
          inst.branches?.forEach((b: Branch) => {
            if (b.city) allCities.add(b.city);
          });
        });
        setCities(Array.from(allCities).sort());
      }
    } catch (error) {
      console.error("Failed to load institutes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstitutes = institutes.filter((inst) => {
    if (!cityFilter) return true;
    if (inst.city === cityFilter) return true;
    return inst.branches?.some((b) => b.city === cityFilter);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              MahaRERA Certified Training Institutes
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find authorized institutes for MahaRERA Agent certification training
            </p>

            {/* City Filter */}
            <div className="max-w-md mx-auto">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Institutes List */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading institutes...</p>
          </div>
        ) : filteredInstitutes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No Institutes Found
            </h2>
            <p className="text-gray-500">
              {cityFilter
                ? `No institutes available in ${cityFilter}`
                : "No institutes registered yet"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstitutes.map((institute) => (
              <div
                key={institute.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Header */}
                <div className="bg-blue-600 text-white p-4">
                  <h3 className="text-lg font-bold">{institute.name}</h3>
                  <p className="text-blue-200 text-sm">Code: {institute.code}</p>
                </div>

                {/* Body */}
                <div className="p-4">
                  {/* Location */}
                  {institute.city && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span>{institute.city}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {institute.branches?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Branches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {institute._count?.batches || 0}
                      </div>
                      <div className="text-xs text-gray-500">Batches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {institute._count?.students || 0}
                      </div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                  </div>

                  {/* Branches */}
                  {institute.branches && institute.branches.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Available at:</p>
                      <div className="flex flex-wrap gap-1">
                        {institute.branches.slice(0, 3).map((branch) => (
                          <span
                            key={branch.id}
                            className={`text-xs px-2 py-1 rounded ${
                              branch.isOnline
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {branch.isOnline ? "🌐 " : "📍 "}
                            {branch.city || branch.name}
                          </span>
                        ))}
                        {institute.branches.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">
                            +{institute.branches.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {institute.contactPhone && (
                    <a
                      href={`tel:${institute.contactPhone}`}
                      className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      📞 {institute.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to become a certified MahaRERA agent?
          </p>
          <Link
            href="/agent-guide"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            View Complete Guide →
          </Link>
        </div>
      </div>
    </div>
  );
}