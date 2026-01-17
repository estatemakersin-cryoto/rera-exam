/// Admin Chapters Management Page

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Chapter {
  id: number;
  chapterNumber: number;
  titleEn: string;
  titleMr: string | null;
  actChapterNameEn: string | null;
  actChapterNameMr: string | null;
  descriptionEn: string | null;
  descriptionMr: string | null;
  mahareraEquivalentEn: string | null;
  mahareraEquivalentMr: string | null;
  sections: string | null;
  orderIndex: number | null;
  isActive: boolean;
  displayInApp: boolean;
  _count?: {
    questions: number;
    revision: number;
  };
}

const emptyChapter: Partial<Chapter> = {
  chapterNumber: 0,
  titleEn: "",
  titleMr: "",
  actChapterNameEn: "",
  actChapterNameMr: "",
  descriptionEn: "",
  descriptionMr: "",
  mahareraEquivalentEn: "",
  mahareraEquivalentMr: "",
  sections: "",
  orderIndex: null,
  isActive: true,
  displayInApp: true,
};

export default function AdminChaptersPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "add">("edit");
  const [editingChapter, setEditingChapter] = useState<Partial<Chapter>>(emptyChapter);
  const [saveLoading, setSaveLoading] = useState(false);

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

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/chapters");

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error("Failed to load chapters");
      }

      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (err: any) {
      console.error("Failed to fetch chapters:", err);
      setError(err.message || "Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (chapter: Chapter) => {
    setEditingChapter({ ...chapter });
    setModalMode("edit");
    setModalOpen(true);
  };

  const openAddModal = () => {
    // Find next chapter number
    const maxChapterNum = chapters.reduce(
      (max, ch) => Math.max(max, ch.chapterNumber),
      0
    );
    
    setEditingChapter({
      ...emptyChapter,
      chapterNumber: maxChapterNum + 1,
      orderIndex: maxChapterNum + 1,
    });
    setModalMode("add");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingChapter(emptyChapter);
    setSaveLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaveLoading(true);

    try {
      if (!editingChapter.titleEn?.trim()) {
        throw new Error("Title (English) is required");
      }

      if (modalMode === "add") {
        // Create new chapter via bulk upload endpoint (single item)
        const res = await fetch("/api/admin/bulk-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "chapters",
            data: [{
              chapterNumber: editingChapter.chapterNumber,
              titleEn: editingChapter.titleEn,
              titleMr: editingChapter.titleMr || null,
              actChapterNameEn: editingChapter.actChapterNameEn || null,
              actChapterNameMr: editingChapter.actChapterNameMr || null,
              descriptionEn: editingChapter.descriptionEn || null,
              descriptionMr: editingChapter.descriptionMr || null,
              mahareraEquivalentEn: editingChapter.mahareraEquivalentEn || null,
              mahareraEquivalentMr: editingChapter.mahareraEquivalentMr || null,
              sections: editingChapter.sections || null,
              orderIndex: editingChapter.orderIndex,
              isActive: editingChapter.isActive ?? true,
              displayInApp: editingChapter.displayInApp ?? true,
            }],
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create chapter");
        }

        setSuccess("Chapter created successfully!");
      } else {
        // Update existing chapter
        const res = await fetch(`/api/admin/chapters/${editingChapter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingChapter),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to update chapter");
        }

        setSuccess("Chapter updated successfully!");
      }

      closeModal();
      await fetchChapters();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleActive = async (chapter: Chapter) => {
    try {
      const res = await fetch(`/api/admin/chapters/${chapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !chapter.isActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      // Update local state
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === chapter.id ? { ...ch, isActive: !ch.isActive } : ch
        )
      );

      setSuccess(`Chapter ${chapter.isActive ? "deactivated" : "activated"} successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to toggle status");
    }
  };

  // Calculate stats
  const totalQuestions = chapters.reduce(
    (sum, ch) => sum + (ch._count?.questions || 0),
    0
  );
  const totalRevisions = chapters.reduce(
    (sum, ch) => sum + (ch._count?.revision || 0),
    0
  );
  const activeChapters = chapters.filter((ch) => ch.isActive).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📚 Chapters Management
          </h1>
          <p className="text-gray-600">Manage MahaRERA chapters and content index</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            ➕ Add Chapter
          </button>
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
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
            <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {chapters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Chapters</p>
            <p className="text-3xl font-bold text-blue-700">{chapters.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-700">{activeChapters}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Total Revisions</p>
            <p className="text-3xl font-bold text-purple-700">{totalRevisions}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm">Total Questions</p>
            <p className="text-3xl font-bold text-orange-700">{totalQuestions}</p>
          </div>
        </div>
      )}

      {/* Chapters Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Chapters List</h2>
          <span className="text-sm text-gray-500">
            Sorted by Chapter Number
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 mb-4">No chapters found</p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ➕ Add First Chapter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Act Reference
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Content
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chapters
                  .sort((a, b) => a.chapterNumber - b.chapterNumber)
                  .map((chapter) => (
                    <tr
                      key={chapter.id}
                      className={`hover:bg-gray-50 ${
                        !chapter.isActive ? "opacity-50 bg-gray-50" : ""
                      }`}
                    >
                      {/* Chapter Number */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {chapter.chapterNumber}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {chapter.titleEn}
                        </div>
                        {chapter.titleMr && (
                          <div className="text-sm text-gray-600">
                            {chapter.titleMr}
                          </div>
                        )}
                      </td>

                      {/* Act Reference */}
                      <td className="px-4 py-4">
                        {chapter.actChapterNameEn ? (
                          <div className="text-sm text-gray-700">
                            {chapter.actChapterNameEn}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Not set
                          </span>
                        )}
                      </td>

                      {/* Content Counts */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            📖 {chapter._count?.revision || 0}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                            ❓ {chapter._count?.questions || 0}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleActive(chapter)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            chapter.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {chapter.isActive ? "✅ Active" : "⏸️ Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(chapter)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <Link
                            href={`/admin/revision/edit?chapter=${chapter.id}`}
                            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                          >
                            📖 Revisions
                          </Link>
                          <Link
                            href={`/admin/questions?chapterId=${chapter.id}`}
                            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                          >
                            ❓ Questions
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {chapters.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Total: {chapters.length} chapters • {activeChapters} active •{" "}
          {totalRevisions} revisions • {totalQuestions} questions
        </div>
      )}

      {/* EDIT/ADD MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold">
                  {modalMode === "add"
                    ? "➕ Add New Chapter"
                    : `✏️ Edit Chapter ${editingChapter.chapterNumber}`}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Chapter Number & Order */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">
                      Chapter Number *
                    </label>
                    <input
                      type="number"
                      value={editingChapter.chapterNumber || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          chapterNumber: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      required
                      min={1}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be unique
                    </p>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={editingChapter.orderIndex ?? ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          orderIndex: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Auto (same as chapter number)"
                    />
                  </div>
                </div>

                {/* Titles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      value={editingChapter.titleEn || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          titleEn: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      required
                      placeholder="e.g., Introduction to RERA"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Title (मराठी)
                    </label>
                    <input
                      type="text"
                      value={editingChapter.titleMr || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          titleMr: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="e.g., रेरा परिचय"
                    />
                  </div>
                </div>

                {/* Act Chapter Names */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">
                      RERA Act Chapter Name (English)
                    </label>
                    <input
                      type="text"
                      value={editingChapter.actChapterNameEn || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          actChapterNameEn: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="e.g., Chapter II - Registration"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      RERA Act Chapter Name (मराठी)
                    </label>
                    <input
                      type="text"
                      value={editingChapter.actChapterNameMr || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          actChapterNameMr: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="e.g., प्रकरण II - नोंदणी"
                    />
                  </div>
                </div>

                {/* MahaRERA Equivalent */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">
                      MahaRERA Equivalent (English)
                    </label>
                    <input
                      type="text"
                      value={editingChapter.mahareraEquivalentEn || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          mahareraEquivalentEn: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="e.g., Sections 3-8"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      MahaRERA Equivalent (मराठी)
                    </label>
                    <input
                      type="text"
                      value={editingChapter.mahareraEquivalentMr || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          mahareraEquivalentMr: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="e.g., कलम ३-८"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">
                      Description (English)
                    </label>
                    <textarea
                      value={editingChapter.descriptionEn || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          descriptionEn: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                      placeholder="Brief description of the chapter..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Description (मराठी)
                    </label>
                    <textarea
                      value={editingChapter.descriptionMr || ""}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          descriptionMr: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                      placeholder="प्रकरणाचे संक्षिप्त वर्णन..."
                    />
                  </div>
                </div>

                {/* Sections */}
                <div>
                  <label className="block font-medium mb-1">
                    Sections (JSON Array)
                  </label>
                  <textarea
                    value={editingChapter.sections || ""}
                    onChange={(e) =>
                      setEditingChapter({
                        ...editingChapter,
                        sections: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 min-h-[80px] font-mono text-sm"
                    placeholder='["Section 3", "Section 4", "Section 5"]'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: JSON array of section references
                  </p>
                </div>

                {/* Status Toggles */}
                <div className="flex gap-6 pt-4 border-t">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingChapter.isActive ?? true}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-medium">Active</span>
                    <span className="text-sm text-gray-500">
                      (Show in admin)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingChapter.displayInApp ?? true}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          displayInApp: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-medium">Display in App</span>
                    <span className="text-sm text-gray-500">
                      (Show to users)
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                  disabled={saveLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {saveLoading
                    ? "Saving..."
                    : modalMode === "add"
                    ? "➕ Create Chapter"
                    : "✅ Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}