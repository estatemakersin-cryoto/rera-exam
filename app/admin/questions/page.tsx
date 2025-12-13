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
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

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
      alert("Question deleted");
    } catch (err: any) {
      setError(err.message || "Delete error");
    } finally {
      setDeleteLoading(null);
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
          <p className="text-gray-600">View and manage bilingual test questions</p>
        </div>

        <Link
          href="/admin/bulk-upload"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📤 Bulk Upload Questions
        </Link>
      </div>

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
            <label>Filter by Chapter</label>
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
            <label>Filter by Difficulty</label>
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
              className="px-4 py-2 bg-gray-300 rounded-lg"
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
                    <div className="flex gap-2">
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

                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={deleteLoading === q.id}
                      className="px-4 py-1 bg-red-500 text-white rounded"
                    >
                      {deleteLoading === q.id ? "Deleting..." : "🗑 Delete"}
                    </button>
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

                      const optEn = q[`option${opt}En` as keyof Question];
                      const optMr = q[`option${opt}Mr` as keyof Question];

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
                              <div className="text-sm">{q[`option${opt}En` as keyof Question] as string}</div>
                              <div className="text-xs text-gray-600">{q[`option${opt}Mr` as keyof Question] as string}</div>

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
    </div>
  );
}
