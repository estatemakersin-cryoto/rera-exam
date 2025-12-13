'use client';

import { useLanguage } from "@/app/hooks/useLanguage";
import LanguageToggle from "@/components/LanguageToggle";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RevisionPage() {
  const { language, setLanguage } = useLanguage();

  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Collapsible state
  const [openBlock, setOpenBlock] = useState<number | null>(null);
  const [openQA, setOpenQA] = useState<number | null>(null);

  useEffect(() => {
    fetchChapters();
  }, []);

  useEffect(() => {
    if (selectedChapter) fetchRevisions();
  }, [selectedChapter]);

  const fetchChapters = async () => {
    try {
      const res = await fetch('/api/users/chapters');
      
      if (!res.ok) {
        console.error('Failed to fetch chapters:', res.status);
        return;
      }
      
      const data = await res.json();
      setChapters(data.chapters || []);
      
    } catch (e) {
      console.error('fetchChapters error:', e);
    }
  };

  const fetchRevisions = async () => {
    if (!selectedChapter) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/revision?chapterId=${selectedChapter}`);
      const data = await res.json();
      setRevisions(data.revisions || []);
    } catch (e) {
      console.error('fetchRevisions error:', e);
    }
    setLoading(false);
  };

  const toggleBlock = (id: number) => {
    setOpenBlock(openBlock === id ? null : id);
  };

  const toggleQA = (index: number) => {
    setOpenQA(openQA === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-blue-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📘 Revision Notes</h1>
          <div className="flex gap-4 items-center">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <Link href="/dashboard" className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">

        {/* Introduction */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded">
          <h2 className="text-xl font-bold mb-2">
            {language === 'en' ? '📚 MahaRERA Textbook-Style Revision' : '📚 महारेरा पाठ्यपुस्तक शैली पुनरावलोकन'}
          </h2>
          <p className="text-gray-700">
            {language === 'en'
              ? 'Study comprehensive chapter notes with Q&A sections to prepare for your MahaRERA exam.'
              : 'तुमच्या महारेरा परीक्षेच्या तयारीसाठी प्रश्नोत्तर विभागांसह सर्वसमावेशक अध्याय नोट्सचा अभ्यास करा.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">

          {/* CHAPTER SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <h2 className="font-bold text-lg mb-3">
                {language === 'en' ? 'Chapters' : 'अध्याय'}
              </h2>
              <div className="space-y-2">
                {chapters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChapter(c.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedChapter === c.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">
                      {language === 'en' ? `Chapter ${c.chapterNumber}` : `अध्याय ${c.chapterNumber}`}
                    </div>
                    <div className="text-sm mt-1 opacity-90">
                      {language === 'en' ? c.titleEn : c.titleMr}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* REVISION CONTENT */}
          <main className="lg:col-span-3">

            {!selectedChapter ? (
              <div className="p-12 bg-white shadow rounded-lg text-center">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'en' ? 'Select a Chapter' : 'एक अध्याय निवडा'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Choose a chapter from the sidebar to view revision notes' 
                    : 'पुनरावलोकन नोट्स पाहण्यासाठी साइडबारमधून एक अध्याय निवडा'}
                </p>
              </div>
            ) : loading ? (
              <div className="p-12 bg-white rounded-lg shadow text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">
                  {language === 'en' ? 'Loading revision notes...' : 'पुनरावलोकन नोट्स लोड करत आहे...'}
                </p>
              </div>
            ) : revisions.length === 0 ? (
              <div className="p-12 bg-white rounded-lg shadow text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {language === 'en' ? 'No Revision Notes' : 'कोणत्याही पुनरावलोकन नोट्स नाहीत'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Revision notes for this chapter will appear here once added.' 
                    : 'या अध्यायासाठी पुनरावलोकन नोट्स जोडल्यानंतर येथे दिसतील.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {revisions.map((rev: any) => (
                  <div key={rev.id} className="bg-white rounded-lg shadow">
                    
                    {/* Revision Title */}
                    <button
                      onClick={() => toggleBlock(rev.id)}
                      className="w-full text-left p-5 hover:bg-gray-50 flex justify-between items-start transition"
                    >
                      <h3 className="text-lg font-semibold text-gray-800">
                        {language === 'en' ? rev.titleEn : rev.titleMr}
                      </h3>
                      <span className="text-2xl flex-shrink-0 text-blue-600">
                        {openBlock === rev.id ? '−' : '+'}
                      </span>
                    </button>

                    {/* Expanded Content */}
                    {openBlock === rev.id && (
                      <div className="border-t p-5 bg-blue-50 space-y-4">
                        
                        {/* Text Content */}
                        {(rev.contentEn || rev.contentMr) && (
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                              {language === 'en' ? rev.contentEn : rev.contentMr}
                            </p>

                            {rev.imageUrl && (
                              <img 
                                src={rev.imageUrl} 
                                alt="Revision illustration"
                                className="rounded-lg shadow mt-4 max-h-64 object-contain mx-auto" 
                              />
                            )}
                          </div>
                        )}

                        {/* Q&A Section */}
                        {rev.qaJson && Array.isArray(rev.qaJson) && rev.qaJson.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                              <span>💡</span>
                              {language === 'en' ? 'Q&A Section' : 'प्रश्नोत्तर विभाग'}
                            </h4>
                            <div className="space-y-2">
                              {rev.qaJson.map((qa: any, index: number) => (
                                <div key={index} className="bg-white rounded shadow">
                                  <button
                                    onClick={() => toggleQA(index)}
                                    className="w-full text-left p-4 flex justify-between items-start hover:bg-gray-50 transition"
                                  >
                                    <span className="font-medium text-gray-800">
                                      <span className="text-blue-600 font-bold mr-2">Q{index + 1}.</span>
                                      {language === 'en' ? qa.questionEn : qa.questionMr}
                                    </span>
                                    <span className="flex-shrink-0 text-xl text-blue-600">
                                      {openQA === index ? '−' : '+'}
                                    </span>
                                  </button>
                                  {openQA === index && (
                                    <div className="p-4 bg-green-50 border-t">
                                      <p className="text-gray-800">
                                        <span className="text-green-600 font-bold mr-2">A:</span>
                                        {language === 'en' ? qa.answerEn : qa.answerMr}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                ))}

              </div>
            )}
          </main>

        </div>
      </div>

    </div>
  );
}
