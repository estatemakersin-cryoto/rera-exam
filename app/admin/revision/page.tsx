// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/admin/revision/page.tsx
// Admin Revision Notes Manager - Two items per chapter: Notes + Q&A
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

type RevisionType = "notes" | "qa";

export default function AdminRevisionPage() {
  const router = useRouter();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<RevisionType>("notes");
  const [editingRevision, setEditingRevision] = useState<Revision | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    titleEn: "",
    titleMr: "",
    contentEn: "",
    contentMr: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [qaItems, setQaItems] = useState<QAItem[]>([]);

  // Preview
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewLang, setPreviewLang] = useState<"en" | "mr">("en");

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
    } else {
      setRevisions([]);
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
    } catch (err: any) {
      setError(err.message || "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  // Get Notes and Q&A items
  const notesRevision = revisions.find(
    (r) => r.order === 1 || (r.contentEn && !r.qaJson?.length)
  );
  const qaRevision = revisions.find(
    (r) => r.order === 2 || (!r.contentEn && r.qaJson?.length > 0)
  );

  // Open modal for editing/creating
  const openModal = (type: RevisionType, revision?: Revision) => {
    setModalType(type);
    setActiveTab("edit");

    if (revision) {
      setEditingRevision(revision);
      setFormData({
        titleEn: revision.titleEn || "",
        titleMr: revision.titleMr || "",
        contentEn: revision.contentEn || "",
        contentMr: revision.contentMr || "",
        imageUrl: revision.imageUrl || "",
        videoUrl: revision.videoUrl || "",
      });
      setQaItems(Array.isArray(revision.qaJson) ? revision.qaJson : []);
    } else {
      setEditingRevision(null);
      if (type === "notes") {
        setFormData({
          titleEn: "Chapter Notes",
          titleMr: "अध्याय नोट्स",
          contentEn: "",
          contentMr: "",
          imageUrl: "",
          videoUrl: "",
        });
        setQaItems([]);
      } else {
        setFormData({
          titleEn: "Quick Revision Q&A",
          titleMr: "जलद उजळणी प्रश्न-उत्तरे",
          contentEn: "",
          contentMr: "",
          imageUrl: "",
          videoUrl: "",
        });
        setQaItems([]);
      }
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRevision(null);
    setFormData({
      titleEn: "",
      titleMr: "",
      contentEn: "",
      contentMr: "",
      imageUrl: "",
      videoUrl: "",
    });
    setQaItems([]);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaveLoading(true);

    try {
      if (!formData.titleEn.trim()) {
        throw new Error("Title (English) is required");
      }

      const payload = {
        chapterId: selectedChapter,
        titleEn: formData.titleEn,
        titleMr: formData.titleMr,
        contentEn: modalType === "notes" ? formData.contentEn || null : null,
        contentMr: modalType === "notes" ? formData.contentMr || null : null,
        imageUrl: formData.imageUrl || null,
        videoUrl: formData.videoUrl || null,
        qaJson: modalType === "qa" ? qaItems : [],
        order: modalType === "notes" ? 1 : 2,
      };

      let res;
      if (editingRevision) {
        res = await fetch(`/api/admin/revision/${editingRevision.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/revision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }

      setSuccess(editingRevision ? "Updated successfully!" : "Created successfully!");
      closeModal();
      await loadRevisions();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (revision: Revision) => {
    if (!confirm(`Delete "${revision.titleEn}"? This cannot be undone!`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/revision/${revision.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      setSuccess("Deleted successfully!");
      await loadRevisions();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Q&A Management
  const addQAItem = () => {
    setQaItems([
      ...qaItems,
      { questionEn: "", questionMr: "", answerEn: "", answerMr: "" },
    ]);
  };

  const updateQAItem = (index: number, field: keyof QAItem, value: string) => {
    const updated = [...qaItems];
    updated[index] = { ...updated[index], [field]: value };
    setQaItems(updated);
  };

  const removeQAItem = (index: number) => {
    setQaItems(qaItems.filter((_, i) => i !== index));
  };

  const selectedChapterData = chapters.find((ch) => ch.id === selectedChapter);

  // Count sections in markdown content
  const countSections = (content: string | null): number => {
    if (!content) return 0;
    const matches = content.match(/^##\s+/gm);
    return matches ? matches.length : 0;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">📖 Revision Notes Manager</h1>
          <p className="text-gray-600">
            Manage chapter notes and Q&A for each chapter
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/bulk-upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📤 Bulk Upload
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <span>❌ {error}</span>
            <button onClick={() => setError("")}>✕</button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          ✅ {success}
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
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {chapters
                  .sort((a, b) => a.chapterNumber - b.chapterNumber)
                  .map((ch) => (
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
                      <div className="text-xs mt-1 opacity-90 truncate">
                        {ch.titleEn}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-3">
          {!selectedChapter ? (
            <div className="p-12 bg-white shadow rounded-lg text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-2xl font-bold mb-2">Select a Chapter</h3>
              <p className="text-gray-600">
                Choose a chapter from the sidebar to manage its revision content
              </p>
            </div>
          ) : loading ? (
            <div className="p-12 bg-white rounded-lg shadow text-center">
              <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Chapter Header */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Chapter {selectedChapterData?.chapterNumber}:{" "}
                  {selectedChapterData?.titleEn}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedChapterData?.titleMr}
                </p>
              </div>

              {/* NOTES CARD */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📝</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Chapter Notes
                        </h3>
                        <p className="text-blue-100 text-sm">
                          Detailed revision content with collapsible sections
                        </p>
                      </div>
                    </div>
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      Order: 1
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {notesRevision ? (
                    <div>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {notesRevision.contentEn && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            📝 Content (En) - {countSections(notesRevision.contentEn)} sections
                          </span>
                        )}
                        {notesRevision.contentMr && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            📝 Content (Mr)
                          </span>
                        )}
                        {notesRevision.imageUrl && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            🖼️ Has Image
                          </span>
                        )}
                        {notesRevision.videoUrl && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            🎬 Has Video
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => openModal("notes", notesRevision)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          ✏️ Edit Notes
                        </button>
                        <button
                          onClick={() => handleDelete(notesRevision)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">
                        No chapter notes yet. Create notes with collapsible sections.
                      </p>
                      <button
                        onClick={() => openModal("notes")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        ➕ Create Chapter Notes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Q&A CARD */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">❓</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Quick Revision Q&A
                        </h3>
                        <p className="text-purple-100 text-sm">
                          Question-answer pairs for quick revision
                        </p>
                      </div>
                    </div>
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      Order: 2
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {qaRevision ? (
                    <div>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          ❓ {qaRevision.qaJson?.length || 0} Questions
                        </span>
                      </div>

                      {/* Q&A Preview */}
                      {qaRevision.qaJson && qaRevision.qaJson.length > 0 && (
                        <div className="mb-4 max-h-48 overflow-y-auto border rounded-lg">
                          {qaRevision.qaJson.slice(0, 5).map((qa, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 border-b last:border-b-0 text-sm"
                            >
                              <span className="font-medium text-purple-600">
                                Q{idx + 1}.
                              </span>{" "}
                              {qa.questionEn}
                            </div>
                          ))}
                          {qaRevision.qaJson.length > 5 && (
                            <div className="px-4 py-2 text-gray-500 text-sm text-center">
                              ... and {qaRevision.qaJson.length - 5} more questions
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => openModal("qa", qaRevision)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          ✏️ Edit Q&A
                        </button>
                        <button
                          onClick={() => handleDelete(qaRevision)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">
                        No Q&A yet. Add question-answer pairs for quick revision.
                      </p>
                      <button
                        onClick={() => openModal("qa")}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        ➕ Create Q&A Section
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  📌 Structure Guide
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • <strong>Chapter Notes:</strong> Use ## headings to create
                    collapsible sections (e.g., ## Introduction, ## Key Points)
                  </li>
                  <li>
                    • <strong>Q&A Section:</strong> Add question-answer pairs that
                    students can expand/collapse
                  </li>
                  <li>
                    • Notes appear first (Order: 1), Q&A appears second (Order: 2)
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* EDIT MODAL */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div
              className={`flex-shrink-0 px-6 py-4 flex justify-between items-center ${
                modalType === "notes"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                  : "bg-gradient-to-r from-purple-500 to-purple-600"
              }`}
            >
              <h2 className="text-2xl font-bold text-white">
                {modalType === "notes" ? "📝 Chapter Notes" : "❓ Quick Revision Q&A"}
              </h2>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 border-b bg-gray-50 px-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`py-3 px-4 font-medium border-b-2 transition ${
                    activeTab === "edit"
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`py-3 px-4 font-medium border-b-2 transition ${
                    activeTab === "preview"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  👁️ Preview
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "edit" ? (
                <div className="space-y-6">
                  {/* Title Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">
                        Title (English) *
                      </label>
                      <input
                        type="text"
                        value={formData.titleEn}
                        onChange={(e) =>
                          setFormData({ ...formData, titleEn: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Chapter Notes"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        Title (मराठी)
                      </label>
                      <input
                        type="text"
                        value={formData.titleMr}
                        onChange={(e) =>
                          setFormData({ ...formData, titleMr: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., अध्याय नोट्स"
                      />
                    </div>
                  </div>

                  {/* NOTES-specific fields */}
                  {modalType === "notes" && (
                    <>
                      {/* Content English */}
                      <div>
                        <label className="block font-medium mb-1">
                          Content (English) - Markdown with ## for collapsible sections
                        </label>
                        <textarea
                          value={formData.contentEn}
                          onChange={(e) =>
                            setFormData({ ...formData, contentEn: e.target.value })
                          }
                          className="w-full border rounded-lg px-4 py-2 min-h-[250px] font-mono text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder={`## Introduction to RERA

Your content here...

## Key Points

- Point 1
- Point 2

## Important Dates

| Event | Date |
|-------|------|
| RERA Enacted | 2016 |`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use ## for section headings (will become collapsible), **bold**,
                          *italic*, | for tables
                        </p>
                      </div>

                      {/* Content Marathi */}
                      <div>
                        <label className="block font-medium mb-1">
                          Content (मराठी) - Markdown
                        </label>
                        <textarea
                          value={formData.contentMr}
                          onChange={(e) =>
                            setFormData({ ...formData, contentMr: e.target.value })
                          }
                          className="w-full border rounded-lg px-4 py-2 min-h-[200px] font-mono text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="## RERA परिचय&#10;&#10;तुमची सामग्री येथे..."
                        />
                      </div>

                      {/* Media URLs */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium mb-1">
                            Image URL (optional)
                          </label>
                          <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) =>
                              setFormData({ ...formData, imageUrl: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">
                            Video URL (optional)
                          </label>
                          <input
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) =>
                              setFormData({ ...formData, videoUrl: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Q&A-specific fields */}
                  {modalType === "qa" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">
                          Questions ({qaItems.length})
                        </h3>
                        <button
                          type="button"
                          onClick={addQAItem}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          ➕ Add Question
                        </button>
                      </div>

                      {qaItems.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                          <p className="text-gray-500 mb-4">
                            No questions yet. Click "Add Question" to start.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                          {qaItems.map((qa, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 bg-gray-50"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-purple-600">
                                  Question {index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeQAItem(index)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  🗑️ Remove
                                </button>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm mb-1">
                                    Question (English)
                                  </label>
                                  <input
                                    type="text"
                                    value={qa.questionEn}
                                    onChange={(e) =>
                                      updateQAItem(index, "questionEn", e.target.value)
                                    }
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    placeholder="What is RERA?"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm mb-1">
                                    Question (मराठी)
                                  </label>
                                  <input
                                    type="text"
                                    value={qa.questionMr}
                                    onChange={(e) =>
                                      updateQAItem(index, "questionMr", e.target.value)
                                    }
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    placeholder="RERA म्हणजे काय?"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm mb-1">
                                    Answer (English)
                                  </label>
                                  <textarea
                                    value={qa.answerEn}
                                    onChange={(e) =>
                                      updateQAItem(index, "answerEn", e.target.value)
                                    }
                                    className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                                    placeholder="RERA stands for..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm mb-1">
                                    Answer (मराठी)
                                  </label>
                                  <textarea
                                    value={qa.answerMr}
                                    onChange={(e) =>
                                      updateQAItem(index, "answerMr", e.target.value)
                                    }
                                    className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                                    placeholder="RERA म्हणजे..."
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* PREVIEW TAB */
                <div>
                  {/* Language Toggle */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setPreviewLang("en")}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        previewLang === "en"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setPreviewLang("mr")}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        previewLang === "mr"
                          ? "bg-orange-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      मराठी
                    </button>
                  </div>

                  {/* Preview Content */}
                  {modalType === "notes" ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-xl font-bold text-blue-800">
                          {previewLang === "en" ? formData.titleEn : formData.titleMr}
                        </h3>
                      </div>

                      {(previewLang === "en" ? formData.contentEn : formData.contentMr) && (
                        <div className="prose max-w-none bg-white border rounded-lg p-6">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {previewLang === "en"
                              ? formData.contentEn
                              : formData.contentMr || formData.contentEn}
                          </ReactMarkdown>
                        </div>
                      )}

                      {formData.imageUrl && (
                        <div className="border rounded-lg p-4">
                          <p className="font-medium mb-2">🖼️ Image:</p>
                          <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="max-w-full h-auto rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/400x200?text=Invalid+URL";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="text-xl font-bold text-purple-800">
                          {previewLang === "en" ? formData.titleEn : formData.titleMr}
                        </h3>
                        <p className="text-purple-600 text-sm">
                          {qaItems.length} questions
                        </p>
                      </div>

                      {qaItems.length > 0 && (
                        <div className="space-y-2">
                          {qaItems.map((qa, index) => (
                            <details
                              key={index}
                              className="bg-white border rounded-lg"
                            >
                              <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium">
                                <span className="text-purple-600 font-bold">
                                  Q{index + 1}.
                                </span>{" "}
                                {previewLang === "en"
                                  ? qa.questionEn
                                  : qa.questionMr || qa.questionEn}
                              </summary>
                              <div className="p-4 bg-green-50 border-t">
                                <span className="font-bold text-green-700">A:</span>{" "}
                                {previewLang === "en"
                                  ? qa.answerEn
                                  : qa.answerMr || qa.answerEn}
                              </div>
                            </details>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-gray-50 border-t px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {modalType === "notes"
                  ? `${countSections(formData.contentEn)} sections detected`
                  : `${qaItems.length} questions`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                  disabled={saveLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className={`px-6 py-2 text-white rounded-lg font-semibold disabled:bg-gray-400 ${
                    modalType === "notes"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {saveLoading ? "Saving..." : "✅ Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}