// ═══════════════════════════════════════════════════════════════════════════════
// FILE: components/exam/SelfieCapture.tsx
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SelfieCaptureProps {
  onCapture: (imageData: string) => void;
  uploadedPhoto?: string;
  capturedSelfie?: string;
  language?: "en" | "mr";
}

export default function SelfieCapture({
  onCapture,
  uploadedPhoto,
  capturedSelfie,
  language = "en"
}: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>("");
  const [captured, setCaptured] = useState<string>(capturedSelfie || "");
  const [countdown, setCountdown] = useState<number | null>(null);

  // Start camera
  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setError(language === "mr" 
          ? "कॅमेरा परवानगी नाकारली. कृपया ब्राउझर सेटिंग्जमध्ये परवानगी द्या."
          : "Camera permission denied. Please allow camera access in browser settings.");
      } else if (err.name === "NotFoundError") {
        setError(language === "mr"
          ? "कॅमेरा सापडला नाही. कृपया कॅमेरा कनेक्ट करा."
          : "No camera found. Please connect a camera.");
      } else {
        setError(language === "mr"
          ? "कॅमेरा सुरू करता आला नाही. कृपया पुन्हा प्रयत्न करा."
          : "Could not start camera. Please try again.");
      }
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  // Capture with countdown
  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      capturePhoto();
      setCountdown(null);
    }
  }, [countdown]);

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas (mirror for selfie)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    // Convert to data URL
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCaptured(imageData);
    onCapture(imageData);
    
    // Stop camera after capture
    stopCamera();
  };

  // Retake photo
  const retake = () => {
    setCaptured("");
    startCamera();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <span>📸</span>
        {language === "mr" ? "लाइव्ह सेल्फी कॅप्चर" : "Live Selfie Capture"}
      </h4>
      
      <p className="text-sm text-blue-700 mb-4">
        {language === "mr" 
          ? "ओळख पडताळणीसाठी कृपया लाइव्ह सेल्फी घ्या. तुमचा चेहरा स्पष्टपणे दिसला पाहिजे."
          : "Please capture a live selfie for identity verification. Your face should be clearly visible."}
      </p>

      <div className="flex gap-4 flex-col md:flex-row">
        {/* Camera / Captured Section */}
        <div className="flex-1">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3]">
            {/* Video Stream */}
            {isStreaming && !captured && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                {/* Face Guide Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-60 border-4 border-white/50 rounded-full" />
                </div>
                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-8xl font-bold text-white animate-pulse">
                      {countdown}
                    </span>
                  </div>
                )}
              </>
            )}
            
            {/* Captured Image */}
            {captured && (
              <img 
                src={captured} 
                alt="Captured selfie" 
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Placeholder */}
            {!isStreaming && !captured && (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900">
                <span className="text-6xl mb-2">📷</span>
                <span className="text-sm">
                  {language === "mr" ? "कॅमेरा सुरू करा" : "Start Camera"}
                </span>
              </div>
            )}
            
            {/* Verified Badge */}
            {captured && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                ✓ {language === "mr" ? "कॅप्चर झाले" : "Captured"}
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* Controls */}
          <div className="mt-3 flex gap-2">
            {!isStreaming && !captured && (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                🎥 {language === "mr" ? "कॅमेरा सुरू करा" : "Start Camera"}
              </button>
            )}
            
            {isStreaming && !captured && (
              <>
                <button
                  type="button"
                  onClick={startCountdown}
                  disabled={countdown !== null}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400"
                >
                  📸 {language === "mr" ? "फोटो घ्या" : "Capture Photo"}
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  ✕
                </button>
              </>
            )}
            
            {captured && (
              <button
                type="button"
                onClick={retake}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                🔄 {language === "mr" ? "पुन्हा घ्या" : "Retake"}
              </button>
            )}
          </div>
        </div>

        {/* Comparison Section */}
        <div className="w-full md:w-48">
          <p className="text-xs text-gray-600 mb-2 text-center">
            {language === "mr" ? "अपलोड केलेला फोटो" : "Uploaded Photo"}
          </p>
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-[3/4] border-2 border-gray-300">
            {uploadedPhoto ? (
              <img 
                src={uploadedPhoto} 
                alt="Uploaded photo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center p-2">
                {language === "mr" ? "फोटो अपलोड केलेला नाही" : "No photo uploaded"}
              </div>
            )}
          </div>
          
          {/* Match Indicator */}
          {captured && uploadedPhoto && (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-center">
              <span className="text-green-700 text-xs font-medium">
                ✓ {language === "mr" ? "पडताळणीसाठी तयार" : "Ready for verification"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instructions */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h5 className="font-medium text-yellow-800 text-sm mb-2">
          {language === "mr" ? "सूचना:" : "Instructions:"}
        </h5>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• {language === "mr" ? "चांगल्या प्रकाशात बसा" : "Sit in good lighting"}</li>
          <li>• {language === "mr" ? "चेहरा मध्यभागी ठेवा" : "Keep your face centered"}</li>
          <li>• {language === "mr" ? "चष्मा काढा (असल्यास)" : "Remove glasses if wearing"}</li>
          <li>• {language === "mr" ? "पार्श्वभूमी साधी असावी" : "Plain background preferred"}</li>
        </ul>
      </div>
    </div>
  );
}