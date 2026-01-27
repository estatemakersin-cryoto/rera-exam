// ═══════════════════════════════════════════════════════════════════════════════
// FILE: components/exam/Step6Declaration.tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Copy this component and import it in app/exam/apply/page.tsx
// OR replace the existing Step6Declaration function in that file
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import SelfieCapture from "./SelfieCapture";

interface ApplicationData {
  candidateName: string;
  panNumber: string;
  mobile: string;
  email: string;
  trainingInstitute: string;
  centrePreference1: string;
  photoUrl: string;
  declarationAccepted: boolean;
  selfieUrl?: string;
}

interface Step6Props {
  formData: ApplicationData;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelfieCapture: (imageData: string) => void;
  language: "en" | "mr";
}

export default function Step6Declaration({ 
  formData, 
  errors, 
  onChange, 
  onSelfieCapture,
  language 
}: Step6Props) {
  const [selfieVerified, setSelfieVerified] = useState(!!formData.selfieUrl);

  const handleSelfieCapture = (imageData: string) => {
    setSelfieVerified(true);
    onSelfieCapture(imageData);
  };

  return (
    <div className="space-y-6">
      {/* Application Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-4">
          {language === "mr" ? "अर्जाचा सारांश" : "Application Summary"}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{language === "mr" ? "नाव" : "Name"}</p>
            <p className="font-medium">{formData.candidateName || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">{language === "mr" ? "पॅन क्रमांक" : "PAN Number"}</p>
            <p className="font-medium">{formData.panNumber || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">{language === "mr" ? "मोबाईल" : "Mobile"}</p>
            <p className="font-medium">{formData.mobile || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">{language === "mr" ? "ई-मेल" : "Email"}</p>
            <p className="font-medium">{formData.email || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">{language === "mr" ? "प्रशिक्षण संस्था" : "Training Institute"}</p>
            <p className="font-medium">{formData.trainingInstitute || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">{language === "mr" ? "केंद्र पसंती" : "Centre Preference"}</p>
            <p className="font-medium">{formData.centrePreference1 || "-"}</p>
          </div>
        </div>
      </div>

      {/* Live Selfie Capture Section */}
      <SelfieCapture
        onCapture={handleSelfieCapture}
        uploadedPhoto={formData.photoUrl}
        capturedSelfie={formData.selfieUrl}
        language={language}
      />

      {/* Selfie verification status */}
      {!selfieVerified && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-700 text-sm flex items-center gap-2">
            <span>⚠️</span>
            {language === "mr" 
              ? "अर्ज सबमिट करण्यापूर्वी कृपया लाइव्ह सेल्फी कॅप्चर करा"
              : "Please capture a live selfie before submitting the application"}
          </p>
        </div>
      )}

      {/* Declaration Text */}
      <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto text-sm">
        <h3 className="font-bold mb-3">DECLARATION / घोषणापत्र</h3>
        
        <div className="space-y-4 text-gray-700">
          <p>
            I hereby declare that the information given by me in this application is true, complete, 
            and correct to the best of my knowledge and belief.
          </p>
          
          {language === "mr" && (
            <p className="text-gray-600">
              मी यापूर्वी घोषित करतो की या अर्जात मी दिलेली माहिती माझ्या ज्ञानानुसार आणि विश्वासानुसार 
              सत्य, पूर्ण आणि योग्य आहे.
            </p>
          )}
          
          <p>
            I understand that in the event of any information being found false or incorrect at any 
            stage, my candidature / certificate is liable to be cancelled / revoked.
          </p>
          
          {language === "mr" && (
            <p className="text-gray-600">
              मला समजते की कोणत्याही टप्प्यावर कोणतीही माहिती खोटी किंवा चुकीची आढळल्यास, माझी 
              उमेदवारी / प्रमाणपत्र रद्द केले जाऊ शकते.
            </p>
          )}
          
          <p>
            I have read and understood all the instructions mentioned in the Information Bulletin and 
            shall abide by them.
          </p>
          
          <p>
            I agree that my photograph, signature, live selfie, and other documents uploaded are genuine 
            and belong to me.
          </p>
          
          {language === "mr" && (
            <p className="text-gray-600">
              मी सहमत आहे की माझा फोटो, स्वाक्षरी, लाइव्ह सेल्फी आणि अपलोड केलेली इतर कागदपत्रे 
              खरी आहेत आणि माझीच आहेत.
            </p>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 ${
        formData.declarationAccepted 
          ? "border-green-500 bg-green-50" 
          : errors.declarationAccepted 
            ? "border-red-500 bg-red-50" 
            : "border-gray-300"
      }`}>
        <input
          type="checkbox"
          name="declarationAccepted"
          checked={formData.declarationAccepted}
          onChange={onChange}
          className="w-5 h-5 text-green-600 rounded mt-0.5"
        />
        <div>
          <span className="font-medium text-gray-800">
            I have read and agree to the above declaration
          </span>
          {language === "mr" && (
            <span className="block text-sm text-gray-600">
              मी वरील घोषणापत्र वाचले आहे आणि मान्य करतो
            </span>
          )}
        </div>
      </label>
      {errors.declarationAccepted && (
        <p className="text-red-500 text-sm">{errors.declarationAccepted}</p>
      )}

      {/* Final Checklist */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">
          {language === "mr" ? "सबमिट करण्यापूर्वी तपासा:" : "Before submitting, verify:"}
        </h4>
        <div className="space-y-2">
          <ChecklistItem 
            checked={!!formData.candidateName} 
            label={language === "mr" ? "वैयक्तिक माहिती भरली" : "Personal details filled"} 
          />
          <ChecklistItem 
            checked={!!formData.panNumber} 
            label={language === "mr" ? "ओळखपत्र तपशील भरले" : "Identity details filled"} 
          />
          <ChecklistItem 
            checked={!!formData.centrePreference1} 
            label={language === "mr" ? "परीक्षा केंद्र निवडले" : "Exam centre selected"} 
          />
          <ChecklistItem 
            checked={!!formData.photoUrl} 
            label={language === "mr" ? "फोटो अपलोड केला" : "Photo uploaded"} 
          />
          <ChecklistItem 
            checked={selfieVerified} 
            label={language === "mr" ? "लाइव्ह सेल्फी कॅप्चर केली" : "Live selfie captured"} 
          />
          <ChecklistItem 
            checked={formData.declarationAccepted} 
            label={language === "mr" ? "घोषणापत्र स्वीकारले" : "Declaration accepted"} 
          />
        </div>
      </div>

      {/* Final Note */}
      {formData.declarationAccepted && selfieVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">✅ {language === "mr" ? "सबमिट करण्यास तयार" : "Ready to Submit"}</h4>
          <p className="text-sm text-green-700">
            {language === "mr" 
              ? "सबमिट केल्यानंतर, तुम्हाला तुमच्या अर्ज क्रमांकासह पोचपावती मिळेल. त्यानंतर तुम्ही प्रॅक्टिस अॅडमिट कार्ड डाउनलोड करू शकता आणि प्रॅक्टिस परीक्षेचा प्रयत्न करू शकता."
              : "After submission, you will receive an acknowledgement with your application number. You can then download your practice admit card and attempt the practice exam."}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper component for checklist
function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
        checked ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
      }`}>
        {checked ? "✓" : "○"}
      </span>
      <span className={checked ? "text-green-700" : "text-gray-500"}>{label}</span>
    </div>
  );
}