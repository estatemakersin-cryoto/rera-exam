// ═══════════════════════════════════════════════════════════════════════════════
// FILE: app/exam/apply/page.tsx
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ApplicationData {
  // Step 1: Personal Details
  candidateName: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  email: string;
  mobile: string;
  alternateMobile: string;
  photoUrl: string;
  
  // Step 2: Identity & Exam Details
  panNumber: string;
  nameOnPan: string;
  postApplied: string;
  trainingInstitute: string;
  trainingCertNo: string;
  isPwBD: boolean;
  pwbdType: string;
  pwbdPercentage: string;
  
  // Step 3: Address Details
  corrAddressLine1: string;
  corrAddressLine2: string;
  corrCountry: string;
  corrState: string;
  corrDistrict: string;
  corrPincode: string;
  sameAsCorrespondence: boolean;
  permAddressLine1: string;
  permAddressLine2: string;
  permCountry: string;
  permState: string;
  permDistrict: string;
  permPincode: string;
  
  // Step 4: Exam Centre
  centrePreference1: string;
  centrePreference2: string;
  centrePreference3: string;
  
  // Step 5: Documents
  signatureUrl: string;
  panCardUrl: string;
  trainingCertUrl: string;
  pwbdCertUrl: string;
  
  // Step 6: Declaration
  declarationAccepted: boolean;
  selfieUrl: string;
}

const initialData: ApplicationData = {
  candidateName: "",
  dateOfBirth: "",
  gender: "",
  fatherName: "",
  motherName: "",
  email: "",
  mobile: "",
  alternateMobile: "",
  photoUrl: "",
  panNumber: "",
  nameOnPan: "",
  postApplied: "REAL ESTATE AGENT EXAM",
  trainingInstitute: "",
  trainingCertNo: "",
  isPwBD: false,
  pwbdType: "",
  pwbdPercentage: "",
  corrAddressLine1: "",
  corrAddressLine2: "",
  corrCountry: "India",
  corrState: "Maharashtra",
  corrDistrict: "",
  corrPincode: "",
  sameAsCorrespondence: false,
  permAddressLine1: "",
  permAddressLine2: "",
  permCountry: "India",
  permState: "Maharashtra",
  permDistrict: "",
  permPincode: "",
  centrePreference1: "",
  centrePreference2: "",
  centrePreference3: "",
  signatureUrl: "",
  panCardUrl: "",
  trainingCertUrl: "",
  pwbdCertUrl: "",
  declarationAccepted: false,
  selfieUrl: "",
};

// Maharashtra Districts
const MAHARASHTRA_DISTRICTS = [
  "Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg",
  "Pune", "Satara", "Sangli", "Kolhapur", "Solapur",
  "Nashik", "Ahmednagar", "Dhule", "Jalgaon", "Nandurbar",
  "Aurangabad", "Jalna", "Beed", "Latur", "Osmanabad", "Nanded", "Parbhani", "Hingoli",
  "Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli",
  "Amravati", "Akola", "Buldhana", "Washim", "Yavatmal"
].sort();

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ExamApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "mr">("en");

  // Load saved application on mount
  useEffect(() => {
    loadSavedApplication();
  }, []);

  const loadSavedApplication = async () => {
    try {
      const res = await fetch("/api/exam/apply");
      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          setApplicationId(data.application.id);
          setCurrentStep(data.application.currentStep || 1);
          // Map API data to form data
          setFormData(prev => ({
            ...prev,
            ...mapApiToFormData(data.application)
          }));
        }
      }
    } catch (error) {
      console.error("Error loading application:", error);
    }
  };

  const mapApiToFormData = (apiData: any): Partial<ApplicationData> => {
    return {
      candidateName: apiData.candidateName || "",
      dateOfBirth: apiData.dateOfBirth ? apiData.dateOfBirth.split("T")[0] : "",
      gender: apiData.gender || "",
      fatherName: apiData.fatherName || "",
      motherName: apiData.motherName || "",
      email: apiData.email || "",
      mobile: apiData.mobile || "",
      alternateMobile: apiData.alternateMobile || "",
      photoUrl: apiData.photoUrl || "",
      panNumber: apiData.panNumber || "",
      nameOnPan: apiData.nameOnPan || "",
      postApplied: apiData.postApplied || "REAL ESTATE AGENT EXAM",
      trainingInstitute: apiData.trainingInstitute || "",
      trainingCertNo: apiData.trainingCertNo || "",
      isPwBD: apiData.isPwBD || false,
      pwbdType: apiData.pwbdType || "",
      pwbdPercentage: apiData.pwbdPercentage?.toString() || "",
      corrAddressLine1: apiData.corrAddressLine1 || "",
      corrAddressLine2: apiData.corrAddressLine2 || "",
      corrCountry: apiData.corrCountry || "India",
      corrState: apiData.corrState || "Maharashtra",
      corrDistrict: apiData.corrDistrict || "",
      corrPincode: apiData.corrPincode || "",
      sameAsCorrespondence: apiData.sameAsCorrespondence || false,
      permAddressLine1: apiData.permAddressLine1 || "",
      permAddressLine2: apiData.permAddressLine2 || "",
      permCountry: apiData.permCountry || "India",
      permState: apiData.permState || "Maharashtra",
      permDistrict: apiData.permDistrict || "",
      permPincode: apiData.permPincode || "",
      centrePreference1: apiData.centrePreference1 || "",
      centrePreference2: apiData.centrePreference2 || "",
      centrePreference3: apiData.centrePreference3 || "",
      signatureUrl: apiData.signatureUrl || "",
      panCardUrl: apiData.panCardUrl || "",
      trainingCertUrl: apiData.trainingCertUrl || "",
      pwbdCertUrl: apiData.pwbdCertUrl || "",
      declarationAccepted: apiData.declarationAccepted || false,
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Handle "same as correspondence" checkbox
    if (name === "sameAsCorrespondence" && checked) {
      setFormData(prev => ({
        ...prev,
        sameAsCorrespondence: true,
        permAddressLine1: prev.corrAddressLine1,
        permAddressLine2: prev.corrAddressLine2,
        permCountry: prev.corrCountry,
        permState: prev.corrState,
        permDistrict: prev.corrDistrict,
        permPincode: prev.corrPincode,
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.candidateName.trim()) newErrors.candidateName = "Candidate name is required";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
        if (!formData.motherName.trim()) newErrors.motherName = "Mother's name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
        else if (!/^[6-9]\d{9}$/.test(formData.mobile)) newErrors.mobile = "Invalid mobile number";
        break;
        
      case 2:
        if (!formData.panNumber.trim()) newErrors.panNumber = "PAN number is required";
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
          newErrors.panNumber = "Invalid PAN format (AAAAA9999A)";
        }
        if (!formData.nameOnPan.trim()) newErrors.nameOnPan = "Name on PAN is required";
        if (!formData.trainingInstitute.trim()) newErrors.trainingInstitute = "Training institute is required";
        if (!formData.trainingCertNo.trim()) newErrors.trainingCertNo = "Training certificate number is required";
        break;
        
      case 3:
        if (!formData.corrAddressLine1.trim()) newErrors.corrAddressLine1 = "Address is required";
        if (!formData.corrState) newErrors.corrState = "State is required";
        if (!formData.corrDistrict) newErrors.corrDistrict = "District is required";
        if (!formData.corrPincode.trim()) newErrors.corrPincode = "Pincode is required";
        else if (!/^\d{6}$/.test(formData.corrPincode)) newErrors.corrPincode = "Invalid pincode";
        
        if (!formData.sameAsCorrespondence) {
          if (!formData.permAddressLine1.trim()) newErrors.permAddressLine1 = "Permanent address is required";
          if (!formData.permState) newErrors.permState = "State is required";
          if (!formData.permDistrict) newErrors.permDistrict = "District is required";
          if (!formData.permPincode.trim()) newErrors.permPincode = "Pincode is required";
        }
        break;
        
      case 4:
        if (!formData.centrePreference1) newErrors.centrePreference1 = "First preference is required";
        break;
        
      case 5:
        // Documents are optional for practice, but show warning
        break;
        
      case 6:
        if (!formData.declarationAccepted) newErrors.declarationAccepted = "You must accept the declaration";
        if (!formData.selfieUrl) newErrors.selfieUrl = "Please capture a live selfie";  // ← ADD THIS LINE
  break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveStep = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exam/apply", {
        method: applicationId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          currentStep,
          ...formData,
          panNumber: formData.panNumber.toUpperCase(),
          candidateName: formData.candidateName.toUpperCase(),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }
      
      if (data.applicationId) {
        setApplicationId(data.applicationId);
      }
      
      return true;
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    
    const saved = await saveStep();
    if (saved && currentStep < 6) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/exam/apply/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }
      
      // Redirect to status page
      router.push(`/exam/status?id=${applicationId}`);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
  const handleSelfieCapture = (imageData: string) => {
    setFormData(prev => ({
        ...prev,
        selfieUrl: imageData
    }));
  };
  

    // Validate file
    const maxSize = fieldName === "photoUrl" || fieldName === "signatureUrl" ? 50 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Maximum size: ${maxSize < 1024 * 1024 ? `${maxSize / 1024}KB` : `${maxSize / (1024 * 1024)}MB`}`);
      return;
    }
    
    // For practice, we'll use base64 data URL (in production, upload to S3)
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Step titles
  const stepTitles = [
    { en: "Personal Details", mr: "वैयक्तिक माहिती" },
    { en: "Identity & Exam Details", mr: "ओळखपत्र आणि परीक्षा तपशील" },
    { en: "Address Details", mr: "पत्त्याची माहिती" },
    { en: "Exam Centre", mr: "परीक्षा केंद्र" },
    { en: "Documents", mr: "कागदपत्रे" },
    { en: "Declaration", mr: "घोषणा" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - TCS iON Style */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold text-xl">EM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">MahaRERA Agent Certification</h1>
                <p className="text-sm text-blue-200">Practice Application Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === "en" ? "mr" : "en")}
                className="px-3 py-1 bg-blue-700 rounded text-sm hover:bg-blue-600"
              >
                {language === "en" ? "मराठी" : "English"}
              </button>
              <span className="text-sm bg-yellow-500 text-yellow-900 px-3 py-1 rounded font-medium">
                🎓 Practice Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {stepTitles.map((title, idx) => (
              <div
                key={idx}
                className={`flex items-center ${idx < stepTitles.length - 1 ? "flex-1" : ""}`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx + 1 < currentStep
                        ? "bg-green-500 text-white"
                        : idx + 1 === currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {idx + 1 < currentStep ? "✓" : idx + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center max-w-[80px] ${
                    idx + 1 === currentStep ? "text-blue-600 font-medium" : "text-gray-500"
                  }`}>
                    {title[language]}
                  </span>
                </div>
                {idx < stepTitles.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    idx + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">
              Step {currentStep} of 6: {stepTitles[currentStep - 1][language]}
            </h2>
            <p className="text-sm text-blue-200">
              {language === "mr" && stepTitles[currentStep - 1].en}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <Step1PersonalDetails
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
                onFileUpload={handleFileUpload}
                language={language}
              />
            )}

            {/* Step 2: Identity & Exam Details */}
            {currentStep === 2 && (
              <Step2IdentityDetails
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
                language={language}
              />
            )}

            {/* Step 3: Address Details */}
            {currentStep === 3 && (
              <Step3AddressDetails
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
                districts={MAHARASHTRA_DISTRICTS}
                language={language}
              />
            )}

            {/* Step 4: Exam Centre */}
            {currentStep === 4 && (
              <Step4ExamCentre
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
                districts={MAHARASHTRA_DISTRICTS}
                language={language}
              />
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <Step5Documents
                formData={formData}
                errors={errors}
                onFileUpload={handleFileUpload}
                language={language}
              />
            )}

            {/* Step 6: Declaration */}
            {currentStep === 6 && (
                <Step6Declaration
                    formData={formData}
                    errors={errors}
                    onChange={handleInputChange}
                    onSelfieCapture={handleSelfieCapture}
                    language={language}
                />
                )}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={saveStep}
                disabled={loading}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Draft"}
              </button>
              
              {currentStep < 6 ? (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save & Continue →"}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Application ✓"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Practice Mode Notice */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🎓 Practice Mode Information</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This is a practice form to familiarize you with the real MahaRERA application process</li>
            <li>• No actual registration or payment is required</li>
            <li>• Your practice data is saved for reference</li>
            <li>• After submission, you can download a sample admit card and take a practice exam</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface StepProps {
  formData: ApplicationData;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  language: "en" | "mr";
}

// ─────────────────────────────────────────────────────────────────────────────────
// Step 1: Personal Details
// ─────────────────────────────────────────────────────────────────────────────────

function Step1PersonalDetails({ 
  formData, 
  errors, 
  onChange, 
  onFileUpload,
  language 
}: StepProps & { onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div className="flex gap-6">
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidate Photo <span className="text-red-500">*</span>
            <span className="block text-xs text-gray-500 font-normal">
              {language === "mr" ? "उमेदवाराचा फोटो" : "Passport size photo"}
            </span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center">
            {formData.photoUrl ? (
              <img src={formData.photoUrl} alt="Photo" className="w-32 h-40 object-cover mx-auto" />
            ) : (
              <div className="w-32 h-40 bg-gray-100 flex items-center justify-center mx-auto">
                <span className="text-gray-400 text-xs">No Photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => onFileUpload(e, "photoUrl")}
              className="mt-2 text-xs w-full"
            />
            <p className="text-xs text-gray-500 mt-1">JPG/PNG, 20-50KB</p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {/* Photo Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">📷 Photo Guidelines</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Recent passport size photograph</li>
              <li>• White background only</li>
              <li>• Face should be clearly visible</li>
              <li>• File size: 20KB to 50KB</li>
              <li>• Format: JPG or PNG</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Name */}
      <FormField
        label="Candidate Name (as per PAN)"
        labelMr="उमेदवाराचे नाव (पॅन प्रमाणे)"
        name="candidateName"
        value={formData.candidateName}
        onChange={onChange}
        error={errors.candidateName}
        required
        placeholder="FULL NAME IN CAPITAL LETTERS"
        className="uppercase"
        language={language}
      />

      {/* DOB & Gender */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Date of Birth"
          labelMr="जन्म दिनांक"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={onChange}
          error={errors.dateOfBirth}
          required
          language={language}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-1">
              {language === "mr" ? "लिंग" : ""}
            </span>
          </label>
          <div className="flex gap-4 mt-2">
            {[
              { value: "Male", labelEn: "Male", labelMr: "पुरुष" },
              { value: "Female", labelEn: "Female", labelMr: "स्त्री" },
              { value: "Other", labelEn: "Other", labelMr: "इतर" },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={onChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">
                  {option.labelEn}
                  {language === "mr" && <span className="text-gray-500 ml-1">({option.labelMr})</span>}
                </span>
              </label>
            ))}
          </div>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>
      </div>

      {/* Parents' Names */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Father's Name"
          labelMr="वडिलांचे नाव"
          name="fatherName"
          value={formData.fatherName}
          onChange={onChange}
          error={errors.fatherName}
          required
          language={language}
        />
        <FormField
          label="Mother's Name"
          labelMr="आईचे नाव"
          name="motherName"
          value={formData.motherName}
          onChange={onChange}
          error={errors.motherName}
          required
          language={language}
        />
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Email ID"
          labelMr="ई-मेल आयडी"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          error={errors.email}
          required
          placeholder="example@email.com"
          language={language}
        />
        <FormField
          label="Mobile Number"
          labelMr="मोबाईल नंबर"
          name="mobile"
          value={formData.mobile}
          onChange={onChange}
          error={errors.mobile}
          required
          placeholder="10 digit mobile number"
          maxLength={10}
          language={language}
        />
      </div>

      <FormField
        label="Alternate Mobile Number"
        labelMr="पर्यायी मोबाईल नंबर"
        name="alternateMobile"
        value={formData.alternateMobile}
        onChange={onChange}
        placeholder="Optional"
        maxLength={10}
        language={language}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────
// Step 2: Identity & Exam Details
// ─────────────────────────────────────────────────────────────────────────────────

function Step2IdentityDetails({ formData, errors, onChange, language }: StepProps) {
  return (
    <div className="space-y-6">
      {/* PAN Details */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="PAN Card Number"
          labelMr="पॅन कार्ड क्रमांक"
          name="panNumber"
          value={formData.panNumber}
          onChange={onChange}
          error={errors.panNumber}
          required
          placeholder="AAAAA9999A"
          maxLength={10}
          className="uppercase"
          language={language}
        />
        <FormField
          label="Name on PAN Card"
          labelMr="पॅन कार्डवरील नाव"
          name="nameOnPan"
          value={formData.nameOnPan}
          onChange={onChange}
          error={errors.nameOnPan}
          required
          language={language}
        />
      </div>

      {/* Post Applied */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Post Applied For <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-1">
            {language === "mr" ? "अर्ज केलेले पद" : ""}
          </span>
        </label>
        <select
          name="postApplied"
          value={formData.postApplied}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="REAL ESTATE AGENT EXAM">REAL ESTATE AGENT EXAM</option>
        </select>
      </div>

      {/* Training Details */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-800">
          Training Details {language === "mr" && <span className="text-gray-500 font-normal">(प्रशिक्षण तपशील)</span>}
        </h3>
        
        <FormField
          label="Training Institute Name"
          labelMr="प्रशिक्षण संस्थेचे नाव"
          name="trainingInstitute"
          value={formData.trainingInstitute}
          onChange={onChange}
          error={errors.trainingInstitute}
          required
          placeholder="Enter institute name"
          language={language}
        />
        
        <FormField
          label="Training Certificate Number"
          labelMr="प्रशिक्षण प्रमाणपत्र क्रमांक"
          name="trainingCertNo"
          value={formData.trainingCertNo}
          onChange={onChange}
          error={errors.trainingCertNo}
          required
          placeholder="e.g., SIMRERA019071"
          language={language}
        />
      </div>

      {/* PwBD Section */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isPwBD"
            checked={formData.isPwBD}
            onChange={onChange}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <span className="font-medium text-gray-800">
            Are you a Person with Benchmark Disability (PwBD)?
            {language === "mr" && <span className="text-gray-500 font-normal ml-1">(दिव्यांग व्यक्ती)</span>}
          </span>
        </label>

        {formData.isPwBD && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField
              label="Type of Disability"
              labelMr="अपंगत्वाचा प्रकार"
              name="pwbdType"
              value={formData.pwbdType}
              onChange={onChange}
              placeholder="e.g., Visual, Hearing, Locomotor"
              language={language}
            />
            <FormField
              label="Disability Percentage"
              labelMr="अपंगत्व टक्केवारी"
              name="pwbdPercentage"
              value={formData.pwbdPercentage}
              onChange={onChange}
              placeholder="e.g., 40"
              type="number"
              language={language}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────
// Step 3: Address Details
// ─────────────────────────────────────────────────────────────────────────────────

function Step3AddressDetails({ 
  formData, 
  errors, 
  onChange, 
  districts,
  language 
}: StepProps & { districts: string[] }) {
  return (
    <div className="space-y-6">
      {/* Correspondence Address */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-800 border-b pb-2">
          Correspondence Address {language === "mr" && <span className="text-gray-500 font-normal">(पत्रव्यवहाराचा पत्ता)</span>}
        </h3>
        
        <FormField
          label="Address Line 1"
          labelMr="पत्ता ओळ १"
          name="corrAddressLine1"
          value={formData.corrAddressLine1}
          onChange={onChange}
          error={errors.corrAddressLine1}
          required
          placeholder="House No., Building Name, Street"
          language={language}
        />
        
        <FormField
          label="Address Line 2"
          labelMr="पत्ता ओळ २"
          name="corrAddressLine2"
          value={formData.corrAddressLine2}
          onChange={onChange}
          placeholder="Area, Landmark (Optional)"
          language={language}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="corrCountry"
              value={formData.corrCountry}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="India">India</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="corrState"
              value={formData.corrState}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District <span className="text-red-500">*</span>
              {language === "mr" && <span className="text-gray-500 ml-1">(जिल्हा)</span>}
            </label>
            <select
              name="corrDistrict"
              value={formData.corrDistrict}
              onChange={onChange}
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
                errors.corrDistrict ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">-- Select District --</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.corrDistrict && <p className="text-red-500 text-xs mt-1">{errors.corrDistrict}</p>}
          </div>
          
          <FormField
            label="Pincode"
            labelMr="पिनकोड"
            name="corrPincode"
            value={formData.corrPincode}
            onChange={onChange}
            error={errors.corrPincode}
            required
            placeholder="6 digit pincode"
            maxLength={6}
            language={language}
          />
        </div>
      </div>

      {/* Same as Correspondence Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          name="sameAsCorrespondence"
          checked={formData.sameAsCorrespondence}
          onChange={onChange}
          className="w-5 h-5 text-blue-600 rounded"
        />
        <span className="text-gray-800">
          Permanent address same as correspondence address
          {language === "mr" && <span className="text-gray-500 ml-1">(कायमचा पत्ता सारखाच)</span>}
        </span>
      </label>

      {/* Permanent Address */}
      {!formData.sameAsCorrespondence && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-800 border-b pb-2">
            Permanent Address {language === "mr" && <span className="text-gray-500 font-normal">(कायमचा पत्ता)</span>}
          </h3>
          
          <FormField
            label="Address Line 1"
            labelMr="पत्ता ओळ १"
            name="permAddressLine1"
            value={formData.permAddressLine1}
            onChange={onChange}
            error={errors.permAddressLine1}
            required
            language={language}
          />
          
          <FormField
            label="Address Line 2"
            labelMr="पत्ता ओळ २"
            name="permAddressLine2"
            value={formData.permAddressLine2}
            onChange={onChange}
            language={language}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                name="permCountry"
                value={formData.permCountry}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="India">India</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                name="permState"
                value={formData.permState}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select
                name="permDistrict"
                value={formData.permDistrict}
                onChange={onChange}
                className={`w-full border rounded-lg px-4 py-2 ${
                  errors.permDistrict ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">-- Select --</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <FormField
              label="Pincode"
              labelMr="पिनकोड"
              name="permPincode"
              value={formData.permPincode}
              onChange={onChange}
              error={errors.permPincode}
              required={!formData.sameAsCorrespondence}
              maxLength={6}
              language={language}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────
// Step 4: Exam Centre
// ─────────────────────────────────────────────────────────────────────────────────

function Step4ExamCentre({ 
  formData, 
  errors, 
  onChange, 
  districts,
  language 
}: StepProps & { districts: string[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">ℹ️ Important Information</h3>
        <p className="text-sm text-blue-700">
          Select your preferred exam centre districts. Centres will be allocated based on 
          availability. In practice mode, this simulates the real allocation process.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            1st Preference <span className="text-red-500">*</span>
            {language === "mr" && <span className="text-gray-500 ml-1">(प्रथम पसंती)</span>}
          </label>
          <select
            name="centrePreference1"
            value={formData.centrePreference1}
            onChange={onChange}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${
              errors.centrePreference1 ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Select District --</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.centrePreference1 && <p className="text-red-500 text-xs mt-1">{errors.centrePreference1}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            2nd Preference (Optional)
            {language === "mr" && <span className="text-gray-500 ml-1">(द्वितीय पसंती)</span>}
          </label>
          <select
            name="centrePreference2"
            value={formData.centrePreference2}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select District --</option>
            {districts.filter(d => d !== formData.centrePreference1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            3rd Preference (Optional)
            {language === "mr" && <span className="text-gray-500 ml-1">(तृतीय पसंती)</span>}
          </label>
          <select
            name="centrePreference3"
            value={formData.centrePreference3}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select District --</option>
            {districts.filter(d => d !== formData.centrePreference1 && d !== formData.centrePreference2).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">📍 Note</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Centre allocation is based on availability</li>
          <li>• Your first preference will be given priority</li>
          <li>• Final centre details will be shown on the Admit Card</li>
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────
// Step 5: Documents
// ─────────────────────────────────────────────────────────────────────────────────

function Step5Documents({ 
  formData, 
  errors, 
  onFileUpload,
  language 
}: StepProps & { onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">🎓 Practice Mode</h3>
        <p className="text-sm text-yellow-700">
          Document upload is optional in practice mode. In the real exam, you'll need to 
          upload actual documents. This step helps you understand the requirements.
        </p>
      </div>

      {/* Signature */}
      <DocumentUploadField
        label="Signature"
        labelMr="स्वाक्षरी"
        fieldName="signatureUrl"
        value={formData.signatureUrl}
        onFileUpload={onFileUpload}
        requirements={[
          "Sign on white paper with black ink",
          "File size: 10KB - 30KB",
          "Format: JPG or PNG"
        ]}
        language={language}
      />

      {/* PAN Card */}
      <DocumentUploadField
        label="PAN Card (Front)"
        labelMr="पॅन कार्ड"
        fieldName="panCardUrl"
        value={formData.panCardUrl}
        onFileUpload={onFileUpload}
        requirements={[
          "Clear, readable scan",
          "File size: Up to 2MB",
          "Format: JPG, PNG, or PDF"
        ]}
        language={language}
      />

      {/* Training Certificate */}
      <DocumentUploadField
        label="Training Completion Certificate"
        labelMr="प्रशिक्षण प्रमाणपत्र"
        fieldName="trainingCertUrl"
        value={formData.trainingCertUrl}
        onFileUpload={onFileUpload}
        requirements={[
          "Certificate from MahaRERA approved institute",
          "File size: Up to 2MB",
          "Format: JPG, PNG, or PDF"
        ]}
        language={language}
      />

      {/* PwBD Certificate (conditional) */}
      {formData.isPwBD && (
        <DocumentUploadField
          label="PwBD Certificate"
          labelMr="दिव्यांग प्रमाणपत्र"
          fieldName="pwbdCertUrl"
          value={formData.pwbdCertUrl}
          onFileUpload={onFileUpload}
          requirements={[
            "Valid disability certificate",
            "File size: Up to 2MB",
            "Format: JPG, PNG, or PDF"
          ]}
          language={language}
        />
      )}
    </div>
  );
}

function DocumentUploadField({
  label,
  labelMr,
  fieldName,
  value,
  onFileUpload,
  requirements,
  language
}: {
  label: string;
  labelMr: string;
  fieldName: string;
  value: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  requirements: string[];
  language: "en" | "mr";
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-800">{label}</h4>
          {language === "mr" && <p className="text-sm text-gray-500">{labelMr}</p>}
        </div>
        {value && (
          <span className="text-green-600 text-sm flex items-center gap-1">
            ✓ Uploaded
          </span>
        )}
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(e) => onFileUpload(e, fieldName)}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <ul className="mt-2 text-xs text-gray-500 space-y-1">
            {requirements.map((req, idx) => (
              <li key={idx}>• {req}</li>
            ))}
          </ul>
        </div>
        
        {value && (
          <div className="w-24 h-24 border rounded overflow-hidden">
            {value.startsWith("data:image") ? (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                PDF
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE FORM FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
  label: string;
  labelMr?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  className?: string;
  language: "en" | "mr";
}

function FormField({
  label,
  labelMr,
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = "text",
  maxLength,
  className = "",
  language
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {language === "mr" && labelMr && (
          <span className="text-gray-500 ml-1">({labelMr})</span>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}