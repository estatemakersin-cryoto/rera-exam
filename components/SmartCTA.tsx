"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface SmartCTAProps {
  // Text/URL for non-logged-in users
  guestText: string;
  guestHref: string;
  // Text/URL for logged-in users (optional - defaults to dashboard)
  userText?: string;
  userHref?: string;
  // Styling
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function SmartCTA({
  guestText,
  guestHref,
  userText,
  userHref,
  className = "",
  variant = 'primary',
}: SmartCTAProps) {
  const { isLoading, isLoggedIn, dashboardUrl } = useAuth();

  // Determine what to show based on auth state
  const href = isLoggedIn 
    ? (userHref || dashboardUrl) 
    : guestHref;
    
  const text = isLoggedIn 
    ? (userText || "Go to Dashboard") 
    : guestText;

  // Base styles
  const baseStyles = "inline-block font-bold rounded-lg shadow-xl transition transform hover:scale-105";
  
  // Variant styles
  const variantStyles = {
    primary: "bg-purple-500 hover:bg-purple-600 text-white",
    secondary: "bg-blue-600 hover:bg-blue-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  if (isLoading) {
    // Show skeleton while loading to prevent layout shift
    return (
      <div className={`${baseStyles} ${className} bg-gray-300 animate-pulse`}>
        <span className="invisible">{guestText}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {text}
    </Link>
  );
}