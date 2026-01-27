// ═══════════════════════════════════════════════════════════════════════════════
// FILE: app/exam/status/page.tsx
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic"

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  candidateName: string;
  mobile: string;
  email: string;
  panNumber: string;
  trainingInstitute: string;
  centrePreference1: string;
  rollNumber: string | null;
  seatNumber: string | null;
  submittedAt: string;
  photoUrl: string | null;
}

const STATUS_STEPS = [
  { status: "DRAFT", label: "Draft", labelMr: "मसुदा" },
  { status: "SUBMITTED", label: "Submitted", labelMr: "सबमिट केले" },
  { status: "APPROVED", label: "Approved", labelMr: "मंजूर" },
  { status: "ADMIT_CARD_ISSUED", label: "Admit Card Issued", labelMr: "प्रवेशपत्र जारी" },
  { status: "APPEARED", label: "Exam Completed", labelMr: "परीक्षा पूर्ण" },
  { status: "PASSED", label: "Passed", labelMr: "उत्तीर्ण" },
];

export default function ApplicationStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams.get("id");
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    } else {
      fetchLatestApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/exam/status?id=${applicationId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }
      
      setApplication(data.application);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestApplication = async () => {
    try {
      const res = await fetch("/api/exam/apply");
      const data = await res.json();
      
      if (data.application) {
        setApplication(data.application);
      } else {
        setError("No application found");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string): number => {
    const idx = STATUS_STEPS.findIndex(s => s.status === status);
    // Handle FAILED status specially
    if (status === "FAILED" || status === "CERTIFICATE_ISSUED") {
      return STATUS_STEPS.length - 1;
    }
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Application Found</h2>
          <p className="text-gray-600 mb-6">{error || "You haven't submitted an application yet."}</p>
          <Link
            href="/exam/apply"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start New Application
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(application.status);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold text-xl">EM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Application Status</h1>
                <p className="text-sm text-blue-200">MahaRERA Agent Certification - Practice</p>
              </div>
            </div>
            <span className="text-sm bg-yellow-500 text-yellow-900 px-3 py-1 rounded font-medium">
              🎓 Practice Mode
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Banner */}
        {application.status === "ADMIT_CARD_ISSUED" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="font-bold text-green-800">Application Approved!</h3>
              <p className="text-green-700">
                Your admit card is ready. Download it and proceed to take the practice exam.
              </p>
            </div>
          </div>
        )}

        {/* Application Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-200">Application Number</p>
                <h2 className="text-2xl font-bold">{application.applicationNumber}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === "ADMIT_CARD_ISSUED" || application.status === "PASSED"
                    ? "bg-green-500"
                    : application.status === "FAILED" || application.status === "REJECTED"
                    ? "bg-red-500"
                    : "bg-yellow-500 text-yellow-900"
                }`}>
                  {application.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step.status} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx < currentStatusIndex
                          ? "bg-green-500 text-white"
                          : idx === currentStatusIndex
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {idx < currentStatusIndex ? "✓" : idx + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center max-w-[70px] ${
                      idx <= currentStatusIndex ? "text-blue-600 font-medium" : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`w-12 h-1 mx-1 ${
                      idx < currentStatusIndex ? "bg-green-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Application Details */}
          <div className="p-6">
            <div className="flex gap-6">
              {/* Photo */}
              <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {application.photoUrl ? (
                  <img 
                    src={application.photoUrl} 
                    alt="Candidate" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Photo
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Candidate Name</p>
                  <p className="font-medium">{application.candidateName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="font-medium">{application.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{application.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">PAN Number</p>
                  <p className="font-medium">{application.panNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Training Institute</p>
                  <p className="font-medium">{application.trainingInstitute}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exam Centre Preference</p>
                  <p className="font-medium">{application.centrePreference1}</p>
                </div>
                {application.rollNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-bold text-blue-600 text-lg">{application.rollNumber}</p>
                  </div>
                )}
                {application.seatNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Seat Number</p>
                    <p className="font-bold text-blue-600">{application.seatNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Download Admit Card */}
          {(application.status === "ADMIT_CARD_ISSUED" || 
            application.status === "APPEARED" ||
            application.status === "PASSED" ||
            application.status === "FAILED") && (
            <Link
              href={`/exam/admit-card?id=${application.id}`}
              className="flex items-center justify-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <span className="text-2xl">🎫</span>
              <div className="text-left">
                <p className="font-semibold">Download Admit Card</p>
                <p className="text-sm text-blue-200">View/Print your hall ticket</p>
              </div>
            </Link>
          )}

          {/* Take Practice Exam */}
          {application.status === "ADMIT_CARD_ISSUED" && (
            <Link
              href={`/exam/session?applicationId=${application.id}`}
              className="flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <span className="text-2xl">📝</span>
              <div className="text-left">
                <p className="font-semibold">Take Practice Exam</p>
                <p className="text-sm text-green-200">Start your 60-minute exam</p>
              </div>
            </Link>
          )}

          {/* View Result */}
          {(application.status === "PASSED" || application.status === "FAILED") && (
            <Link
              href={`/exam/result?id=${application.id}`}
              className="flex items-center justify-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <p className="font-semibold">View Result</p>
                <p className="text-sm text-purple-200">Check your scorecard</p>
              </div>
            </Link>
          )}

          {/* Download Certificate */}
          {application.status === "PASSED" && (
            <Link
              href={`/certificate/${application.id}`}
              className="flex items-center justify-center gap-3 p-4 bg-yellow-500 text-yellow-900 rounded-lg hover:bg-yellow-400 transition"
            >
              <span className="text-2xl">🏆</span>
              <div className="text-left">
                <p className="font-semibold">Download Certificate</p>
                <p className="text-sm">Practice completion certificate</p>
              </div>
            </Link>
          )}

          {/* Edit Draft */}
          {application.status === "DRAFT" && (
            <Link
              href="/exam/apply"
              className="flex items-center justify-center gap-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <span className="text-2xl">✏️</span>
              <div className="text-left">
                <p className="font-semibold">Continue Application</p>
                <p className="text-sm text-gray-300">Complete your draft</p>
              </div>
            </Link>
          )}
        </div>

        {/* Timeline / Activity Log */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4">Application Timeline</h3>
          <div className="space-y-4">
            {application.status !== "DRAFT" && (
              <TimelineItem
                icon="📤"
                title="Application Submitted"
                date={application.submittedAt}
                description={`Application ${application.applicationNumber} submitted successfully`}
              />
            )}
            {application.rollNumber && (
              <TimelineItem
                icon="✅"
                title="Application Approved"
                date={application.submittedAt}
                description={`Roll Number assigned: ${application.rollNumber}`}
              />
            )}
            {application.status === "ADMIT_CARD_ISSUED" && (
              <TimelineItem
                icon="🎫"
                title="Admit Card Generated"
                date={application.submittedAt}
                description="Your admit card is ready for download"
                isLatest
              />
            )}
          </div>
        </div>

        {/* Practice Mode Info */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🎓 Practice Mode Information</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This is a simulated application process for practice purposes</li>
            <li>• No actual MahaRERA registration is happening</li>
            <li>• The admit card and certificate are practice documents only</li>
            <li>• Use this to familiarize yourself with the real exam process</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function TimelineItem({ 
  icon, 
  title, 
  date, 
  description, 
  isLatest = false 
}: { 
  icon: string; 
  title: string; 
  date: string; 
  description: string; 
  isLatest?: boolean;
}) {
  return (
    <div className={`flex gap-4 ${isLatest ? "bg-blue-50 -mx-4 px-4 py-3 rounded-lg" : ""}`}>
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-800">{title}</h4>
          <span className="text-sm text-gray-500">
            {new Date(date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}