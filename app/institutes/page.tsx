// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/institutes/page.tsx
// Institutes Directory - List all verified training institutes
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UpcomingBatch {
  id: string;
  name: string;
  mode: "ONLINE" | "OFFLINE";
  startDate: string;
  fee: number;
  city: string | null;
  seatsAvailable: number;
}

interface Institute {
  id: string;
  name: string;
  code: string;
  description: string | null;
  city: string | null;
  state: string;
  address: string | null;
  contactPhone: string;
  contactEmail: string | null;
  logo: string | null;
  primaryColor: string;
  branchCount: number;
  upcomingBatchCount: number;
  upcomingBatches: UpcomingBatch[];
  hasOnlineBatches: boolean;
  hasOfflineBatches: boolean;
}

export default function InstitutesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInstitutes();
  }, []);

  const loadInstitutes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/institutes");

      if (!res.ok) {
        throw new Error("Failed to load institutes");
      }

      const data = await res.json();
      setInstitutes(data.institutes || []);
      setCities(data.cities || []);
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

  // Filter institutes
  const filteredInstitutes = institutes.filter((institute) => {
    // City filter
    if (selectedCity && institute.city !== selectedCity) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        institute.name.toLowerCase().includes(search) ||
        institute.city?.toLowerCase().includes(search) ||
        institute.description?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Institutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/dashboard"
            className="text-blue-200 hover:text-white text-sm mb-2 inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">🏛️ Training Institutes</h1>
          <p className="text-blue-200 mt-2">
            Verified MahaRERA training partners across Maharashtra
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search institute name or city..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* City Filter */}
            <div className="md:w-48">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredInstitutes.length} of {institutes.length} institutes
          </div>
        </div>

        {/* Institutes Grid */}
        {filteredInstitutes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Institutes Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCity
                ? "Try adjusting your search or filter"
                : "No verified training institutes available yet"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredInstitutes.map((institute) => (
              <div
                key={institute.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Institute Header */}
                <div
                  className="p-4"
                  style={{ backgroundColor: institute.primaryColor || "#1E40AF" }}
                >
                  <div className="flex items-center gap-3">
                    {institute.logo ? (
                      <img
                        src={institute.logo}
                        alt={institute.name}
                        className="w-12 h-12 rounded-lg bg-white object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-2xl">
                        🏛️
                      </div>
                    )}
                    <div className="flex-1 text-white">
                      <h3 className="font-bold text-lg">{institute.name}</h3>
                      <p className="text-sm opacity-90">
                        📍 {institute.city || "Maharashtra"}, {institute.state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Institute Body */}
                <div className="p-4">
                  {institute.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {institute.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-center flex-1">
                      <div className="text-xl font-bold text-blue-600">
                        {institute.upcomingBatchCount}
                      </div>
                      <div className="text-xs text-gray-600">Upcoming Batches</div>
                    </div>
                    <div className="bg-green-50 rounded-lg px-3 py-2 text-center flex-1">
                      <div className="text-xl font-bold text-green-600">
                        {institute.branchCount}
                      </div>
                      <div className="text-xs text-gray-600">Branches</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg px-3 py-2 text-center flex-1">
                      <div className="flex justify-center gap-1">
                        {institute.hasOfflineBatches && (
                          <span className="text-lg" title="Offline">🏢</span>
                        )}
                        {institute.hasOnlineBatches && (
                          <span className="text-lg" title="Online">🌐</span>
                        )}
                        {!institute.hasOfflineBatches && !institute.hasOnlineBatches && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Mode</div>
                    </div>
                  </div>

                  {/* Upcoming Batches Preview */}
                  {institute.upcomingBatches.length > 0 && (
                    <div className="border-t pt-3 mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Next Batch
                      </p>
                      <div className="bg-gray-50 rounded-lg p-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            📅 {formatDate(institute.upcomingBatches[0].startDate)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            institute.upcomingBatches[0].mode === "ONLINE"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {institute.upcomingBatches[0].mode}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs mt-1">
                          {institute.upcomingBatches[0].city || institute.city} • 
                          ₹{institute.upcomingBatches[0].fee.toLocaleString("en-IN")} • 
                          {institute.upcomingBatches[0].seatsAvailable} seats left
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/course/enroll?institute=${institute.id}`}
                      className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
                    >
                      View Batches
                    </Link>
                    <a
                      href={`https://wa.me/91${institute.contactPhone}?text=Hi, I want to know about MahaRERA training at ${institute.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                      title="WhatsApp"
                    >
                      💬
                    </a>
                    <a
                      href={`tel:${institute.contactPhone}`}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                      title="Call"
                    >
                      📞
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Want to Become a Training Partner?</h3>
          <p className="text-green-100 mb-4">
            Join our network of verified MahaRERA training institutes
          </p>
          <a
            href="https://wa.me/918850150878?text=Hi, I want to register my institute as a MahaRERA training partner"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50"
          >
            Register Your Institute →
          </a>
        </div>
      </main>
    </div>
  );
}