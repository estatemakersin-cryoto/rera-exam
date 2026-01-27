// ═══════════════════════════════════════════════════════════════════════════════
// FILE: app/exam/admit-card/page.tsx
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Application {
  id: string;
  applicationNumber: string;
  candidateName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  mobile: string;
  email: string;
  panNumber: string;
  photoUrl: string | null;
  signatureUrl: string | null;
  rollNumber: string;
  seatNumber: string;
  centrePreference1: string;
  trainingInstitute: string;
  status: string;
}

export default function AdmitCardPage() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const printRef = useRef<HTMLDivElement>(null);
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock exam details (in real app, fetch from ExamSession)
  const examDetails = {
    examName: "MahaRERA Real Estate Agent Certification Examination",
    examNameMr: "महाराष्ट्र रिअल इस्टेट एजंट प्रमाणपत्र परीक्षा",
    examDate: getExamDate(),
    examTime: "10:00 AM to 11:00 AM",
    reportingTime: "09:00 AM",
    duration: "60 Minutes",
    totalQuestions: 50,
    centreName: "EstateMakers Online Exam Centre",
    centreAddress: "Online Examination - Practice Mode",
    instructions: [
      "Report to the exam centre 60 minutes before the scheduled time",
      "Carry a valid Photo ID (Aadhaar/PAN/Driving License) along with this Admit Card",
      "Electronic devices including mobile phones are NOT allowed",
      "Read all questions carefully before answering",
      "There is NO negative marking",
      "The exam will auto-submit after 60 minutes",
    ],
    instructionsMr: [
      "निर्धारित वेळेच्या ६० मिनिटे आधी परीक्षा केंद्रावर पोहोचा",
      "या प्रवेशपत्रासह वैध फोटो आयडी (आधार/पॅन/ड्रायव्हिंग लायसन्स) सोबत आणा",
      "मोबाईल फोनसह इलेक्ट्रॉनिक उपकरणांना परवानगी नाही",
      "उत्तर देण्यापूर्वी सर्व प्रश्न काळजीपूर्वक वाचा",
      "नकारात्मक गुण नाहीत",
      "६० मिनिटांनंतर परीक्षा आपोआप सबमिट होईल",
    ]
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/exam/status?id=${applicationId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }
      
      if (!data.application.rollNumber) {
        throw new Error("Admit card not yet generated");
      }
      
      setApplication(data.application);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In production, generate actual PDF using puppeteer or similar
    alert("In production, this would download a PDF. For now, use the Print option to save as PDF.");
    handlePrint();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admit card...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Admit Card Not Available</h2>
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Hidden in print */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/exam/status" className="text-white hover:text-blue-200">
                ← Back
              </Link>
              <h1 className="text-xl font-bold">Admit Card / Hall Ticket</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white text-blue-800 rounded-lg hover:bg-blue-50 font-medium"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
              >
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Practice Mode Banner - Hidden in print */}
      <div className="bg-yellow-50 border-b border-yellow-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 text-center">
          <span className="text-yellow-800 font-medium">
            🎓 This is a PRACTICE Admit Card - Not valid for actual MahaRERA examination
          </span>
        </div>
      </div>

      {/* Admit Card - Printable Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        <div 
          ref={printRef}
          className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6 print:bg-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-800 font-bold text-2xl">EM</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">ADMIT CARD / प्रवेशपत्र</h1>
                  <p className="text-sm text-blue-200">{examDetails.examName}</p>
                  <p className="text-xs text-blue-300">{examDetails.examNameMr}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Application No.</p>
                <p className="text-xl font-bold">{application.applicationNumber}</p>
              </div>
            </div>
          </div>

          {/* Roll Number Banner */}
          <div className="bg-green-600 text-white py-3 px-6 flex justify-between items-center">
            <div>
              <span className="text-sm">Roll Number / रोल नंबर</span>
              <span className="text-3xl font-bold ml-4">{application.rollNumber}</span>
            </div>
            <div>
              <span className="text-sm">Seat No. / सीट नंबर</span>
              <span className="text-2xl font-bold ml-4">{application.seatNumber}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="flex gap-6">
              {/* Left: Photo and Signature */}
              <div className="w-48 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Candidate Photo</p>
                  <div className="w-40 h-48 border-2 border-gray-300 rounded overflow-hidden">
                    {application.photoUrl ? (
                      <img 
                        src={application.photoUrl} 
                        alt="Candidate" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        Photo
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Candidate Signature</p>
                  <div className="w-40 h-16 border-2 border-gray-300 rounded overflow-hidden">
                    {application.signatureUrl ? (
                      <img 
                        src={application.signatureUrl} 
                        alt="Signature" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        Signature
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Candidate Details */}
              <div className="flex-1">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-500 w-40">Candidate Name</td>
                      <td className="py-2 font-semibold">{application.candidateName}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-500">Father's Name</td>
                      <td className="py-2">{application.fatherName}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-500">Date of Birth</td>
                      <td className="py-2">
                        {new Date(application.dateOfBirth).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-500">Gender</td>
                      <td className="py-2">{application.gender}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-500">Mobile</td>
                      <td className="py-2">{application.mobile}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-500">PAN Number</td>
                      <td className="py-2">{application.panNumber}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-500">Training Institute</td>
                      <td className="py-2">{application.trainingInstitute}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exam Details */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-3">Examination Details / परीक्षा तपशील</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Exam Date</p>
                  <p className="font-semibold text-blue-800">{examDetails.examDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Exam Time</p>
                  <p className="font-semibold text-blue-800">{examDetails.examTime}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reporting Time</p>
                  <p className="font-semibold text-blue-800">{examDetails.reportingTime}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-semibold text-blue-800">{examDetails.duration}</p>
                </div>
              </div>
            </div>

            {/* Exam Centre */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-bold text-gray-800 mb-2">Examination Centre / परीक्षा केंद्र</h3>
              <p className="font-semibold">{examDetails.centreName}</p>
              <p className="text-sm text-gray-600">{examDetails.centreAddress}</p>
              <p className="text-sm text-gray-500 mt-1">District: {application.centrePreference1}</p>
            </div>

            {/* Instructions */}
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 mb-3">
                Important Instructions / महत्त्वाच्या सूचना
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-sm space-y-2">
                  {examDetails.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-blue-600">{idx + 1}.</span>
                      <span className="text-gray-700">{instruction}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm space-y-2">
                  {examDetails.instructionsMr.map((instruction, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-blue-600">{idx + 1}.</span>
                      <span className="text-gray-600">{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="mt-6 flex justify-between items-end">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center mx-auto">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Scan to verify</p>
              </div>
              
              <div className="text-right">
                <div className="border-t-2 border-gray-400 w-48 pt-2">
                  <p className="text-xs text-gray-500">Controller of Examination</p>
                  <p className="text-xs text-gray-500">परीक्षा नियंत्रक</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 text-center text-xs text-gray-500 border-t">
            <p>This admit card is computer generated and does not require signature</p>
            <p>हे प्रवेशपत्र संगणकाद्वारे तयार केलेले आहे आणि स्वाक्षरीची आवश्यकता नाही</p>
            <p className="mt-2 font-medium text-yellow-600 print:hidden">
              🎓 PRACTICE MODE - Not valid for actual MahaRERA examination
            </p>
          </div>
        </div>

        {/* Action Buttons - Hidden in print */}
        <div className="mt-6 flex justify-center gap-4 print:hidden">
          <Link
            href={`/exam/session?applicationId=${application.id}`}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            🚀 Start Practice Exam
          </Link>
          <Link
            href="/exam/status"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back to Status
          </Link>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-blue-700 {
            background-color: #1d4ed8 !important;
          }
        }
      `}</style>
    </div>
  );
}

// Helper function to get exam date (7 days from now for practice)
function getExamDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}