// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/dashboard/revision/page.tsx
// User Revision Page - Two sections: Notes (collapsible) + Q&A (collapsible)
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  videoUrl: string | null;
  qaJson: QAItem[];
  order: number;
}

interface QAItem {
  id?: number;
  questionEn: string;
  questionMr: string;
  answerEn: string;
  answerMr: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// COLLAPSIBLE NOTES COMPONENT - Renders ## headings as expandable sections
// ════════════════════════════════════════════════════════════════════════════════
function CollapsibleNotes({ content }: { content: string; language: "en" | "mr" }) {
  const [openSections, setOpenSections] = useState<number[]>([0]); // First section open by default

  // Split content by ## or ### headings
  const sections = content.split(/(?=^###?\s)/gm).filter((s) => s.trim());

  const toggleSection = (index: number) => {
    setOpenSections((prev: number[]) =>
      prev.includes(index) ? prev.filter((i: number) => i !== index) : [...prev, index]
    );
  };

  const expandAll = () => setOpenSections(sections.map((_, i) => i));
  const collapseAll = () => setOpenSections([]);

  // Table components for ReactMarkdown
  const tableComponents = {
    table: ({ children }: { children: ReactNode }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse border border-gray-300 min-w-[500px]">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children: ReactNode }) => (
      <thead className="bg-blue-600 text-white">{children}</thead>
    ),
    th: ({ children }: { children: ReactNode }) => (
      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">{children}</th>
    ),
    td: ({ children }: { children: ReactNode }) => (
      <td className="border border-gray-300 px-4 py-3 bg-white">{children}</td>
    ),
    tr: ({ children }: { children: ReactNode }) => (
      <tr className="even:bg-gray-50">{children}</tr>
    ),
  };

  // If no sections (no ## headings), render as plain markdown
  if (sections.length <= 1) {
    return (
      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={tableComponents}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div>
      {/* Expand/Collapse Controls */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={expandAll}
          className="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
        >
          📖 Expand All
        </button>
        <button
          onClick={collapseAll}
          className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          📕 Collapse All
        </button>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const lines = section.trim().split("\n");
          const headingLine = lines[0];
          const heading = headingLine.replace(/^###?\s*/, "").trim();
          const body = lines.slice(1).join("\n").trim();
          const isOpen = openSections.includes(index);
          const isSubSection = headingLine.startsWith("### ");

          return (
            <div
              key={index}
              className={`border rounded-xl overflow-hidden bg-white shadow-sm ${
                isSubSection ? "ml-4" : ""
              }`}
            >
              <button
                onClick={() => toggleSection(index)}
                className={`w-full text-left p-4 hover:bg-blue-50 transition flex justify-between items-center ${
                  isOpen ? "bg-blue-50" : ""
                }`}
              >
                <span className="font-semibold text-gray-800 flex items-center gap-3">
                  <span
                    className={`text-xl ${
                      isOpen ? "text-green-600" : "text-blue-600"
                    }`}
                  >
                    {isOpen ? "📖" : "📘"}
                  </span>
                  <span className={isSubSection ? "text-base" : "text-lg"}>
                    {heading}
                  </span>
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold ${
                    isOpen
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && body && (
                <div className="p-5 border-t bg-gray-50">
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={tableComponents}>
                      {body}
                    </ReactMarkdown>
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

// ════════════════════════════════════════════════════════════════════════════════
// COLLAPSIBLE Q&A COMPONENT
// ════════════════════════════════════════════════════════════════════════════════
function CollapsibleQA({
  qaItems,
  language,
}: {
  qaItems: QAItem[];
  language: "en" | "mr";
}) {
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const toggleQuestion = (index: number) => {
    setOpenQuestions((prev: number[]) =>
      prev.includes(index) ? prev.filter((i: number) => i !== index) : [...prev, index]
    );
  };

  const expandAll = () => setOpenQuestions(qaItems.map((_, i) => i));
  const collapseAll = () => setOpenQuestions([]);

  return (
    <div>
      {/* Expand/Collapse Controls */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={expandAll}
          className="text-sm px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
        >
          📖 Expand All
        </button>
        <button
          onClick={collapseAll}
          className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          📕 Collapse All
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {qaItems.map((qa, index) => {
          const isOpen = openQuestions.includes(index);
          const question =
            language === "en" ? qa.questionEn : qa.questionMr || qa.questionEn;
          const answer =
            language === "en" ? qa.answerEn : qa.answerMr || qa.answerEn;

          return (
            <div
              key={index}
              className="border rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className={`w-full text-left p-4 hover:bg-purple-50 transition flex justify-between items-start gap-4 ${
                  isOpen ? "bg-purple-50" : ""
                }`}
              >
                <div className="flex-1">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{question}</span>
                </div>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                    isOpen
                      ? "bg-green-100 text-green-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="p-5 border-t bg-green-50">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex-shrink-0">
                      A
                    </span>
                    <div className="prose max-w-none text-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {answer}
                      </ReactMarkdown>
                    </div>
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

// ════════════════════════════════════════════════════════════════════════════════
// MAIN USER REVISION PAGE
// ════════════════════════════════════════════════════════════════════════════════
export default function UserRevisionPage() {
  const router = useRouter();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [language, setLanguage] = useState<"en" | "mr">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Section visibility
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [qaExpanded, setQaExpanded] = useState(true);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapter]);

  const loadChapters = async () => {
    try {
      const res = await fetch("/api/user/chapters");
      if (!res.ok) throw new Error("Failed to load chapters");
      const data = await res.json();
      setChapters(data.chapters || []);

      // Auto-select first chapter
      if (data.chapters && data.chapters.length > 0) {
        const sorted = [...data.chapters].sort(
          (a: Chapter, b: Chapter) => a.chapterNumber - b.chapterNumber
        );
        setSelectedChapter(sorted[0].id);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load revisions";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Separate Notes and Q&A revisions
  const notesRevision = revisions.find(
    (r: Revision) => r.order === 1 || (r.contentEn && (!r.qaJson || r.qaJson.length === 0))
  );
  const qaRevision = revisions.find(
    (r: Revision) => r.order === 2 || (!r.contentEn && r.qaJson && r.qaJson.length > 0)
  );

  const selectedChapterData = chapters.find((ch: Chapter) => ch.id === selectedChapter);

  // Get content based on language
  const getNotesContent = () => {
    if (!notesRevision) return null;
    return language === "en"
      ? notesRevision.contentEn
      : notesRevision.contentMr || notesRevision.contentEn;
  };

  const getQAItems = () => {
    if (!qaRevision || !Array.isArray(qaRevision.qaJson)) return [];
    return qaRevision.qaJson;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">📚 Revision Notes</h1>
              <p className="text-blue-200">MahaRERA Exam Preparation</p>
            </div>

            {/* Language Toggle */}
            <div className="flex gap-1 bg-white/20 rounded-xl p-1">
              <button
                onClick={() => setLanguage("en")}
                className={`px-5 py-2.5 rounded-lg font-semibold transition ${
                  language === "en"
                    ? "bg-white text-blue-700 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("mr")}
                className={`px-5 py-2.5 rounded-lg font-semibold transition ${
                  language === "mr"
                    ? "bg-white text-blue-700 shadow-md"
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* SIDEBAR - CHAPTERS */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-6">
              <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📑</span> Chapters
              </h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {chapters
                  .sort((a: Chapter, b: Chapter) => a.chapterNumber - b.chapterNumber)
                  .map((ch: Chapter) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChapter(ch.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition ${
                        selectedChapter === ch.id
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="font-semibold text-sm">
                        Ch {ch.chapterNumber}
                      </div>
                      <div className="text-xs mt-1 opacity-90 line-clamp-2">
                        {language === "en" ? ch.titleEn : ch.titleMr || ch.titleEn}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </aside>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* MAIN CONTENT AREA */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-3 space-y-6">
            {!selectedChapter ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-7xl mb-4">📖</div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  Select a Chapter
                </h3>
                <p className="text-gray-600">
                  Choose a chapter from the sidebar to view revision notes
                </p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading revision notes...</p>
              </div>
            ) : revisions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-7xl mb-4">📭</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  No Revisions Available
                </h3>
                <p className="text-gray-600">
                  Revision notes for this chapter will be added soon.
                </p>
              </div>
            ) : (
              <>
                {/* Chapter Title Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">📚</span>
                    <div>
                      <p className="text-blue-200 text-sm font-medium">
                        Chapter {selectedChapterData?.chapterNumber}
                      </p>
                      <h2 className="text-2xl font-bold">
                        {language === "en"
                          ? selectedChapterData?.titleEn
                          : selectedChapterData?.titleMr || selectedChapterData?.titleEn}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* NOTES SECTION */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {notesRevision && getNotesContent() && (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Notes Header */}
                    <button
                      onClick={() => setNotesExpanded(!notesExpanded)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center text-white hover:from-blue-600 hover:to-blue-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">📝</span>
                        <div className="text-left">
                          <h3 className="text-xl font-bold">
                            {language === "en"
                              ? notesRevision.titleEn
                              : notesRevision.titleMr || notesRevision.titleEn}
                          </h3>
                          <p className="text-blue-200 text-sm">
                            Click sections below to expand/collapse
                          </p>
                        </div>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                        {notesExpanded ? "−" : "+"}
                      </span>
                    </button>

                    {/* Notes Content */}
                    {notesExpanded && (
                      <div className="p-6">
                        <CollapsibleNotes
                          content={getNotesContent()!}
                          language={language}
                        />

                        {/* Image if present */}
                        {notesRevision.imageUrl && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <p className="font-semibold text-gray-700 mb-3">
                              🖼️ Reference Image:
                            </p>
                            <img
                              src={notesRevision.imageUrl}
                              alt="Revision illustration"
                              className="max-w-full h-auto rounded-lg shadow-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        {/* Video if present */}
                        {notesRevision.videoUrl && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <p className="font-semibold text-gray-700 mb-3">
                              🎬 Video Explanation:
                            </p>
                            <a
                              href={notesRevision.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                              ▶️ Watch Video
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* Q&A SECTION */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                {qaRevision && getQAItems().length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Q&A Header */}
                    <button
                      onClick={() => setQaExpanded(!qaExpanded)}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex justify-between items-center text-white hover:from-purple-600 hover:to-purple-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">❓</span>
                        <div className="text-left">
                          <h3 className="text-xl font-bold">
                            {language === "en"
                              ? qaRevision.titleEn
                              : qaRevision.titleMr || qaRevision.titleEn}
                          </h3>
                          <p className="text-purple-200 text-sm">
                            {getQAItems().length} questions for quick revision
                          </p>
                        </div>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                        {qaExpanded ? "−" : "+"}
                      </span>
                    </button>

                    {/* Q&A Content */}
                    {qaExpanded && (
                      <div className="p-6">
                        <CollapsibleQA qaItems={getQAItems()} language={language} />
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════ */}
                {/* PROGRESS INDICATOR */}
                {/* ══════════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-700">
                      Chapter Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {notesRevision ? "✅ Notes" : "⬜ Notes"} •{" "}
                      {qaRevision ? "✅ Q&A" : "⬜ Q&A"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${
                          ((notesRevision ? 1 : 0) + (qaRevision ? 1 : 0)) * 50
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Complete both sections for thorough revision
                  </p>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}