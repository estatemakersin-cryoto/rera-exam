import "./globals.css";
import { LanguageProvider } from "@/app/providers/LanguageProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MahaRERA Training & Compliance Platform",
  description: "Mock Test, Revision & Training System for MahaRERA Agents by EstateMakers",
  keywords: "MahaRERA, Real Estate Agent, Exam, Mock Test, Revision, EstateMakers",
  authors: [{ name: "EstateMakers" }],
};

// Separate viewport export
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}