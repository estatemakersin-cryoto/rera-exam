"use client";

interface LanguageToggleProps {
  language: "en" | "mr";
  onLanguageChange: (lang: "en" | "mr") => void;
  className?: string;
}

export default function LanguageToggle({
  language,
  onLanguageChange,
  className = "",
}: LanguageToggleProps) {
  const toggle = () => {
    onLanguageChange(language === "en" ? "mr" : "en");
  };

  return (
    <button
      onClick={toggle}
      className={`px-4 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm text-sm font-semibold hover:bg-gray-100 transition ${className}`}
    >
      {language === "en" ? "English" : "मराठी"}
    </button>
  );
}
