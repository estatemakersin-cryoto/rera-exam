// Admin Revision Notes Editor Page

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  qaJson: any;
  order: number;
}

interface QAItem {
  questionEn: string;
  questionMr: string;
  answerEn: string;
  answerMr: string;
}

const emptyRevision: Partial<Revision> = {
  titleEn: "",
  titleMr: "",
  contentEn: "",
  contentMr: "",
  imageUrl: "",
  videoUrl: "",
  qaJson: [],
  order: 0,
};

export default function RevisionEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedChapter = searchParams.get("chapter");

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(
    preselectedChapter ? parseInt(preselectedChapter) : null
  );
  const [revisions, setRevisions] = useState<Revision[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "add">("edit");
  const [editingRevision, setEditingRevision] = useState<Partial<Revision>>(emptyRevision);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Preview tab state
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [previewLang, setPreviewLang] = useState<"en" | "mr">("en");

  // Q&A editor state
  const [qaItems, setQaItems] = useState<QAItem[]>([]);

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

  const openAddModal = () => {
    if (!selectedChapter) {
      setError("Please select a chapter first");
      return;
    }

    // Find next order number
    const maxOrder = revisions.reduce((max, r) => Math.max(max, r.order), 0);

    setEditingRevision({
      ...emptyRevision,
      chapterId: selectedChapter,
      order: maxOrder + 1,
    });
    setQaItems([]);
    setModalMode("add");
    setActiveTab("form");
    setModalOpen(true);
  };

  const openEditModal = (revision: Revision) => {
    setEditingRevision({ ...revision });
    setQaItems(Array.isArray(revision.qaJson) ? revision.qaJson : []);
    setModalMode("edit");
    setActiveTab("form");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRevision(emptyRevision);
    setQaItems([]);
    setSaveLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaveLoading(true);

    try {
      if (!editingRevision.titleEn?.trim()) {
        throw new Error("Title (English) is required");
      }
      if (!editingRevision.titleMr?.trim()) {
        throw new Error("Title (Marathi) is required");
      }

      const payload = {
        ...editingRevision,
        qaJson: qaItems.length > 0 ? qaItems : [],
      };

      if (modalMode === "add") {
        // Create new revision
        const res = await fetch("/api/admin/revision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId: selectedChapter,
            titleEn: payload.titleEn,
            titleMr: payload.titleMr,
            contentEn: payload.contentEn || null,
            contentMr: payload.contentMr || null,
            imageUrl: payload.imageUrl || null,
            videoUrl: payload.videoUrl || null,
            qaJson: payload.qaJson,
            order: payload.order || 0,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create revision");
        }

        setSuccess("Revision created successfully!");
      } else {
        // Update existing revision
        const res = await fetch(`/api/admin/revision/${editingRevision.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to update revision");
        }

        setSuccess("Revision updated successfully!");
      }

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
    if (!confirm(`Are you sure you want to delete "${revision.titleEn}"?\n\nThis cannot be undone!`)) {
      return;
    }

    setDeleteLoading(revision.id);
    setError("");

    try {
      const res = await fetch(`/api/admin/revision/${revision.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      setSuccess("Revision deleted successfully!");
      await loadRevisions();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      setDeleteLoading(null);
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
    updated[index][field] = value;
    setQaItems(updated);
  };

  const removeQAItem = (index: number) => {
    setQaItems(qaItems.filter((_, i) => i !== index));
  };

  const selectedChapterData = chapters.find((ch) => ch.id === selectedChapter);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">📖 Revision Notes Manager</h1>
          <p className="text-gray-600">
            Create and edit revision content for each chapter
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/chapters"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            📚 Chapters
          </Link>
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
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
            <button onClick={() => setError("")} className="ml-auto">✕</button>
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
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
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

        {/* RIGHT CONTENT - Revisions */}
        <div className="lg:col-span-3">
          {!selectedChapter ? (
            <div className="p-12 bg-white shadow rounded-lg text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-2xl font-bold mb-2">Select a Chapter</h3>
              <p className="text-gray-600">
                Choose a chapter from the sidebar to manage its revision notes
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              {/* Chapter Header */}
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Chapter {selectedChapterData?.chapterNumber}:{" "}
                    {selectedChapterData?.titleEn}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {revisions.length} revision note(s)
                  </p>
                </div>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  ➕ Add Revision
                </button>
              </div>

              {/* Revisions List */}
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading revisions...</p>
                </div>
              ) : revisions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold mb-2">No Revisions Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Add your first revision note for this chapter.
                  </p>
                  <button
                    onClick={openAddModal}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ➕ Add First Revision
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {revisions
                    .sort((a, b) => a.order - b.order)
                    .map((revision) => (
                      <div
                        key={revision.id}
                        className="p-4 hover:bg-gray-50 flex items-start gap-4"
                      >
                        {/* Order Badge */}
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold">
                            {revision.order}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">
                            {revision.titleEn}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {revision.titleMr}
                          </p>

                          {/* Content Preview */}
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {revision.contentEn && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                📝 Content (En)
                              </span>
                            )}
                            {revision.contentMr && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                📝 Content (Mr)
                              </span>
                            )}
                            {revision.imageUrl && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                🖼️ Image
                              </span>
                            )}
                            {revision.videoUrl && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                🎬 Video
                              </span>
                            )}
                            {Array.isArray(revision.qaJson) && revision.qaJson.length > 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                ❓ {revision.qaJson.length} Q&A
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex gap-2">
                          <button
                            onClick={() => openEditModal(revision)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(revision)}
                            disabled={deleteLoading === revision.id}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:bg-gray-400"
                          >
                            {deleteLoading === revision.id ? "..." : "🗑️"}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT/ADD MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 border-b px-6 py-4 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold">
                {modalMode === "add" ? "➕ Add New Revision" : "✏️ Edit Revision"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 border-b bg-gray-50 px-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("form")}
                  className={`py-3 px-4 font-medium border-b-2 transition ${
                    activeTab === "form"
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  ✏️ Edit Form
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
            <div className="flex-1 overflow-y-auto">
              {activeTab === "form" ? (
                <form onSubmit={handleSave} className="p-6 space-y-6">
                  {/* Title & Order Row */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block font-medium mb-1">Order *</label>
                      <input
                        type="number"
                        value={editingRevision.order ?? 0}
                        onChange={(e) =>
                          setEditingRevision({
                            ...editingRevision,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2"
                        min={0}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-medium mb-1">
                        Title (English) *
                      </label>
                      <input
                        type="text"
                        value={editingRevision.titleEn || ""}
                        onChange={(e) =>
                          setEditingRevision({
                            ...editingRevision,
                            titleEn: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="e.g., Introduction to Registration"
                        required
                      />
                    </div>
                  </div>

                  {/* Marathi Title */}
                  <div>
                    <label className="block font-medium mb-1">
                      Title (मराठी) *
                    </label>
                    <input
                      type="text"
                      value={editingRevision.titleMr || ""}
                      onChange={(e) =>
                        setEditingRevision({
                          ...editingRevision,
                          titleMr: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="e.g., नोंदणीचा परिचय"
                      required
                    />
                  </div>

                  {/* Content English */}
                  <div>
                    <label className="block font-medium mb-1">
                      Content (English) - Markdown Supported
                    </label>
                    <textarea
                      value={editingRevision.contentEn || ""}
                      onChange={(e) =>
                        setEditingRevision({
                          ...editingRevision,
                          contentEn: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 min-h-[200px] font-mono text-sm"
                      placeholder="## Section Title&#10;&#10;Your content here...&#10;&#10;- Bullet point&#10;- Another point"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use ## for headings (creates collapsible sections), **bold**, *italic*, - for bullets
                    </p>
                  </div>

                  {/* Content Marathi */}
                  <div>
                    <label className="block font-medium mb-1">
                      Content (मराठी) - Markdown Supported
                    </label>
                    <textarea
                      value={editingRevision.contentMr || ""}
                      onChange={(e) =>
                        setEditingRevision({
                          ...editingRevision,
                          contentMr: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 min-h-[200px] font-mono text-sm"
                      placeholder="## विभाग शीर्षक&#10;&#10;तुमची सामग्री येथे..."
                    />
                  </div>

                  {/* Media URLs */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={editingRevision.imageUrl || ""}
                        onChange={(e) =>
                          setEditingRevision({
                            ...editingRevision,
                            imageUrl: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        Video URL
                      </label>
                      <input
                        type="url"
                        value={editingRevision.videoUrl || ""}
                        onChange={(e) =>
                          setEditingRevision({
                            ...editingRevision,
                            videoUrl: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  {/* Q&A Section */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">
                        ❓ Q&A Section ({qaItems.length} questions)
                      </h3>
                      <button
                        type="button"
                        onClick={addQAItem}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        ➕ Add Question
                      </button>
                    </div>

                    {qaItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No Q&A items. Click "Add Question" to create one.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {qaItems.map((qa, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold text-blue-600">
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
                                  placeholder="What is...?"
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
                                  placeholder="काय आहे...?"
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
                                  placeholder="The answer is..."
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
                                  placeholder="उत्तर आहे..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hidden submit for form */}
                  <button type="submit" className="hidden" />
                </form>
              ) : (
                /* PREVIEW TAB */
                <div className="p-6">
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
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                      <h2 className="text-2xl font-bold">
                        {previewLang === "en"
                          ? editingRevision.titleEn || "Title (English)"
                          : editingRevision.titleMr || "Title (मराठी)"}
                      </h2>
                      <p className="text-sm opacity-75 mt-1">
                        Order: {editingRevision.order}
                      </p>
                    </div>

                    {/* Content */}
                    {(previewLang === "en" ? editingRevision.contentEn : editingRevision.contentMr) && (
                      <div className="bg-white border rounded-lg p-6">
                        <div className="prose max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {previewLang === "en"
                              ? editingRevision.contentEn || ""
                              : editingRevision.contentMr || ""}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Image Preview */}
                    {editingRevision.imageUrl && (
                      <div className="bg-white border rounded-lg p-6">
                        <p className="font-semibold mb-3">🖼️ Image:</p>
                        <img
                          src={editingRevision.imageUrl}
                          alt="Preview"
                          className="max-w-full h-auto rounded-lg shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                          }}
                        />
                      </div>
                    )}

                    {/* Q&A Preview */}
                    {qaItems.length > 0 && (
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-4">
                          ❓ Q&A ({qaItems.length} questions)
                        </h3>
                        <div className="space-y-3">
                          {qaItems.map((qa, index) => (
                            <details
                              key={index}
                              className="bg-gray-50 border rounded-lg"
                            >
                              <summary className="p-4 cursor-pointer hover:bg-gray-100 font-medium">
                                <span className="text-blue-600 font-bold">
                                  Q{index + 1}.
                                </span>{" "}
                                {previewLang === "en"
                                  ? qa.questionEn || "(No question)"
                                  : qa.questionMr || qa.questionEn || "(No question)"}
                              </summary>
                              <div className="p-4 bg-green-50 border-t">
                                <p className="text-green-700">
                                  <span className="font-bold">A:</span>{" "}
                                  {previewLang === "en"
                                    ? qa.answerEn || "(No answer)"
                                    : qa.answerMr || qa.answerEn || "(No answer)"}
                                </p>
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-gray-50 border-t px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {activeTab === "form"
                  ? "Fill in the form fields and save"
                  : "Switch to Edit Form to make changes"}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                  disabled={saveLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {saveLoading
                    ? "Saving..."
                    : modalMode === "add"
                    ? "➕ Create Revision"
                    : "✅ Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}