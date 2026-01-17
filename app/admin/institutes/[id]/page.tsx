// ══════════════════════════════════════════════════════════════════════════════
// ADMIN INSTITUTE DETAIL PAGE
// app/admin/institutes/[id]/page.tsx
// View institute details + manage branches
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Branch {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  isHeadOffice: boolean;
  isOnline: boolean;
  isActive: boolean;
  validUntil: string | null;
  subscriptionFee: number | null;
  _count: {
    batches: number;
    students: number;
  };
}

interface Institute {
  id: string;
  name: string;
  code: string;
  description: string | null;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string | null;
  city: string | null;
  isActive: boolean;
  validUntil: string | null;
  createdAt: string;
  branches: Branch[];
  _count: {
    batches: number;
    students: number;
  };
}

export default function AdminInstituteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const instituteId = params.id as string;

  const [institute, setInstitute] = useState<Institute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Branch Modal
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: "",
    city: "",
    address: "",
    contactPerson: "",
    contactPhone: "",
    isOnline: false,
    subscriptionFee: 5000,
    validMonths: 12,
  });

  useEffect(() => {
    loadInstitute();
  }, [instituteId]);

  const loadInstitute = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/institutes/${instituteId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load institute");
      }
      const data = await res.json();
      setInstitute(data.institute);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranch(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/institutes/${instituteId}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create branch");

      setSuccess("Branch created successfully!");
      setShowBranchModal(false);
      setBranchForm({
        name: "",
        city: "",
        address: "",
        contactPerson: "",
        contactPhone: "",
        isOnline: false,
        subscriptionFee: 5000,
        validMonths: 12,
      });
      loadInstitute();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingBranch(false);
    }
  };

  const toggleBranchStatus = async (branchId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/institutes/${instituteId}/branches/${branchId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");
      loadInstitute();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Institute...</p>
        </div>
      </div>
    );
  }

  if (!institute) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Institute not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin/institutes"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{institute.name}</h1>
            <p className="text-gray-500 font-mono text-sm">{institute.code}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {/* Institute Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Contact Person</p>
            <p className="font-medium">{institute.contactPerson}</p>
            <p className="text-sm text-gray-600">{institute.contactPhone}</p>
            {institute.contactEmail && (
              <p className="text-sm text-gray-600">{institute.contactEmail}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-block px-2 py-1 text-sm font-medium rounded ${
                institute.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {institute.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subscription Valid Until</p>
            <p className={`font-medium ${isExpired(institute.validUntil) ? "text-red-600" : ""}`}>
              {formatDate(institute.validUntil)}
              {isExpired(institute.validUntil) && " (Expired)"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stats</p>
            <p className="font-medium">
              {institute._count.batches} Batches • {institute._count.students} Students
            </p>
          </div>
        </div>
      </div>

      {/* Branches Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Branches ({institute.branches.length})
          </h2>
          <button
            onClick={() => setShowBranchModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Branch
          </button>
        </div>

        <div className="divide-y">
          {institute.branches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No branches found. Add the first branch.
            </div>
          ) : (
            institute.branches.map((branch) => (
              <div key={branch.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{branch.name}</span>
                      {branch.isHeadOffice && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          HQ
                        </span>
                      )}
                      {branch.isOnline && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          Online
                        </span>
                      )}
                      {!branch.isActive && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                      {branch.validUntil && isExpired(branch.validUntil) && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          Expired
                        </span>
                      )}
                    </div>
                    {branch.city && (
                      <p className="text-sm text-gray-600">
                        📍 {branch.city}
                        {branch.address && ` • ${branch.address}`}
                      </p>
                    )}
                    {branch.contactPerson && (
                      <p className="text-sm text-gray-500">
                        {branch.contactPerson}
                        {branch.contactPhone && ` • ${branch.contactPhone}`}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Fee: {formatCurrency(branch.subscriptionFee)}</span>
                      <span>Valid: {formatDate(branch.validUntil)}</span>
                      <span>{branch._count.batches} batches</span>
                      <span>{branch._count.students} students</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBranchStatus(branch.id, branch.isActive)}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        branch.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {branch.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Branch</h2>
                <button
                  onClick={() => setShowBranchModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddBranch} className="space-y-4">
                {/* Branch Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!branchForm.isOnline}
                        onChange={() => setBranchForm({ ...branchForm, isOnline: false })}
                        className="text-blue-600"
                      />
                      <span>Physical Location</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={branchForm.isOnline}
                        onChange={() => setBranchForm({ ...branchForm, isOnline: true })}
                        className="text-blue-600"
                      />
                      <span>Online Only</span>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={branchForm.isOnline ? "e.g., Evening Online" : "e.g., Thane Branch"}
                    required
                  />
                </div>

                {/* Physical Location Fields */}
                {!branchForm.isOnline && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={branchForm.city}
                        onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Thane"
                        required={!branchForm.isOnline}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={branchForm.address}
                        onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Full address"
                      />
                    </div>
                  </>
                )}

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={branchForm.contactPerson}
                      onChange={(e) => setBranchForm({ ...branchForm, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={branchForm.contactPhone}
                      onChange={(e) => setBranchForm({ ...branchForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Subscription */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={branchForm.subscriptionFee}
                      onChange={(e) => setBranchForm({ ...branchForm, subscriptionFee: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid For (Months)
                    </label>
                    <select
                      value={branchForm.validMonths}
                      onChange={(e) => setBranchForm({ ...branchForm, validMonths: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                      <option value={24}>24 Months</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBranchModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingBranch}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingBranch ? "Creating..." : "Create Branch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
