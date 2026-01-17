// ══════════════════════════════════════════════════════════════════════════════
// BATCH STUDENTS PAGE
// app/institute/batches/[id]/students/page.tsx
// View students enrolled in a specific batch
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  status: string;
  appliedAt: string;
  enrolledAt: string | null;
  user: {
    fullName: string;
    mobile: string | null;
    email: string | null;
  };
}

interface BatchInfo {
  id: string;
  name: string;
  mode: string;
  startDate: string;
  endDate: string;
  fee: number;
  maxStudents: number;
  meetingLink: string | null;
  branch: {
    name: string;
    city: string | null;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-yellow-100 text-yellow-700",
  ENROLLED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  DROPPED: "bg-red-100 text-red-700",
};

export default function BatchStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;

  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (batchId) {
      loadBatchStudents();
    }
  }, [batchId]);

  const loadBatchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/institute/batches/${batchId}/students`);

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load batch students");
      }

      const data = await res.json();
      setBatch(data.batch);
      setStudents(data.students || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (studentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/institute/students/${studentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      loadBatchStudents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Batch not found
        </div>
      </div>
    );
  }

  const enrolledCount = students.filter((s) => s.status === "ENROLLED" || s.status === "COMPLETED").length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/institute/batches"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{batch.name}</h1>
            <p className="text-gray-500 text-sm">
              {batch.branch?.name || "No branch"} •{" "}
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  batch.mode === "ONLINE"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {batch.mode}
              </span>
            </p>
          </div>
        </div>

        {/* Batch Info Card */}
        <div className="bg-white rounded-lg shadow p-4 grid sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-medium text-gray-800">
              {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fee</p>
            <p className="font-medium text-blue-600">{formatCurrency(batch.fee)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Seats</p>
            <p className="font-medium text-gray-800">
              {enrolledCount} / {batch.maxStudents}
              {enrolledCount >= batch.maxStudents && (
                <span className="ml-2 text-xs text-red-600">FULL</span>
              )}
            </p>
          </div>
          {batch.mode === "ONLINE" && batch.meetingLink && (
            <div>
              <p className="text-xs text-gray-500">Meeting Link</p>
              <a
                href={batch.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm truncate block"
              >
                Open Meeting →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Students ({students.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applied
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No students enrolled in this batch yet
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {student.user.fullName}
                      </p>
                      {student.user.mobile && (
                        <p className="text-sm text-gray-500">
                          📱 {student.user.mobile}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          STATUS_COLORS[student.status] || "bg-gray-100"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(student.appliedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {student.status === "APPLIED" && (
                          <button
                            onClick={() => updateStatus(student.id, "ENROLLED")}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Approve
                          </button>
                        )}
                        {student.status === "ENROLLED" && (
                          <button
                            onClick={() => updateStatus(student.id, "COMPLETED")}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Complete
                          </button>
                        )}
                        <a
                          href={`https://wa.me/91${student.user.mobile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 p-1"
                          title="WhatsApp"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
