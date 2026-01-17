// ══════════════════════════════════════════════════════════════════════════════
// AGENT GUIDE PAGE
// app/agent-guide/page.tsx
// Public page with collapsible sections showing MahaRERA agent registration guide
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FeeItem {
  key: string;
  label: string;
  amount: number;
}

interface FeesData {
  breakdown: FeeItem[];
  total: number;
}

// Accordion Component
function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-600">{icon}</span>
          <span className="font-semibold text-gray-800 text-left">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="px-6 py-4">{children}</div>}
    </div>
  );
}

// Registration Step Component
function RegistrationStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

// Document Checklist Item
function ChecklistItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-gray-700">{text}</span>
    </li>
  );
}

// FAQ Item
function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <h4 className="font-medium text-gray-800 mb-2">{q}</h4>
      <p className="text-gray-600 text-sm">{a}</p>
    </div>
  );
}

export default function AgentGuidePage() {
  const [fees, setFees] = useState<FeesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFees() {
      try {
        const res = await fetch("/api/public/fees");
        const data = await res.json();
        setFees(data);
      } catch (error) {
        console.error("Failed to load fees:", error);
        // Use defaults
        setFees({
          breakdown: [
            { key: "training_fee", label: "Training Fee (incl. GST)", amount: 5900 },
            { key: "coc_exam_fee", label: "COC Exam Fee", amount: 1500 },
            { key: "rera_registration_fee", label: "MahaRERA Registration Fee", amount: 11250 },
          ],
          total: 18650,
        });
      } finally {
        setLoading(false);
      }
    }
    loadFees();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How to Become a MahaRERA Certified Agent
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Complete guide to register as a Real Estate Agent in Maharashtra under RERA Act 2016
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold">7</div>
              <div className="text-sm text-blue-200 mt-1">Steps</div>
            </div>
            <div className="text-center border-x border-blue-600">
              <div className="text-3xl sm:text-4xl font-bold">
                {loading ? "..." : formatCurrency(fees?.total || 18650)}
              </div>
              <div className="text-sm text-blue-200 mt-1">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold">30</div>
              <div className="text-sm text-blue-200 mt-1">Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {/* Registration Process */}
        <Accordion
          title="Registration Process (7 Steps)"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          defaultOpen
        >
          <div className="space-y-6">
            <RegistrationStep
              number={1}
              title="Complete MahaRERA Agent Training"
              description="Enroll in a 2-day training program from a MahaRERA recognized institute. Training covers RERA Act, rules, and practical aspects."
            />
            <RegistrationStep
              number={2}
              title="Pass COC Examination"
              description="Clear the Certificate of Competence exam conducted by recognized institutes. Minimum 40% marks required to pass."
            />
            <RegistrationStep
              number={3}
              title="Obtain COC Certificate"
              description="After passing the exam, receive your COC certificate from the training institute. Valid for 5 years."
            />
            <RegistrationStep
              number={4}
              title="Create MahaRERA Portal Account"
              description="Register on maharera.mahaonline.gov.in with your mobile number and email ID."
            />
            <RegistrationStep
              number={5}
              title="Fill Agent Registration Form"
              description="Complete the online application form with personal details, address proof, and COC certificate."
            />
            <RegistrationStep
              number={6}
              title="Pay Registration Fees"
              description="Pay the registration fee of ₹10,000 + portal charges via online payment gateway."
            />
            <RegistrationStep
              number={7}
              title="Receive Agent Registration Number"
              description="After verification, receive your unique MahaRERA Agent Registration Number (e.g., A52000XXXXXX)."
            />
          </div>
        </Accordion>

        {/* Benefits */}
        <Accordion
          title="Benefits of RERA Registration"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Legal Protection</h4>
                <p className="text-sm text-gray-600 mt-1">Work legally with developers and buyers under RERA compliance</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Higher Commissions</h4>
                <p className="text-sm text-gray-600 mt-1">Registered agents command better commission rates from developers</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Access to RERA Projects</h4>
                <p className="text-sm text-gray-600 mt-1">Only registered agents can officially work with RERA registered projects</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Avoid Penalties</h4>
                <p className="text-sm text-gray-600 mt-1">Unregistered agents face ₹10,000/day penalty under RERA Act</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg sm:col-span-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Professional Credibility</h4>
                <p className="text-sm text-gray-600 mt-1">Build trust with clients by displaying your official MahaRERA registration number on all marketing materials</p>
              </div>
            </div>
          </div>
        </Accordion>

        {/* Documents Required */}
        <Accordion
          title="Documents Required"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            <ul className="space-y-2">
              <ChecklistItem text="Aadhaar Card (for KYC)" />
              <ChecklistItem text="PAN Card" />
              <ChecklistItem text="Passport Size Photo" />
              <ChecklistItem text="Address Proof" />
              <ChecklistItem text="Mobile Number (linked to Aadhaar)" />
            </ul>
            <ul className="space-y-2">
              <ChecklistItem text="Email ID" />
              <ChecklistItem text="COC Certificate (from training)" />
              <ChecklistItem text="Educational Qualification Proof" />
              <ChecklistItem text="Bank Account Details" />
              <ChecklistItem text="Digital Signature (optional)" />
            </ul>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> All documents should be clear scanned copies in PDF/JPG format. Maximum file size: 2MB each.
            </p>
          </div>
        </Accordion>

        {/* Fees Breakdown */}
        <Accordion
          title="Fees Breakdown"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading fees...</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fee Type
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {fees?.breakdown.map((fee) => (
                    <tr key={fee.key}>
                      <td className="px-4 py-3 text-sm text-gray-700">{fee.label}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(fee.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      Total Investment
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-700 text-right">
                      {formatCurrency(fees?.total || 18650)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-3">
            * Fees are subject to change. Last updated from official sources.
          </p>
        </Accordion>

        {/* FAQ */}
        <Accordion
          title="FAQ - Compliance & Management"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <div className="space-y-4">
            <FAQItem
              q="How long is the agent registration valid?"
              a="MahaRERA agent registration is valid for 5 years from the date of registration. You need to renew it before expiry by paying the renewal fee."
            />
            <FAQItem
              q="Can I work in other states with MahaRERA registration?"
              a="No, MahaRERA registration is valid only for Maharashtra. Each state has its own RERA authority and you need separate registration for each state."
            />
            <FAQItem
              q="What happens if I don't renew my registration?"
              a="If you continue working as an agent without valid registration, you can be penalized ₹10,000 per day under RERA Act. Always renew before expiry."
            />
            <FAQItem
              q="Can I register as both individual and company?"
              a="Yes, you can register as an individual agent or as a company/LLP. Company registration requires additional documents like incorporation certificate, PAN of company, etc."
            />
            <FAQItem
              q="Is training mandatory for registration?"
              a="Yes, completing training from a MahaRERA recognized institute and passing the COC exam is mandatory before you can apply for agent registration."
            />
            <FAQItem
              q="How can I check if my registration is active?"
              a="Visit maharera.mahaonline.gov.in, go to 'Search Project/Agent' section, and search using your registration number or name."
            />
          </div>
        </Accordion>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-center text-white mt-8">
          <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Practice with our mock tests to prepare for the COC exam, or find a training institute near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mock-test"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Practice Mock Test
            </Link>
            <Link
              href="/institutes"
              className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors border border-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Find Training Institute
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">
            This guide is for informational purposes only. For official information, visit{" "}
            <a
              href="https://maharera.mahaonline.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              maharera.mahaonline.gov.in
            </a>
          </p>
          <p className="text-xs mt-4">© {new Date().getFullYear()} EstateMakers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
