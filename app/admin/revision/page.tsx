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
  chapterNumber?: number;
  titleEn: string;
  titleMr: string;
  contentEn: string | null;
  contentMr: string | null;
  imageUrl: string | null;
  qaJson: any;
  order: number;
}

export default function RevisionEditorPage() {
  const router = useRouter();
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [editedJson, setEditedJson] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auth check
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

  // Load chapters on mount
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
      const res = await fetch("/api/admin/chapters");
      if (!res.ok) throw new Error("Failed to load chapters");
      const data = await res.json();
      setChapters(data.chapters || []);
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
      
      if (data.revisions && data.revisions.length > 0) {
        selectRevisionForEdit(data.revisions[0]);
      } else {
        setSelectedRevision(null);
        setEditedJson("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  const selectRevisionForEdit = (revision: Revision) => {
    setSelectedRevision(revision);
    
    // Get chapter number
    const chapter = chapters.find(ch => ch.id === revision.chapterId);
    
    // Create clean JSON for editing (without DB IDs)
    const cleanJson = {
      chapterNumber: chapter?.chapterNumber || revision.chapterNumber,
      titleEn: revision.titleEn,
      titleMr: revision.titleMr,
      contentEn: revision.contentEn,
      contentMr: revision.contentMr,
      imageUrl: revision.imageUrl,
      qaJson: revision.qaJson,
      order: revision.order
    };
    
    setEditedJson(JSON.stringify(cleanJson, null, 2));
  };

  const handleUpdateRevision = async () => {
    setError("");
    setSuccess("");

    if (!editedJson.trim()) {
      setError("JSON content is empty");
      return;
    }

    if (!selectedRevision) {
      setError("No revision selected");
      return;
    }

    if (!confirm("Are you sure you want to update this revision content?")) {
      return;
    }

    try {
      setLoading(true);

      // Validate JSON
      let parsedData;
      try {
        parsedData = JSON.parse(editedJson);
      } catch (parseError) {
        throw new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : "Parse failed"}`);
      }

      // Update the existing revision
      const res = await fetch(`/api/admin/revision/${selectedRevision.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      setSuccess("✅ Revision updated successfully!");
      
      // Reload revisions to show updated content
      await loadRevisions();
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRevision = async () => {
    if (!selectedRevision) return;

    if (!confirm("⚠️ Are you sure you want to DELETE this revision? This cannot be undone!")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/revision/${selectedRevision.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      setSuccess("✅ Revision deleted successfully!");
      
      // Reload revisions
      await loadRevisions();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">✏️ Edit Revision Notes</h1>
          <p className="text-gray-600">
            Select a chapter and revision to edit its content
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/revision"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            👁️ Preview Mode
          </Link>
          <Link
            href="/admin/bulk-upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📤 Bulk Upload
          </Link>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* LEFT SIDEBAR - Chapters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-6">
            <h2 className="font-bold text-lg mb-3">Select Chapter</h2>
            {chapters.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading chapters...</p>
            ) : (
              <div className="space-y-2">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapter(ch.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedChapter === ch.id
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div className="font-semibold">Ch {ch.chapterNumber}</div>
                    <div className="text-xs mt-1 opacity-90">{ch.titleEn}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT - Editor */}
        <div className="lg:col-span-3">
          {!selectedChapter ? (
            <div className="p-12 bg-white shadow rounded-lg text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-2xl font-bold mb-2">Select a Chapter</h3>
              <p className="text-gray-600">Choose a chapter from the sidebar to edit its revision notes</p>
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
                📤 Upload New Content
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              
              {/* Revision Selector */}
              {revisions.length > 1 && (
                <div className="p-4 border-b">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Revision to Edit:
                  </label>
                  <select
                    value={selectedRevision?.id || ""}
                    onChange={(e) => {
                      const rev = revisions.find(r => r.id === Number(e.target.value));
                      if (rev) selectRevisionForEdit(rev);
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

              {/* JSON Editor */}
              {selectedRevision && (
                <div className="p-6">
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      ✏️ <strong>Edit the JSON below</strong> and click "Update Revision" to save changes.
                    </p>
                  </div>
                  
                  <textarea
                    value={editedJson}
                    onChange={(e) => setEditedJson(e.target.value)}
                    className="w-full h-96 border border-gray-300 p-4 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
                    spellCheck={false}
                  />
                  
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleUpdateRevision}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    >
                      {loading ? "Updating..." : "✅ Update Revision"}
                    </button>
                    <button
                      onClick={() => {
                        if (selectedRevision) {
                          selectRevisionForEdit(selectedRevision);
                        }
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      🔄 Reset
                    </button>
                    <button
                      onClick={handleDeleteRevision}
                      disabled={loading}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Use VS Code or an online JSON editor to format and validate your JSON before updating.
                    </p>
                  </div>

                  {/* Preview Section */}
                  <details className="mt-4 p-4 bg-gray-50 border rounded-lg">
                    <summary className="cursor-pointer font-semibold text-gray-800">
                      👁️ Preview Current Content
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="font-semibold">Title (En):</span> {selectedRevision.titleEn}
                      </div>
                      <div>
                        <span className="font-semibold">Title (Mr):</span> {selectedRevision.titleMr}
                      </div>
                      {selectedRevision.contentEn && (
                        <div>
                          <span className="font-semibold">Content (En):</span>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {selectedRevision.contentEn.substring(0, 200)}...
                          </p>
                        </div>
                      )}
                      {selectedRevision.qaJson && Array.isArray(selectedRevision.qaJson) && (
                        <div>
                          <span className="font-semibold">Q&A:</span> {selectedRevision.qaJson.length} questions
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}