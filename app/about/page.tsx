import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold">MahaRERA MCQ System</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">About MahaRERA MCQ Certification</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">What is MahaRERA?</h2>
          <p className="text-gray-700 mb-4">
            The Real Estate (Regulation and Development) Act, 2016 (RERA) was enacted to regulate 
            and promote the real estate sector in India. MahaRERA is the regulatory authority for 
            the state of Maharashtra, ensuring transparency and accountability in real estate transactions.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Certification Examination</h2>
          <p className="text-gray-700 mb-4">
            Our MCQ-based certification examination is designed for real estate agents who wish to 
            practice in Maharashtra. The examination covers 10 comprehensive chapters of MahaRERA 
            regulations and guidelines.
          </p>
          
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3">Examination Format:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Total Questions: 50 Multiple Choice Questions</li>
              <li>Total Marks: 100 (2 marks per question)</li>
              <li>Duration: 60 minutes</li>
              <li>Passing Marks: 40%</li>
              <li>No Negative Marking</li>
              <li>Three Difficulty Levels: Easy, Moderate, Hard</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3">10 Chapters Covered:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Introduction to RERA</li>
              <li>Registration Process</li>
              <li>Project Registration</li>
              <li>Agent Registration</li>
              <li>Rights and Obligations</li>
              <li>Complaints and Disputes</li>
              <li>Penalties and Offences</li>
              <li>Appellate Tribunal</li>
              <li>Financial Management</li>
              <li>Code of Conduct</li>
            </ol>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Pricing</h2>

          <p className="text-gray-700 mb-2">
            <strong>₹750</strong> – Full Access to Complete MahaRERA Exam Preparation
          </p>

          <ul className="text-gray-700 mb-4 list-disc ml-6 space-y-1">
            <li>Access to all 5 Mock Tests</li>
            <li>Access to all Revision Notes (all 11 chapters)</li>
            <li>English + Marathi Language Toggle</li>
            <li>100 days validity</li>
          </ul>

          <p className="text-sm text-gray-600">
            After completing the payment, all tests and revision content will be activated immediately.
            Results will be declared within 30 days of test submission, and certificates will be issued
            within 30 days of result declaration.
          </p>
        </div>


        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Referral Program</h2>
          <p className="text-gray-700 mb-4">
            Earn free tests by referring friends! Share your unique referral code with friends and 
            colleagues. When they register and complete their payment, you'll receive 1 free test 
            as a reward.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
