import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold">MahaRERA MCQ System</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="text-blue-600 text-2xl mr-4">📧</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email</h3>
                <a 
                  href="mailto:estateMakers.in@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  estateMakers.in@gmail.com
                </a>
                <p className="text-sm text-gray-600 mt-1">
                  We typically respond within 24-48 hours
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-blue-600 text-2xl mr-4">🕐</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Business Hours</h3>
                <p className="text-gray-700">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                <p className="text-gray-700">Saturday: 9:00 AM - 1:00 PM IST</p>
                <p className="text-gray-700">Sunday: Closed</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="text-blue-600 text-2xl mr-4">❓</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Support Topics</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Registration and login issues</li>
                  <li>Payment and billing queries</li>
                  <li>Technical support</li>
                  <li>Examination guidelines</li>
                  <li>Certificate issuance</li>
                  <li>Referral program questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">How do I access my purchased tests?</h3>
              <p className="text-gray-700">
                After successful payment, log in to your dashboard. You'll see your available tests 
                and can start them immediately.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">When will I receive my certificate?</h3>
              <p className="text-gray-700">
                Results are declared within 30 days of test submission. Certificates are issued 
                within 30 days of result declaration.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Can I retake the test if I fail?</h3>
              <p className="text-gray-700">
                Yes, you can purchase additional test attempts. Each package includes 2 test attempts.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">How does the referral program work?</h3>
              <p className="text-gray-700">
                Share your unique referral code with friends. When they register and complete payment, 
                you'll receive 1 free test automatically added to your account.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Is the test available in Marathi?</h3>
              <p className="text-gray-700">
                Yes! All questions and options are available in both English and Marathi. You can 
                toggle between languages during the test using the language switch button.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? Feel free to reach out to us!
          </p>
          <a
            href="mailto:estateMakers.in@gmail.com"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
