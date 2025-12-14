import "./globals.css";
import { LanguageProvider } from "@/app/providers/LanguageProvider";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MahaRERA Training & Compliance Platform",
  description: "Mock Test, Revision & Training System for MahaRERA Agents by EstateMakers",
  keywords: "MahaRERA, Real Estate Agent, Exam, Mock Test, Revision, EstateMakers",
  authors: [{ name: "EstateMakers" }],
  viewport: "width=device-width, initial-scale=1",
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
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}