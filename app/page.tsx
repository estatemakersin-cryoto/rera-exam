"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-12 md:py-16 px-4 shadow-lg">
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

          {/* Single CTA */}
          <div className="flex justify-center items-center mt-8">
            <Link
              href="/register"
              className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg text-lg shadow-xl transition transform hover:scale-105"
            >
              Start Preparation – ₹750
            </Link>
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
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-1">📝</div>
              <div className="font-bold">50 MCQs</div>
              <div className="text-xs text-gray-600">Multiple Choice</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-1">⏱️</div>
              <div className="font-bold">60 Minutes</div>
              <div className="text-xs text-gray-600">Total Duration</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-1">💯</div>
              <div className="font-bold">100 Marks</div>
              <div className="text-xs text-gray-600">2 marks each</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-1">✅</div>
              <div className="font-bold">40% Pass</div>
              <div className="text-xs text-gray-600">No Negative Marking</div>
            </div>
          </div>
        </div>
      </section>

{/* PRICING – TWO PLANS ONLY */}
<section className="bg-gray-50 py-12">
        <div className="grid md:grid-cols-1 gap-6">
          {/* Premium Plan 500 */}
          <div className="bg-white rounded-2xl shadow-xl border border-purple-200 p-6 md:p-8 flex flex-col">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-4 self-start">
              💎 FULL ACCESS
            </div>

            <h3 className="text-xl md:text-2xl font-bold mb-2">
              MahaRERA Exam Preparation – Premium Plan
            </h3>

            <div className="text-4xl md:text-5xl font-extrabold text-purple-600 mb-4">
              ₹750
            </div>

            <ul className="space-y-2 text-sm text-gray-700 mb-6 flex-1">
              <li>✓ Unlimited Revision (All 11 chapters)</li>
              <li>✓ All 5 Mock Tests unlocked immediately</li>
              <li>✓ English + Marathi Language Toggle</li>
              <li>✓ No referrals or top-up required</li>
              <li>✓ 100 days full validity</li>
            </ul>

            <Link
              href="/register"
              className="block text-center px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition"
            >
              Buy Premium – ₹750
            </Link>
          </div>
        </div>
      </section>

      {/* HOW TO REGISTER & APPEAR – 11 STEPS, 2 COLUMNS */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            How to Register &amp; Appear for MahaRERA Exam
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                step: 1,
                title: "Complete MahaRERA training",
                text: "From authorised institute only. Contact us for course details.",
              },
              {
                step: 2,
                title: "Save your training certificate",
                text: "Needed for exam registration.",
              },
              {
                step: 3,
                title: "Monitor exam announcement",
                text: "We will publish notifications on our website.",
              },
              {
                step: 4,
                title: "Submit online application",
                text: "Fill all personal & qualification details carefully.",
              },
              {
                step: 5,
                title: "Pay exam fee – ₹1,500",
                text: "Pay online using allowed modes.",
              },
              {
                step: 6,
                title: "Preserve form & receipt",
                text: "Keep a copy of application and payment receipt.",
              },
              {
                step: 7,
                title: "Make revision & mock-tests on EstateMakers.in",
                text: "Practice all chapters and full-length tests.",
              },
              {
                step: 8,
                title: "Watch for hall-ticket email",
                text: "We will also announce on our website.",
              },
              {
                step: 9,
                title: "Appear for exam",
                text: "Go to exam centre with hall ticket & photo ID.",
              },
              {
                step: 10,
                title: "Wait for result",
                text: "Result will be declared by MahaRERA.",
              },
              {
                step: 11,
                title: "Download your Certificate of Competency",
                text: "Use it for agent registration. Valid for 5 years.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-700">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Choose Our Platform?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl shadow-md bg-green-50 text-center">
            <div className="text-5xl mb-3">📘</div>
            <h4 className="font-bold text-xl mb-2">Complete Syllabus</h4>
            <p className="text-gray-600 text-sm">
              All 11 MahaRERA chapters covered comprehensively
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-md bg-yellow-50 text-center">
            <div className="text-5xl mb-3">📝</div>
            <h4 className="font-bold text-xl mb-2">50 MCQs Each Test</h4>
            <p className="text-gray-600 text-sm">
              Progressive difficulty from easy to hard
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-md bg-red-50 text-center">
            <div className="text-5xl mb-3">⏱️</div>
            <h4 className="font-bold text-xl mb-2">60-Min Timer</h4>
            <p className="text-gray-600 text-sm">
              Real exam simulation with auto-submit
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-md bg-blue-50 text-center">
            <div className="text-5xl mb-3">🌐</div>
            <h4 className="font-bold text-xl mb-2">English + मराठी</h4>
            <p className="text-gray-600 text-sm">
              Instant language toggle anytime
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-md bg-purple-50 text-center">
            <div className="text-5xl mb-3">📚</div>
            <h4 className="font-bold text-xl mb-2">Revision Notes</h4>
            <p className="text-gray-600 text-sm">
              Topics, FAQs, Key Points &amp; Cases
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-md bg-orange-50 text-center">
            <div className="text-5xl mb-3">📊</div>
            <h4 className="font-bold text-xl mb-2">Result Analysis</h4>
            <p className="text-gray-600 text-sm">
              Detailed performance tracking &amp; weak areas
            </p>
          </div>
        </div>
      </section>

      {/* OFFICIAL PORTALS */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            🌐 Official MahaRERA Portals
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
              <div className="text-4xl mb-3 text-center">📚</div>
              <h3 className="text-xl font-bold text-center mb-3 text-blue-900">
                maharera.maharashtra.gov.in
              </h3>
              <p className="text-center text-gray-700 mb-3 font-semibold text-sm">
                Agent Training &amp; COC Exam Portal
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>COC Exam announcements &amp; registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Certificate downloads</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6">
              <div className="text-4xl mb-3 text-center">⚖️</div>
              <h3 className="text-xl font-bold text-center mb-3 text-green-900">
                maharerait.maharashtra.gov.in
              </h3>
              <p className="text-center text-gray-700 mb-3 font-semibold text-sm">
                MahaRERA Compliance Portal
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Agent registrations (after COC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Project registrations &amp; compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* URGENCY SECTION */}
      <section className="py-12 bg-red-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white border-4 border-red-500 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-red-900">
              ⚠️ Don&apos;t Wait – Start Preparing Today!
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="text-xl">📅</div>
                  <div>
                    <p className="font-bold">Exams only 2–3 times per year</p>
                    <p className="text-gray-600">
                      Miss one = Wait several months
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-xl">⏰</div>
                  <div>
                    <p className="font-bold">30–45 days notice only</p>
                    <p className="text-gray-600">
                      Not enough time to prepare from scratch
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-xl">💰</div>
                  <div>
                    <p className="font-bold">Each exam costs money</p>
                    <p className="text-gray-600">
                      Failed attempt = wasted money + time
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="text-xl">⚖️</div>
                  <div>
                    <p className="font-bold">
                      Operating without COC is illegal
                    </p>
                    <p className="text-gray-600">
                      Penalties + possible business closure
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-xl">🎯</div>
                  <div>
                    <p className="font-bold">Limited exam centre seats</p>
                    <p className="text-gray-600">
                      Centres fill up fast when announced
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-xl">✅</div>
                  <div>
                    <p className="font-bold">Be ready when announced</p>
                    <p className="text-gray-600">
                      Start preparing now, register confidently
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="inline-block px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-lg shadow-xl transition transform hover:scale-105"
              >
                Start Your Preparation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ESTATEMAKERS BANNER */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-wide">
            🚀 EstateMakers Platform Launching Soon
          </h3>
          <p className="text-base md:text-lg text-purple-100 mb-2">
            Networking • Proposals • Redevelopment • Builder Connect • B2C Lead
            Flow
          </p>
          <p className="text-sm text-purple-200">
            The Complete Real Estate Business Platform for Maharashtra Agents
          </p>
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
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">For Students</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/register" className="hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/revision" className="hover:text-white">
                    Revision Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-white">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 text-center text-sm">
            <p className="mb-2">
              Designed by Certified MahaRERA Trainer | 5,000+ Agents Trained
            </p>
            <p>© 2024 EstateMakers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
