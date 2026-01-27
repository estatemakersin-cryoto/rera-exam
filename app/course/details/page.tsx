// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/course/details/page.tsx
// MahaRERA Agent Training Course Details Page
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Settings {
  trainingCourseFee: number;
  trainingCourseName: string;
}

export default function CourseDetailsPage() {
  const [settings, setSettings] = useState<Settings>({
    trainingCourseFee: 5900,
    trainingCourseName: "MahaRERA Agent Training Course",
  });

  useEffect(() => {
    fetch("/api/public/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.trainingCourseFee) {
          setSettings({
            trainingCourseFee: data.trainingCourseFee,
            trainingCourseName: data.trainingCourseName || "MahaRERA Agent Training Course",
          });
        }
      })
      .catch(console.error);
  }, []);

  const whatsappEnquiry = `https://wa.me/918850150878?text=${encodeURIComponent(
    `Hi, I'm interested in the MahaRERA Agent Training Course (₹${settings.trainingCourseFee}/-). Please share more details.`
  )}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/dashboard" className="text-green-200 hover:text-white text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{settings.trainingCourseName}</h1>
          <p className="text-green-200 mt-1">Become a Certified MahaRERA Real Estate Agent</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About Course */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📚 About This Course</h2>
              <p className="text-gray-600 mb-4">
                This comprehensive training program prepares you for the MahaRERA Real Estate Agent 
                Certification Examination. Upon successful completion, you'll receive a training 
                certificate required to apply for the COC (Certificate of Competence) exam.
              </p>
              <p className="text-gray-600">
                Our course is designed by experienced real estate professionals and MahaRERA certified 
                trainers who have trained over 5000+ agents across Maharashtra.
              </p>
            </div>

            {/* What You'll Learn */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📖 What You'll Learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "RERA Act 2016 - Complete Overview",
                  "MahaRERA Rules & Regulations",
                  "Rights & Duties of Agents",
                  "Registration Process & Documentation",
                  "Penalties & Offences",
                  "Real Estate Transactions",
                  "Agreement for Sale",
                  "Carpet Area Calculation",
                  "Allotment Letter & Conveyance",
                  "Appellate Tribunal & Procedures",
                  "Model Code of Conduct",
                  "Case Studies & Practical Examples",
                ].map((topic, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 Course Features</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: "⏱️", title: "20 Hours Training", desc: "Comprehensive classroom/online sessions" },
                  { icon: "📜", title: "Training Certificate", desc: "MahaRERA approved certificate" },
                  { icon: "🌐", title: "Bilingual Content", desc: "Available in English & Marathi" },
                  { icon: "📚", title: "Study Material", desc: "Complete notes & revision guides" },
                  { icon: "📝", title: "Mock Tests", desc: "Practice tests with real exam pattern" },
                  { icon: "👨‍🏫", title: "Expert Trainers", desc: "Learn from certified professionals" },
                  { icon: "💬", title: "Doubt Clearing", desc: "WhatsApp support for queries" },
                  { icon: "🎓", title: "Exam Guidance", desc: "Complete COC exam preparation" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{feature.title}</p>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">✅ Eligibility Criteria</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Must have passed 10th (SSC) or equivalent examination
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Must be at least 18 years of age
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Must have valid PAN Card
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Must be an Indian citizen
                </li>
              </ul>
            </div>

            {/* Process Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Complete Process to Become Agent</h2>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Complete Training", desc: "Attend 20-hour training program", fee: `₹${settings.trainingCourseFee.toLocaleString("en-IN")}` },
                  { step: 2, title: "Get Training Certificate", desc: "Receive MahaRERA approved certificate", fee: "Included" },
                  { step: 3, title: "Apply for COC Exam", desc: "Register on MahaRERA/TCS iON portal", fee: "₹1,500" },
                  { step: 4, title: "Pass COC Exam", desc: "Score 40% or above in the exam", fee: "-" },
                  { step: 5, title: "Register as Agent", desc: "Apply on MahaRERA portal", fee: "₹11,250" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <span className="text-green-600 font-semibold">{item.fee}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total Investment</span>
                  <span className="text-xl font-bold text-green-600">₹18,650/-</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">*Fees are subject to change as per government norms</p>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">❓ Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: "Who can become a Real Estate Agent?", a: "Any Indian citizen who has passed 10th standard and is above 18 years of age can become a registered real estate agent." },
                  { q: "Is the training certificate mandatory?", a: "Yes, you must complete training from a MahaRERA recognized institute to apply for the COC exam." },
                  { q: "How long is the training valid?", a: "The training certificate is valid for appearing in the COC exam. Once you pass, you can register as an agent." },
                  { q: "What is the exam pattern?", a: "The COC exam has 50 MCQ questions, 60 minutes duration, and requires 40% to pass (20 correct answers)." },
                  { q: "Can I practice before the real exam?", a: "Yes! Our ₹1,000 exam package includes revision notes, mock application form, 3 mock tests, and 30 days free CRM access." },
                ].map((faq, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="font-semibold text-gray-800 mb-1">{faq.q}</p>
                    <p className="text-sm text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Sticky Price Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm">Course Fee</p>
                <div className="text-4xl font-bold text-green-600">
                  ₹{settings.trainingCourseFee.toLocaleString("en-IN")}/-
                </div>
                <p className="text-sm text-gray-500">(Inclusive of GST)</p>
              </div>

              {/* Features Summary */}
              <div className="space-y-2 mb-6">
                {[
                  "20 Hours Training",
                  "Training Certificate",
                  "Study Material",
                  "Bilingual (EN + MR)",
                  "WhatsApp Support",
                  "Exam Guidance",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link
                  href="/course/enroll"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                >
                  🎓 Enroll Now
                </Link>
                <a
                  href="tel:8850150878"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
                >
                  📞 Call: 8850150878
                </a>
                <a
                  href="tel:9699091086"
                  className="flex items-center justify-center gap-2 w-full py-2 text-gray-600 text-sm hover:text-green-600"
                >
                  📞 Alternate: 9699091086
                </a>
              </div>

              {/* Practice Package Promo */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-800 mb-2">📚 Already Trained?</p>
                <p className="text-xs text-purple-700 mb-3">
                  Practice for your COC exam with our mock tests & revision notes.
                </p>
                <Link
                  href="/payment?type=package"
                  className="block w-full py-2 bg-purple-600 text-white text-center rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                >
                  Get Exam Pack - ₹1,000 + 30 Days Free CRM
                </Link>
                <p className="text-xs text-purple-600 mt-2 text-center">
                  ✓ Revision Notes ✓ 2 Mock Tests ✓ Application Form ✓ Admit Card
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EstateMakers. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            MahaRERA Training | Real Estate Agent Certification | Maharashtra
          </p>
        </div>
      </footer>
    </div>
  );
}