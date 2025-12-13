import "./globals.css";
import { LanguageProvider } from "@/app/providers/LanguageProvider";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MahaRERA Training & Compliance Platform",
  description: "Mock Test, Revision & Training System for MahaRERA Agents by EstateMakers",
  keywords: "MahaRERA, Real Estate Agent, Exam, Mock Test, Revision, EstateMakers",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
