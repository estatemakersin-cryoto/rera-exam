"use client";

import Navbar from "@/components/Navbar";
import SmartCTA from "@/components/SmartCTA";
import Link from "next/link";

// ============================================
// CONSTANTS
// ============================================

const EXAM_FORMAT = [
  { icon: "📝", title: "50 MCQs", subtitle: "Multiple Choice", bg: "bg-blue-50" },
  { icon: "⏱️", title: "60 Minutes", subtitle: "Total Duration", bg: "bg-purple-50" },
  { icon: "💯", title: "100 Marks", subtitle: "2 marks each", bg: "bg-green-50" },
  { icon: "✅", title: "40% Pass", subtitle: "No Negative Marking", bg: "bg-yellow-50" },
];

const FEATURES = [
  { icon: "📘", title: "Complete Syllabus", text: "All 11 MahaRERA chapters covered comprehensively", bg: "bg-green-50" },
  { icon: "📝", title: "50 MCQs Each Test", text: "Progressive difficulty from easy to hard", bg: "bg-yellow-50" },
  { icon: "⏱️", title: "60-Min Timer", text: "Real exam simulation with auto-submit", bg: "bg-red-50" },
  { icon: "🌐", title: "English + मराठी", text: "Instant language toggle anytime", bg: "bg-blue-50" },
  { icon: "📚", title: "Revision Notes", text: "Topics, FAQs, Key Points & Cases", bg: "bg-purple-50" },
  { icon: "📊", title: "Result Analysis", text: "Detailed performance tracking & weak areas", bg: "bg-orange-50" },
];

const ESTATEMAKERS_SERVICES = [
  { icon: "🤝", text: "Agent Networking" },
  { icon: "📄", text: "Smart Proposals" },
  { icon: "🏗️", text: "Redevelopment Projects" },
  { icon: "🏢", text: "Builder Connect" },
  { icon: "📱", text: "B2C Lead Flow" },
  { icon: "🌐", text: "Agent Websites" },
];

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-8 md:py-10 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            🚨 Mandatory Certification for All Real Estate Agents
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
            MahaRERA Certificate of Competency (COC)
          </h1>

          <h2 className="text-2xl font-bold mb-3 text-yellow-300">
            Exam Preparation by <span className="underline">EstateMakers</span>
          </h2>

          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Maharashtra&apos;s Leading Preparation Platform for Agents &amp; Developers
            <br />
            <span className="font-semibold">
              Includes Full Syllabus • Revision • Mock Tests • English + Marathi
            </span>
          </p>

          {/* SMART CTA */}
          <div className="flex justify-center items-center mt-8">
            <SmartCTA
              guestText="Start Preparation – ₹350"
              guestHref="/register"
              userText="Continue Preparation"
              userHref="/rera-exam/dashboard"
              className="px-8 py-4 text-lg"
              variant="primary"
            />
          </div>
        </div>
      </section>

      {/* WHAT IS MahaRERA COC */}
      <section className="py-10 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            What is MahaRERA Certificate of Competency?
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-red-900 mb-3">
                ⚠️ Mandatory Requirement
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✓</span>
                  Required for MahaRERA agent registration
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✓</span>
                  Without COC: Cannot legally practice as an agent
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✓</span>
                  Penalties apply for non-compliance
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-3">
                ✅ Certificate Benefits
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Valid for 5 years (renewable)
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Recognized across Maharashtra
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Improves credibility with clients & developers
                </li>
              </ul>
            </div>
          </div>

          {/* Exam Format */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXAM_FORMAT.map((item) => (
              <div key={item.title} className={`${item.bg} p-4 rounded-lg text-center`}>
                <div className="text-3xl mb-1">{item.icon}</div>
                <div className="font-bold">{item.title}</div>
                <div className="text-xs text-gray-600">{item.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING – SINGLE PLAN */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-purple-200 p-6 md:p-8">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              💎 FULL ACCESS
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-2">
              MahaRERA Exam Preparation – Premium Plan
            </h3>

            <div className="text-4xl md:text-5xl font-extrabold text-purple-600 mb-4">
              ₹350
            </div>

            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li>✓ Unlimited Revision (All 11 chapters)</li>
              <li>✓ All 2 Mock Tests unlocked immediately</li>
              <li>✓ English + Marathi Language Toggle</li>
              <li>✓ 150 days full validity</li>
            </ul>

            {/* SMART CTA */}
            <SmartCTA
              guestText="Buy Premium – ₹350"
              guestHref="/register"
              userText="Go to Dashboard"
              userHref="/rera-exam/dashboard"
              className="block text-center w-full px-6 py-3"
              variant="primary"
            />
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Choose Our Platform?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((item) => (
            <div key={item.title} className={`p-6 rounded-xl shadow-md ${item.bg} text-center`}>
              <div className="text-5xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-xl mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ESTATEMAKERS PLATFORM BANNER */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              🚀 EstateMakers.in
            </h3>
            <p className="text-lg md:text-xl font-bold text-yellow-300">
              End-to-End Business Solutions for Estate Agents
            </p>
          </div>

          {/* Services Grid */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6">
            {ESTATEMAKERS_SERVICES.map((item) => (
              <div 
                key={item.text}
                className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium"
              >
                {item.icon} {item.text}
              </div>
            ))}
          </div>

          {/* Tagline */}
          <p className="text-center text-purple-100 text-sm md:text-base mb-6">
            The Complete Real Estate Business Platform for Maharashtra Agents
          </p>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Join Waitlist – Launching Soon
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-6 text-sm">
            <div>
              <h3 className="font-bold text-white mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-white">About Us</Link>
                </li>
                <li>
                  <Link href="/agent-guide" className="hover:text-white">Agent Guide</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">Contact Us</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">For Students</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/register" className="hover:text-white">Register</Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">Login</Link>
                </li>
                <li>
                  <Link href="/rera-exam/revision" className="hover:text-white">Revision Center</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-white">Refund Policy</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 text-center text-sm">
            <p className="mb-2">
              Designed by Certified MahaRERA Trainer | 5,000+ Agents Trained
            </p>
            <p>© 2025 EstateMakers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}