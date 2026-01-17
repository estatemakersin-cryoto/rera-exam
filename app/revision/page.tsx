"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

interface Chapter {
  id: number;
  chapterNumber: number;
  titleEn: string;
  titleMr: string;
}

interface Revision {
  id: number;
  chapterId: number;
  titleEn: string;
  titleMr: string;
  contentEn: string | null;
  contentMr: string | null;
  imageUrl: string | null;
  qaJson: any;
  order: number;
}

// Collapsible Notes Component
function CollapsibleNotes({ content }: { content: string }) {
  const [openSections, setOpenSections] = useState<number[]>([0]);

  // Split by ## or ### headings
  const sections = content.split(/(?=^###?\s)/gm).filter(s => s.trim());

  const toggleSection = (index: number) => {
    setOpenSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const expandAll = () => setOpenSections(sections.map((_, i) => i));
  const collapseAll = () => setOpenSections([]);

  if (sections.length <= 1) {
    return (
      <div className="prose max-w-none [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_th]:bg-blue-600 [&_th]:text-white [&_th]:px-4 [&_th]:py-3 [&_th]:border [&_th]:border-gray-300 [&_th]:text-left [&_td]:px-4 [&_td]:py-3 [&_td]:border [&_td]:border-gray-300 [&_td]:bg-white">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-3">
        <button onClick={expandAll} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
          📖 Expand All
        </button>
        <button onClick={collapseAll} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          📕 Collapse All
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => {
          const lines = section.trim().split('\n');
          const heading = lines[0].replace(/^###?\s*/, '').trim();
          const body = lines.slice(1).join('\n').trim();
          const isOpen = openSections.includes(index);

          return (
            <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => toggleSection(index)}
                className="w-full text-left p-4 hover:bg-blue-50 transition flex justify-between items-center"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className={`text-lg ${isOpen ? 'text-green-600' : 'text-blue-600'}`}>
                    {isOpen ? '📖' : '📘'}
                  </span>
                  {heading}
                </span>
                <span className={`text-2xl font-bold ${isOpen ? 'text-green-600' : 'text-blue-600'}`}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              
              {isOpen && body && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="prose max-w-none [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_th]:bg-blue-600 [&_th]:text-white [&_th]:px-4 [&_th]:py-3 [&_th]:border [&_th]:border-gray-300 [&_th]:text-left [&_td]:px-4 [&_td]:py-3 [&_td]:border [&_td]:border-gray-300 [&_td]:bg-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UserRevisionPage() {
  const router = useRouter();
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [language, setLanguage] = useState<"en" | "mr">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Collapsible states
  const [openRevision, setOpenRevision] = useState<number | null>(null);
  const [openQA, setOpenQA] = useState<number | null>(null);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/verify");
        if (!res.ok) {
          router.push("/login");
          return;
        }
      } catch (err) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // Load chapters
  useEffect(() => {
    loadChapters();
  }, []);

  // Load revisions when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      loadRevisions();
    }
  }, [selectedChapter]);

  const loadChapters = async () => {
    try {
      const res = await fetch("/api/user/chapters");
      if (!res.ok) throw new Error("Failed to load chapters");
      const data = await res.json();
      setChapters(data.chapters || []);
      
      // Auto-select first chapter
      if (data.chapters && data.chapters.length > 0) {
        setSelectedChapter(data.chapters[0].id);
      }
    } catch (err) {
      setError("Failed to load chapters");
      console.error(err);
    }
  };

  const loadRevisions = async () => {
    if (!selectedChapter) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`/api/user/revision?chapterId=${selectedChapter}`);
      if (!res.ok) throw new Error("Failed to load revisions");
      
      const data = await res.json();
      setRevisions(data.revisions || []);
      
      // Auto-open first revision
      if (data.revisions && data.revisions.length > 0) {
        setOpenRevision(data.revisions[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  const toggleRevision = (revisionId: number) => {
    setOpenRevision(openRevision === revisionId ? null : revisionId);
    setOpenQA(null); // Close Q&A when switching revisions
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">📚 Revision Notes</h1>
              <p className="text-blue-100">MahaRERA Exam Preparation</p>
            </div>
            
            {/* Language Toggle */}
            <div className="flex gap-2 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setLanguage("en")}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  language === "en"
                    ? "bg-white text-blue-600 shadow"
                    : "text-white hover:bg-white/10"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("mr")}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  language === "mr"
                    ? "bg-white text-blue-600 shadow"
                    : "text-white hover:bg-white/10"
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Chapters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-6">
              <h2 className="font-bold text-lg mb-4 text-gray-800">Chapters</h2>
              <div className="space-y-2">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapter(ch.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedChapter === ch.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      Chapter {ch.chapterNumber}
                    </div>
                    <div className="text-xs mt-1 opacity-90">
                      {language === "en" ? ch.titleEn : ch.titleMr || ch.titleEn}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Revisions */}
          <main className="lg:col-span-3">
            {!selectedChapter ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-2xl font-bold mb-2">Select a Chapter</h3>
                <p className="text-gray-600">Choose a chapter to view revision notes</p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading revisions...</p>
              </div>
            ) : revisions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold mb-2">No Revisions Available</h3>
                <p className="text-gray-600">Revision notes for this chapter will be added soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {revisions.map((revision) => (
                  <div key={revision.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Revision Header - Clickable */}
                    <button
                      onClick={() => toggleRevision(revision.id)}
                      className="w-full text-left p-6 hover:bg-gray-50 transition flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            Section {revision.order}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {language === "en" ? revision.titleEn : revision.titleMr || revision.titleEn}
                        </h3>
                      </div>
                      <div className="text-3xl text-blue-600">
                        {openRevision === revision.id ? "−" : "+"}
                      </div>
                    </button>

                    {/* Revision Content - Collapsible */}
                    {openRevision === revision.id && (
                      <div className="border-t">
                        {/* Main Content - Collapsible Sections */}
                        {((language === "en" && revision.contentEn) || 
                          (language === "mr" && revision.contentMr)) && (
                          <div className="p-4 bg-gray-50">
                            <CollapsibleNotes 
                              content={language === "en" 
                                ? revision.contentEn || "" 
                                : revision.contentMr || revision.contentEn || ""
                              }
                            />
                          </div>
                        )}

                        {/* Image */}
                        {revision.imageUrl && (
                          <div className="p-6 bg-white">
                            <img
                              src={revision.imageUrl}
                              alt="Revision illustration"
                              className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                            />
                          </div>
                        )}

                        {/* Q&A Section */}
                        {revision.qaJson && 
                         Array.isArray(revision.qaJson) && 
                         revision.qaJson.length > 0 && (
                          <div className="p-6 bg-white border-t">
                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                              💬 <span>Frequently Asked Questions</span>
                              <span className="text-sm font-normal text-gray-600">
                                ({revision.qaJson.length} questions)
                              </span>
                            </h4>
                            
                            <div className="space-y-3">
                              {revision.qaJson.map((qa: any, index: number) => (
                                <div key={index} className="border rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => setOpenQA(openQA === index ? null : index)}
                                    className="w-full text-left p-4 hover:bg-gray-50 transition flex justify-between items-start"
                                  >
                                    <div className="flex-1">
                                      <span className="text-blue-600 font-bold mr-2">Q{index + 1}.</span>
                                      <span className="font-medium">
                                        {language === "en" 
                                          ? qa.questionEn 
                                          : qa.questionMr || qa.questionEn}
                                      </span>
                                    </div>
                                    <span className="text-xl text-blue-600 ml-4">
                                      {openQA === index ? "−" : "+"}
                                    </span>
                                  </button>
                                  
                                  {openQA === index && (
                                    <div className="p-4 bg-green-50 border-t">
                                      <div className="prose max-w-none">
                                        <p className="font-semibold text-green-700 mb-2">Answer:</p>
                                        <ReactMarkdown>
                                          {language === "en" 
                                            ? qa.answerEn 
                                            : qa.answerMr || qa.answerEn}
                                        </ReactMarkdown>
                                      </div>
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