'use client';

import { useLanguage } from "@/app/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";
import { useState } from "react";

interface ChapterTopic {
  titleEn: string;
  titleMr: string;
  isImportant?: boolean;
}

interface ChapterIndex {
  chapterNumber: number;
  titleEn: string;
  titleMr: string;
  topics: ChapterTopic[];
}

export default function ChapterIndexPage() {
  const { language, setLanguage } = useLanguage();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);

  // Complete MahaRERA Syllabus Structure
  const chapters: ChapterIndex[] = [
    {
      chapterNumber: 1,
      titleEn: "Introduction to RERA",
      titleMr: "रेरा परिचय",
      topics: [
        { titleEn: "Background & objectives of RERA", titleMr: "रेरा ची पार्श्वभूमी आणि उद्दिष्टे" },
        { titleEn: "Need for regulation", titleMr: "नियमन आवश्यकता" },
        { titleEn: "Applicability of the Act", titleMr: "कायद्याची लागूता" },
        { titleEn: "Key features of RERA", titleMr: "रेरा ची मुख्य वैशिष्ट्ये" },
        { titleEn: "Central vs State RERA", titleMr: "केंद्रीय विरुद्ध राज्य रेरा" },
      ],
    },
    {
      chapterNumber: 2,
      titleEn: "Definitions",
      titleMr: "व्याख्या",
      topics: [
        { titleEn: "Promoter", titleMr: "प्रवर्तक", isImportant: true },
        { titleEn: "Allottee", titleMr: "वाटपधारक", isImportant: true },
        { titleEn: "Real Estate Project", titleMr: "रिअल इस्टेट प्रकल्प", isImportant: true },
        { titleEn: "Real Estate Agent", titleMr: "रिअल इस्टेट एजंट", isImportant: true },
        { titleEn: "Carpet Area", titleMr: "कार्पेट क्षेत्र", isImportant: true },
        { titleEn: "Common Areas", titleMr: "सामान्य क्षेत्रे", isImportant: true },
        { titleEn: "Apartment", titleMr: "अपार्टमेंट" },
        { titleEn: "Completion Certificate", titleMr: "पूर्णता प्रमाणपत्र" },
        { titleEn: "Occupancy Certificate", titleMr: "व्यापणुकी प्रमाणपत्र" },
      ],
    },
    {
      chapterNumber: 3,
      titleEn: "Registration of Projects",
      titleMr: "प्रकल्पांची नोंदणी",
      topics: [
        { titleEn: "Mandatory registration requirements", titleMr: "अनिवार्य नोंदणी आवश्यकता", isImportant: true },
        { titleEn: "Exemptions from registration", titleMr: "नोंदणीतून सूट" },
        { titleEn: "Documents required for registration", titleMr: "नोंदणीसाठी आवश्यक कागदपत्रे" },
        { titleEn: "Application process", titleMr: "अर्ज प्रक्रिया" },
        { titleEn: "Registration fees", titleMr: "नोंदणी शुल्क" },
        { titleEn: "Validity period of registration", titleMr: "नोंदणीचा वैधता कालावधी" },
        { titleEn: "Extension of registration", titleMr: "नोंदणीचा विस्तार" },
      ],
    },
    {
      chapterNumber: 4,
      titleEn: "Registration of Real Estate Agents",
      titleMr: "रिअल इस्टेट एजंटची नोंदणी",
      topics: [
        { titleEn: "Who needs to register", titleMr: "कोणाला नोंदणी आवश्यक आहे", isImportant: true },
        { titleEn: "Registration process for agents", titleMr: "एजंटसाठी नोंदणी प्रक्रिया" },
        { titleEn: "Documents required", titleMr: "आवश्यक कागदपत्रे" },
        { titleEn: "Registration fees", titleMr: "नोंदणी शुल्क" },
        { titleEn: "Validity of registration", titleMr: "नोंदणीची वैधता" },
        { titleEn: "Renewal process", titleMr: "नूतनीकरण प्रक्रिया" },
      ],
    },
    {
      chapterNumber: 5,
      titleEn: "Functions and Duties of Promoters",
      titleMr: "प्रवर्तकांची कार्ये आणि कर्तव्ये",
      topics: [
        { titleEn: "Obligations before booking", titleMr: "बुकिंगपूर्वी जबाबदाऱ्या", isImportant: true },
        { titleEn: "Disclosures to be made", titleMr: "करावयाची प्रकटीकरणे", isImportant: true },
        { titleEn: "Advertisement guidelines", titleMr: "जाहिरात मार्गदर्शक तत्त्वे" },
        { titleEn: "Model agreement for sale", titleMr: "विक्रीसाठी नमुना करार" },
        { titleEn: "Carpet area obligations", titleMr: "कार्पेट क्षेत्र जबाबदाऱ्या" },
        { titleEn: "Timeline compliance", titleMr: "वेळापत्रक अनुपालन" },
        { titleEn: "Quality standards", titleMr: "गुणवत्ता मानके" },
      ],
    },
    {
      chapterNumber: 6,
      titleEn: "Rights and Duties of Allottees",
      titleMr: "वाटपधारकांचे अधिकार आणि कर्तव्ये",
      topics: [
        { titleEn: "Right to information", titleMr: "माहितीचा अधिकार", isImportant: true },
        { titleEn: "Right to timely possession", titleMr: "वेळेवर ताब्याचा अधिकार", isImportant: true },
        { titleEn: "Right to refund", titleMr: "परतावा मिळण्याचा अधिकार", isImportant: true },
        { titleEn: "Grievance redressal", titleMr: "तक्रार निवारण" },
        { titleEn: "Association formation rights", titleMr: "संघटना स्थापनेचे अधिकार" },
        { titleEn: "Payment obligations", titleMr: "पेमेंट जबाबदाऱ्या" },
      ],
    },
    {
      chapterNumber: 7,
      titleEn: "Functions and Duties of Real Estate Agents",
      titleMr: "रिअल इस्टेट एजंटची कार्ये आणि कर्तव्ये",
      topics: [
        { titleEn: "Professional conduct", titleMr: "व्यावसायिक आचरण", isImportant: true },
        { titleEn: "Disclosure obligations", titleMr: "प्रकटीकरण जबाबदाऱ्या", isImportant: true },
        { titleEn: "Commission guidelines", titleMr: "कमिशन मार्गदर्शक तत्त्वे" },
        { titleEn: "Dealing only with registered projects", titleMr: "केवळ नोंदणीकृत प्रकल्पांशी व्यवहार" },
        { titleEn: "Maintaining records", titleMr: "नोंदी राखणे" },
        { titleEn: "Insurance requirements", titleMr: "विमा आवश्यकता" },
      ],
    },
    {
      chapterNumber: 8,
      titleEn: "Establishment of Regulatory Authority",
      titleMr: "नियामक प्राधिकरणाची स्थापना",
      topics: [
        { titleEn: "Structure of MahaRERA", titleMr: "महारेरा रचना" },
        { titleEn: "Powers and functions", titleMr: "अधिकार आणि कार्ये" },
        { titleEn: "Chairperson and members", titleMr: "अध्यक्ष आणि सदस्य" },
        { titleEn: "Administrative setup", titleMr: "प्रशासकीय सेटअप" },
      ],
    },
    {
      chapterNumber: 9,
      titleEn: "Appellate Tribunal",
      titleMr: "अपीलीय न्यायाधिकरण",
      topics: [
        { titleEn: "Establishment and composition", titleMr: "स्थापना आणि रचना" },
        { titleEn: "Powers of the tribunal", titleMr: "न्यायाधिकरणाचे अधिकार" },
        { titleEn: "Appeal process", titleMr: "अपील प्रक्रिया", isImportant: true },
        { titleEn: "Time limits for appeals", titleMr: "अपीलसाठी कालमर्यादा", isImportant: true },
        { titleEn: "Orders and enforcement", titleMr: "आदेश आणि अंमलबजावणी" },
      ],
    },
    {
      chapterNumber: 10,
      titleEn: "Offences and Penalties",
      titleMr: "गुन्हे आणि दंड",
      topics: [
        { titleEn: "Offences by promoters", titleMr: "प्रवर्तकांचे गुन्हे", isImportant: true },
        { titleEn: "Offences by agents", titleMr: "एजंटचे गुन्हे", isImportant: true },
        { titleEn: "Offences by allottees", titleMr: "वाटपधारकांचे गुन्हे" },
        { titleEn: "Penalties and imprisonment", titleMr: "दंड आणि तुरुंगवास", isImportant: true },
        { titleEn: "Compounding of offences", titleMr: "गुन्ह्यांचे समायोजन" },
      ],
    },
    {
      chapterNumber: 11,
      titleEn: "Central Advisory Council",
      titleMr: "केंद्रीय सल्लागार परिषद",
      topics: [
        { titleEn: "Composition and functions", titleMr: "रचना आणि कार्ये" },
        { titleEn: "Role in policy making", titleMr: "धोरण तयार करण्यात भूमिका" },
        { titleEn: "Coordination mechanism", titleMr: "समन्वय यंत्रणा" },
      ],
    },
    {
      chapterNumber: 12,
      titleEn: "Miscellaneous Provisions",
      titleMr: "इतर तरतुदी",
      topics: [
        { titleEn: "Bar of jurisdiction", titleMr: "अधिकार क्षेत्राचा प्रतिबंध" },
        { titleEn: "Overriding effect", titleMr: "अधिभावी प्रभाव" },
        { titleEn: "Transition provisions", titleMr: "संक्रमण तरतुदी" },
        { titleEn: "Amendment procedures", titleMr: "दुरुस्ती प्रक्रिया" },
        { titleEn: "Rule-making powers", titleMr: "नियम बनवण्याचे अधिकार" },
      ],
    },
  ];

  const toggleChapter = (chapterNumber: number) => {
    setExpandedChapter(expandedChapter === chapterNumber ? null : chapterNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-6 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">📚 MahaRERA Exam Syllabus</h1>
            <p className="text-blue-200 text-sm">
              {language === 'en' 
                ? 'Complete chapter-wise breakdown with all topics' 
                : 'सर्व विषयांसह संपूर्ण अध्यायनिहाय विभाजन'}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <Link href="/dashboard" className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition">
              ← {language === 'en' ? 'Dashboard' : 'डॅशबोर्ड'}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Introduction Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📖</div>
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                {language === 'en' ? 'Exam Coverage' : 'परीक्षा कव्हरेज'}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {language === 'en' 
                  ? 'The MahaRERA exam consists of 12 chapters covering all aspects of the Real Estate (Regulation and Development) Act, 2016. Click on any chapter below to see detailed topics. Topics marked with ⭐ are particularly important for the exam.'
                  : 'महारेरा परीक्षेमध्ये रिअल इस्टेट (नियमन आणि विकास) कायदा, 2016 च्या सर्व पैलूंचा समावेश असलेले 12 अध्याय आहेत. तपशीलवार विषय पाहण्यासाठी खालील कोणत्याही अध्यायावर क्लिक करा. ⭐ ने चिन्हांकित विषय परीक्षेसाठी विशेषतः महत्त्वाचे आहेत.'}
              </p>
            </div>
          </div>
        </div>

        {/* Chapter Cards */}
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.chapterNumber} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              {/* Chapter Header - Clickable */}
              <button
                onClick={() => toggleChapter(chapter.chapterNumber)}
                className="w-full text-left px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {chapter.chapterNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {language === 'en' ? chapter.titleEn : chapter.titleMr}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {chapter.topics.length} {language === 'en' ? 'topics' : 'विषय'}
                      {chapter.topics.some(t => t.isImportant) && (
                        <span className="ml-2 text-yellow-600">
                          • {chapter.topics.filter(t => t.isImportant).length} ⭐ {language === 'en' ? 'important' : 'महत्त्वाचे'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-3xl text-blue-600 transition-transform duration-300" style={{
                  transform: expandedChapter === chapter.chapterNumber ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </div>
              </button>

              {/* Expanded Topics */}
              {expandedChapter === chapter.chapterNumber && (
                <div className="px-6 pb-6 pt-2 bg-gradient-to-b from-blue-50/50 to-white border-t border-blue-100">
                  <div className="space-y-2 mt-3">
                    {chapter.topics.map((topic, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all group"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 text-xs font-semibold group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">
                            {language === 'en' ? topic.titleEn : topic.titleMr}
                            {topic.isImportant && (
                              <span className="ml-2 text-yellow-500 text-lg">⭐</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-3">
            {language === 'en' ? 'Ready to Start Preparing?' : 'तयारी सुरू करायला तयार आहात?'}
          </h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Access comprehensive revision notes, practice questions, and mock tests for all 12 chapters'
              : 'सर्व 12 अध्यायांसाठी सर्वसमावेशक पुनरावलोकन नोट्स, सराव प्रश्न आणि मॉक टेस्ट मिळवा'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/revision"
              className="px-8 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 shadow-lg transition-all hover:scale-105"
            >
              📘 {language === 'en' ? 'Start Revision' : 'पुनरावलोकन सुरू करा'}
            </Link>
            <Link
              href="/mock-test"
              className="px-8 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 shadow-lg transition-all hover:scale-105"
            >
              ✍️ {language === 'en' ? 'Take Mock Test' : 'मॉक टेस्ट घ्या'}
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{chapters.length}</div>
            <div className="text-sm text-gray-600">
              {language === 'en' ? 'Total Chapters' : 'एकूण अध्याय'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {chapters.reduce((sum, ch) => sum + ch.topics.length, 0)}
            </div>
            <div className="text-sm text-gray-600">
              {language === 'en' ? 'Total Topics' : 'एकूण विषय'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {chapters.reduce((sum, ch) => sum + ch.topics.filter(t => t.isImportant).length, 0)}
            </div>
            <div className="text-sm text-gray-600">
              {language === 'en' ? 'Important Topics ⭐' : 'महत्त्वाचे विषय ⭐'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}