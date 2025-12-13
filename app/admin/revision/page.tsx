"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function AdminRevisionPage() {
  const router = useRouter();
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  
  // View mode
  const [viewMode, setViewMode] = useState<"text" | "json">("text");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Collapsible state for text view
  const [openQA, setOpenQA] = useState<number | null>(null);

  /* ========================
     AUTH CHECK
  ======================== */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/verify");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!data.user?.isAdmin) {
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  /* ========================
     LOAD CHAPTERS
  ======================== */
  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      const res = await fetch("/api/admin/chapters");
      if (!res.ok) throw new Error("Failed to load chapters");
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (err) {
      setError("Failed to load chapters");
      console.error(err);
    }
  };

  /* ========================
     LOAD REVISIONS FOR CHAPTER
  ======================== */
  useEffect(() => {
    if (selectedChapter) {
      loadRevisions();
    }
  }, [selectedChapter]);

  const loadRevisions = async () => {
    if (!selectedChapter) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`/api/users/revision?chapterId=${selectedChapter}`);
      if (!res.ok) throw new Error("Failed to load revisions");
      
      const data = await res.json();
      setRevisions(data.revisions || []);
      
      // Auto-select first revision if available
      if (data.revisions && data.revisions.length > 0) {
        setSelectedRevision(data.revisions[0]);
      } else {
        setSelectedRevision(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load revisions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     SELECT REVISION
  ======================== */
  const selectRevision = (revision: Revision) => {
    setSelectedRevision(revision);
    setViewMode("text"); // Reset to text view
  };

  /* ========================
     RENDER
  ======================== */
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              📘 Revision Content Preview
            </h1>
            <p className="text-gray-600 mt-1">
              View revision notes uploaded via bulk upload
            </p>
          </div>
          <Link
            href="/admin/bulk-upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            📤 Go to Bulk Upload
          </Link>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* LEFT SIDEBAR - CHAPTERS */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <h2 className="font-bold text-lg mb-3">Chapters</h2>
              <div className="space-y-2">
                {chapters.map((ch) => {
                  const revCount = selectedChapter === ch.id ? revisions.length : 0;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChapter(ch.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition ${
                        selectedChapter === ch.id
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <div className="font-semibold">Chapter {ch.chapterNumber}</div>
                      <div className="text-sm mt-1 opacity-90">{ch.titleEn}</div>
                      {selectedChapter === ch.id && revCount > 0 && (
                        <div className="text-xs mt-1 opacity-75">
                          {revCount} revision{revCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="lg:col-span-3">
            
            {!selectedChapter ? (
              <div className="p-12 bg-white shadow rounded-lg text-center">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-2xl font-bold mb-2">Select a Chapter</h3>
                <p className="text-gray-600">Choose a chapter from the sidebar to preview revision notes</p>
              </div>
            ) : loading ? (
              <div className="p-12 bg-white rounded-lg shadow text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading revisions...</p>
              </div>
            ) : revisions.length === 0 ? (
              <div className="p-12 bg-white rounded-lg shadow text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold mb-2">No Revisions Yet</h3>
                <p className="text-gray-600 mb-4">
                  No revision notes have been uploaded for this chapter.
                </p>
                <Link
                  href="/admin/bulk-upload"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📤 Go to Bulk Upload
                </Link>
              </div>
            ) : (
              <>
                {/* REVISION SELECTOR (if multiple) */}
                {revisions.length > 1 && (
                  <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Revision to Preview:
                    </label>
                    <select
                      value={selectedRevision?.id || ""}
                      onChange={(e) => {
                        const rev = revisions.find(r => r.id === Number(e.target.value));
                        if (rev) selectRevision(rev);
                      }}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                    >
                      {revisions.map((rev) => (
                        <option key={rev.id} value={rev.id}>
                          {rev.titleEn} (Order: {rev.order})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedRevision && (
                  <div className="bg-white rounded-lg shadow">
                    
                    {/* TABS */}
                    <div className="border-b px-6 pt-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewMode("text")}
                          className={`px-4 py-2 font-medium transition ${
                            viewMode === "text"
                              ? "border-b-2 border-blue-600 text-blue-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          📄 Student View
                        </button>
                        <button
                          onClick={() => setViewMode("json")}
                          className={`px-4 py-2 font-medium transition ${
                            viewMode === "json"
                              ? "border-b-2 border-blue-600 text-blue-600"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          📝 JSON Reference
                        </button>
                      </div>
                    </div>

                    {/* TEXT VIEW */}
                    {viewMode === "text" && (
                      <div className="p-6">
                        {/* Title */}
                        <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 mb-6">
                          <h3 className="font-bold text-xl text-gray-800">
                            {selectedRevision.titleEn}
                          </h3>
                          <h4 className="text-gray-700 mt-2">
                            {selectedRevision.titleMr}
                          </h4>
                          <p className="text-sm text-gray-600 mt-2">
                            Order: {selectedRevision.order} | ID: {selectedRevision.id}
                          </p>
                        </div>

                        {/* English Content */}
                        {selectedRevision.contentEn && (
                          <details open className="bg-gray-50 p-4 rounded-lg border mb-4">
                            <summary className="font-semibold cursor-pointer text-gray-800">
                              📖 English Notes
                            </summary>
                            <div className="mt-3 whitespace-pre-wrap text-gray-700 leading-relaxed">
                              {selectedRevision.contentEn}
                            </div>
                          </details>
                        )}

                        {/* Marathi Content */}
                        {selectedRevision.contentMr && (
                          <details className="bg-gray-50 p-4 rounded-lg border mb-4">
                            <summary className="font-semibold cursor-pointer text-gray-800">
                              📖 मराठी नोट्स
                            </summary>
                            <div className="mt-3 whitespace-pre-wrap text-gray-700 leading-relaxed">
                              {selectedRevision.contentMr}
                            </div>
                          </details>
                        )}

                        {/* Image */}
                        {selectedRevision.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={selectedRevision.imageUrl}
                              alt="Revision illustration"
                              className="rounded-lg shadow max-h-64 object-contain mx-auto"
                            />
                          </div>
                        )}

                        {/* Q&A */}
                        {selectedRevision.qaJson && 
                         Array.isArray(selectedRevision.qaJson) && 
                         selectedRevision.qaJson.length > 0 && (
                          <details open className="bg-gray-50 p-4 rounded-lg border">
                            <summary className="font-semibold cursor-pointer text-gray-800">
                              💬 Q&A Section ({selectedRevision.qaJson.length} questions)
                            </summary>
                            <div className="mt-3 space-y-2">
                              {selectedRevision.qaJson.map((qa: any, index: number) => (
                                <div key={index} className="bg-white rounded shadow">
                                  <button
                                    onClick={() => setOpenQA(openQA === index ? null : index)}
                                    className="w-full text-left p-4 flex justify-between items-start hover:bg-gray-50 transition"
                                  >
                                    <span className="font-medium text-gray-800">
                                      <span className="text-blue-600 font-bold mr-2">Q{index + 1}.</span>
                                      {qa.questionEn}
                                    </span>
                                    <span className="flex-shrink-0 text-xl text-blue-600">
                                      {openQA === index ? "−" : "+"}
                                    </span>
                                  </button>
                                  {openQA === index && (
                                    <div className="p-4 bg-green-50 border-t">
                                      <p className="text-sm text-gray-600 mb-2">{qa.questionMr}</p>
                                      <p className="text-gray-800">
                                        <span className="text-green-600 font-bold mr-2">A:</span>
                                        {qa.answerEn}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-2">{qa.answerMr}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {!selectedRevision.contentEn && 
                         !selectedRevision.contentMr && 
                         (!selectedRevision.qaJson || selectedRevision.qaJson.length === 0) && (
                          <p className="text-gray-400 italic text-center py-8">
                            No content available
                          </p>
                        )}

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            💡 <strong>To edit:</strong> Switch to "JSON Reference" tab, copy the JSON, 
                            edit in your text editor, then re-upload via{" "}
                            <Link href="/admin/bulk-upload" className="underline font-medium">
                              Bulk Upload
                            </Link>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* JSON VIEW (Read-only for copying) */}
                    {viewMode === "json" && (
                      <div className="p-6">
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            📋 <strong>Copy this JSON</strong> to edit it, then re-upload via{" "}
                            <Link href="/admin/bulk-upload" className="underline font-medium">
                              Bulk Upload
                            </Link>
                          </p>
                        </div>
                        
                        <textarea
                          value={JSON.stringify(selectedRevision, null, 2)}
                          readOnly
                          onClick={(e) => e.currentTarget.select()}
                          className="w-full h-96 border border-gray-300 p-4 rounded-lg font-mono text-sm bg-gray-50 cursor-text"
                          spellCheck={false}
                        />
                        
                        <p className="text-sm text-gray-600 mt-2">
                          💡 Click anywhere in the text area to select all, then press Ctrl+C (or Cmd+C) to copy
                        </p>
                      </div>
                    )}

                  </div>
                )}
              </>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
