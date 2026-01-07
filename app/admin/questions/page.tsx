"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
  id: number;
  chapterId: number;
  difficulty: string;
  questionEn: string;
  questionMr: string;
  optionAEn: string;
  optionAMr: string;
  optionBEn: string;
  optionBMr: string;
  optionCEn: string;
  optionCMr: string;
  optionDEn: string;
  optionDMr: string;
  correctAnswer: string;
  explanationEn?: string;
  explanationMr?: string;
  chapter?: {
    chapterNumber: number;
    titleEn: string;
  };
}

interface Chapter {
  id: number;
  chapterNumber: number;
  titleEn: string;
}

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChapter, setFilterChapter] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
    fetchQuestions();
  }, [filterChapter, filterDifficulty]);

  const fetchChapters = async () => {
    try {
      const response = await fetch("/api/admin/chapters");
      if (!response.ok) throw new Error("Failed to load chapters");

      const data = await response.json();
      setChapters(data.chapters || []);
    } catch (err: any) {
      setError(err.message || "Failed to load chapters");
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      let url = "/api/admin/questions?";
      if (filterChapter) url += `chapterId=${filterChapter}&`;
      if (filterDifficulty) url += `difficulty=${filterDifficulty}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load questions");

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      setDeleteLoading(id);

      const response = await fetch(`/api/admin/questions?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Delete failed");
      }

      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setSuccess("Question deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Delete error");
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingQuestion(null);
    setEditLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setEditLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuestion),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      // Update local state
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? data.question : q))
      );

      setSuccess("Question updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      closeEditModal();
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const totalQuestions = questions.length;
  const easyCount = questions.filter((q) => q.difficulty === "EASY").length;
  const moderateCount = questions.filter((q) => q.difficulty === "MODERATE").length;
  const hardCount = questions.filter((q) => q.difficulty === "HARD").length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">MCQ Questions Management</h1>
          <p className="text-gray-600">View, edit, and manage bilingual test questions</p>
        </div>

        <Link
          href="/admin/bulk-upload"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📤 Bulk Upload Questions
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Questions</p>
          <p className="text-3xl font-bold text-blue-700">{totalQuestions}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Easy</p>
          <p className="text-3xl font-bold text-green-700">{easyCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Moderate</p>
          <p className="text-3xl font-bold text-yellow-700">{moderateCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Hard</p>
          <p className="text-3xl font-bold text-red-700">{hardCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Filter by Chapter</label>
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Chapters</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Chapter {ch.chapterNumber}: {ch.titleEn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Filter by Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MODERATE">Moderate</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {(filterChapter || filterDifficulty) && (
            <button
              onClick={() => {
                setFilterChapter("");
                setFilterDifficulty("");
              }}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 self-end"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No questions found</div>
        ) : (
          <div className="divide-y">
            {questions.map((q) => {
              const chapterLabel = q.chapter
                ? `Ch ${q.chapter.chapterNumber}: ${q.chapter.titleEn}`
                : `Chapter ${q.chapterId}`;

              return (
                <div key={q.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between mb-3">
                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {chapterLabel}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          q.difficulty === "EASY"
                            ? "bg-green-100 text-green-800"
                            : q.difficulty === "MODERATE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {q.difficulty}
                      </span>

                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        ID: {q.id}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(q)}
                        className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={deleteLoading === q.id}
                        className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                      >
                        {deleteLoading === q.id ? "Deleting..." : "🗑 Delete"}
                      </button>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-3">
                    <div className="font-semibold">{q.questionEn}</div>
                    <div className="text-sm text-gray-600">
                      {q.questionMr ?? <i className="text-gray-400">(No Marathi)</i>}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {["A", "B", "C", "D"].map((opt) => {
                      const correct = q.correctAnswer === opt;
                      const optEnKey = `option${opt}En` as keyof Question;
                      const optMrKey = `option${opt}Mr` as keyof Question;

                      return (
                        <div
                          key={opt}
                          className={`p-2 rounded border ${
                            correct ? "bg-green-50 border-green-300" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start">
                            <span className={`font-bold mr-2 ${correct ? "text-green-700" : ""}`}>
                              {opt}.
                            </span>

                            <div className="flex-1">
                              <div className="text-sm">{q[optEnKey] as string}</div>
                              <div className="text-xs text-gray-600">{q[optMrKey] as string || ""}</div>
                            </div>

                            {correct && <span className="text-green-600 font-bold ml-2">✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {(q.explanationEn || q.explanationMr) && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600">View Explanation</summary>

                      <div className="mt-2 p-3 bg-blue-50 rounded">
                        {q.explanationEn && <p>{q.explanationEn}</p>}
                        {q.explanationMr && (
                          <p className="text-sm text-gray-600 mt-1">{q.explanationMr}</p>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {questions.length} question(s)
        {filterChapter || filterDifficulty ? " (filtered)" : ""}
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleEditSubmit}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit Question #{editingQuestion.id}</h2>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Chapter Selection */}
                <div>
                  <label className="block font-medium mb-1">Chapter *</label>
                  <select
                    value={editingQuestion.chapterId}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, chapterId: parseInt(e.target.value) })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Chapter {ch.chapterNumber}: {ch.titleEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block font-medium mb-1">Difficulty *</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="EASY">Easy</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                {/* Question English */}
                <div>
                  <label className="block font-medium mb-1">Question (English) *</label>
                  <textarea
                    value={editingQuestion.questionEn}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, questionEn: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 min-h-[80px]"
                    required
                  />
                </div>

                {/* Question Marathi */}
                <div>
                  <label className="block font-medium mb-1">Question (मराठी)</label>
                  <textarea
                    value={editingQuestion.questionMr || ""}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, questionMr: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 min-h-[80px]"
                  />
                </div>

                {/* Options Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt} className="space-y-2">
                      <label className="block font-medium">Option {opt} *</label>
                      <input
                        type="text"
                        placeholder={`Option ${opt} (English)`}
                        value={editingQuestion[`option${opt}En` as keyof Question] as string}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            [`option${opt}En`]: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder={`Option ${opt} (मराठी)`}
                        value={(editingQuestion[`option${opt}Mr` as keyof Question] as string) || ""}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            [`option${opt}Mr`]: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block font-medium mb-1">Correct Answer *</label>
                  <select
                    value={editingQuestion.correctAnswer}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                {/* Explanation English */}
                <div>
                  <label className="block font-medium mb-1">Explanation (English)</label>
                  <textarea
                    value={editingQuestion.explanationEn || ""}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, explanationEn: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 min-h-[80px]"
                  />
                </div>

                {/* Explanation Marathi */}
                <div>
                  <label className="block font-medium mb-1">Explanation (मराठी)</label>
                  <textarea
                    value={editingQuestion.explanationMr || ""}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, explanationMr: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}