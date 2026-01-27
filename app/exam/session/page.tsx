// ═══════════════════════════════════════════════════════════════════════════════
// FILE: app/exam/session/page.tsx
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Application {
  id: string;
  applicationNumber: string;
  candidateName: string;
  rollNumber: string;
  seatNumber: string;
  photoUrl: string | null;
  status: string;
  testAttemptId: string | null;
}

export default function ExamSessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams.get("applicationId");
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [rollNumberInput, setRollNumberInput] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    } else {
      setLoading(false);
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/exam/status?id=${applicationId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }
      
      if (data.application.status !== "ADMIT_CARD_ISSUED") {
        if (data.application.status === "APPEARED" || 
            data.application.status === "PASSED" || 
            data.application.status === "FAILED") {
          throw new Error("You have already taken this exam. Check your results.");
        }
        throw new Error("Admit card not yet issued for this application");
      }
      
      setApplication(data.application);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyRollNumber = () => {
    if (!application) return;
    
    if (rollNumberInput.trim().toUpperCase() === application.rollNumber) {
      setVerified(true);
    } else {
      alert("Invalid Roll Number. Please check your admit card.");
    }
  };

  const startExam = async () => {
    if (!application) return;
    
    setStarting(true);
    try {
      const res = await fetch("/api/exam/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to start exam");
      }
      
      // Redirect to the exam attempt page (reusing mock test infrastructure)
      router.push(`/exam/attempt/${data.attemptId}`);
    } catch (err: any) {
      setError(err.message);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading exam session...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Cannot Start Exam</h2>
          <p className="text-gray-600 mb-6">{error || "Please check your application status."}</p>
          <Link
            href="/exam/status"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Check Application Status
          </Link>
        </div>
      </div>
    );
  }

  // Roll Number Verification Screen
  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MahaRERA Practice Exam</h1>
            <p className="text-gray-500">Real Estate Agent Certification</p>
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Practice Mode
            </span>
          </div>

          {/* Candidate Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden">
                {application.photoUrl ? (
                  <img 
                    src={application.photoUrl} 
                    alt="Candidate" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Photo
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{application.candidateName}</p>
                <p className="text-sm text-gray-500">Application: {application.applicationNumber}</p>
              </div>
            </div>
          </div>

          {/* Roll Number Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Your Roll Number
            </label>
            <input
              type="text"
              value={rollNumberInput}
              onChange={(e) => setRollNumberInput(e.target.value.toUpperCase())}
              placeholder="e.g., MR2025000001"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-xl font-mono tracking-wider focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
            <p className="text-xs text-gray-500 mt-2">
              Roll number is printed on your Admit Card
            </p>
          </div>

          <button
            onClick={verifyRollNumber}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Verify & Continue
          </button>

          <div className="mt-6 text-center">
            <Link href="/exam/admit-card" className="text-blue-600 hover:underline text-sm">
              View/Download Admit Card
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Exam Instructions & Start Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-blue-800 text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-800 font-bold text-xl">EM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">MahaRERA Practice Exam</h1>
              <p className="text-sm text-blue-200">Real Estate Agent Certification</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Roll Number</p>
            <p className="text-xl font-bold">{application.rollNumber}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Candidate Banner */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-24 bg-white rounded-lg overflow-hidden">
                {application.photoUrl ? (
                  <img 
                    src={application.photoUrl} 
                    alt="Candidate" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Photo
                  </div>
                )}
              </div>
              <div>
                <p className="text-green-200 text-sm">Welcome,</p>
                <h2 className="text-2xl font-bold">{application.candidateName}</h2>
                <p className="text-green-200">Seat No: {application.seatNumber}</p>
              </div>
              <div className="ml-auto text-right">
                <span className="inline-block px-4 py-2 bg-green-500 rounded-full text-sm font-medium">
                  ✓ Verified
                </span>
              </div>
            </div>
          </div>

          {/* Exam Details */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Examination Details</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">50</p>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">60</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">40%</p>
                <p className="text-sm text-gray-600">Passing</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">0</p>
                <p className="text-sm text-gray-600">Negative Marks</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                <span>⚠️</span> Important Instructions / महत्त्वाच्या सूचना
              </h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Total 50 multiple choice questions</li>
                  <li>✓ Each question has 4 options (A, B, C, D)</li>
                  <li>✓ Time limit: 60 minutes</li>
                  <li>✓ No negative marking</li>
                  <li>✓ Passing marks: 20 out of 50 (40%)</li>
                  <li>✓ You can mark questions for review</li>
                  <li>✓ You can change answers anytime before submission</li>
                  <li>⚠️ Exam will auto-submit after time expires</li>
                  <li>⚠️ Do NOT refresh or close the browser</li>
                </ul>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ एकूण ५० बहुपर्यायी प्रश्न</li>
                  <li>✓ प्रत्येक प्रश्नाला ४ पर्याय (A, B, C, D)</li>
                  <li>✓ वेळ मर्यादा: ६० मिनिटे</li>
                  <li>✓ नकारात्मक गुण नाहीत</li>
                  <li>✓ उत्तीर्ण गुण: ५० पैकी २० (४०%)</li>
                  <li>✓ प्रश्न पुनरावलोकनासाठी चिन्हांकित करता येतात</li>
                  <li>✓ सबमिट करण्यापूर्वी उत्तरे बदलता येतात</li>
                  <li>⚠️ वेळ संपल्यावर परीक्षा आपोआप सबमिट होईल</li>
                  <li>⚠️ ब्राउझर रिफ्रेश किंवा बंद करू नका</li>
                </ul>
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 mt-1 text-blue-600 rounded" defaultChecked />
                <span className="text-sm text-gray-700">
                  I have read and understood all the instructions. I am ready to start the examination.
                  <span className="block text-gray-500 mt-1">
                    मी सर्व सूचना वाचल्या आणि समजल्या आहेत. मी परीक्षा सुरू करण्यास तयार आहे.
                  </span>
                </span>
              </label>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startExam}
                disabled={starting}
                className="px-12 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
              >
                {starting ? (
                  <span className="flex items-center gap-3">
                    <span className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></span>
                    Starting Exam...
                  </span>
                ) : (
                  "🚀 Start Examination"
                )}
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Timer will start once you click the button
              </p>
            </div>
          </div>

          {/* Practice Mode Notice */}
          <div className="bg-yellow-100 px-6 py-4 text-center">
            <p className="text-yellow-800 font-medium">
              🎓 This is a PRACTICE exam - Results are for learning purposes only
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}