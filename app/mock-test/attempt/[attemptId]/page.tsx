"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/app/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import { notFound } from "next/navigation";

interface Question {
  responseId: string;
  questionId: number;
  questionEn: string;
  questionMr: string | null;
  optionAEn: string;
  optionAMr: string | null;
  optionBEn: string;
  optionBMr: string | null;
  optionCEn: string;
  optionCMr: string | null;
  optionDEn: string;
  optionDMr: string | null;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect?: boolean;
  markedForReview?: boolean;
}

interface AttemptData {
  id: string;
  startTime: string;
  totalQuestions: number;
  testNumber: number;
  status?: string;
  score?: number;
  correctAnswers?: number;
}

export default function AttemptPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(3600);
  const [submitting, setSubmitting] = useState(false);

  // SUBMIT TEST
  const handleSubmit = useCallback(async (auto = false) => {
    if (!auto) {
      const ok = confirm("Submit test? You cannot change answers later.");
      if (!ok) return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/mock-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit test");

      router.push(`/mock-test/result/${attemptId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit test";
      alert(message);
      setSubmitting(false);
    }
  }, [attemptId, router]);

  // LOAD ATTEMPT + QUESTIONS (runs ONCE)
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch(`/api/mock-test/attempt/${attemptId}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!active) return;

        setAttempt(data.attempt);
        setQuestions(data.questions.map((q: Question) => ({ ...q, markedForReview: false })));

        if (data.attempt.status !== "COMPLETED") {
          setTimer(3600);
        }
      } catch (error: unknown) {
        console.error("Failed to load attempt:", error);
        router.push("/mock-test");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    
    return () => {
      active = false;
    };
  }, [attemptId, router]);

  // TIMER (separate effect)
  useEffect(() => {
    if (!attempt || attempt.status === "COMPLETED") return;
    if (timer <= 0) {
      handleSubmit(true);
      return;
    }

    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, attempt, handleSubmit]);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // SAVE ANSWER
  const saveAnswer = async (q: Question, ans: string) => {
    try {
      await fetch("/api/mock-test/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseId: q.responseId, answer: ans }),
      });

      setQuestions((prev) =>
        prev.map((i) => (i.responseId === q.responseId ? { ...i, userAnswer: ans } : i))
      );
    } catch (error: unknown) {
      console.error("Failed to save answer:", error);
    }
  };

  // TOGGLE MARK FOR REVIEW
  const toggleMarkForReview = (responseId: string) => {
    setQuestions((prev) => {
      const updated = prev.map((q) =>
        q.responseId === responseId ? { ...q, markedForReview: !q.markedForReview } : q
      );
      console.log('Questions after toggle:', updated.find(q => q.responseId === responseId));
      return updated;
    });
  };

  // LOADING SCREEN
  if (loading || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Test...
      </div>
    );
  }

  // RESULT SCREEN
  if (attempt.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-blue-700 mb-4">
            MahaRERA Mock Test Result
          </h1>

          <p className="text-lg">
            <strong>Score:</strong> {attempt.score} / {attempt.totalQuestions}
          </p>

          <p className="text-lg">
            <strong>Correct Answers:</strong> {attempt.correctAnswers}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">Your Answers</h2>

          {questions.map((q, i) => (
            <div key={q.responseId} className="p-4 border rounded mb-3">
              <p className="font-semibold">
                {i + 1}. {language === "en" ? q.questionEn : q.questionMr || q.questionEn}
              </p>

              <p>
                <strong>Your Answer:</strong>{" "}
                <span className={q.isCorrect ? "text-green-600" : "text-red-600"}>
                  {q.userAnswer || "Not Answered"}
                </span>
              </p>

              <p>
                <strong>Correct Answer:</strong> {q.correctAnswer}
              </p>
            </div>
          ))}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/mock-test")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TEST UI
  const q = questions[currentIndex];

  type OptionKeyEn = "optionAEn" | "optionBEn" | "optionCEn" | "optionDEn";
  type OptionKeyMr = "optionAMr" | "optionBMr" | "optionCMr" | "optionDMr";

  // Calculate stats
  const answeredCount = questions.filter((x) => x.userAnswer).length;
  const unansweredCount = questions.filter((x) => !x.userAnswer && !x.markedForReview).length;
  const reviewCount = questions.filter((x) => x.markedForReview && !x.userAnswer).length;
  const answeredReviewCount = questions.filter((x) => x.userAnswer && x.markedForReview).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* HEADER */}
      <header className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Estate Makers | MahaRERA Mock Test</h1>
          <p className="text-xs opacity-80">Test {attempt.testNumber} of 5</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">{formatTime(timer)}</div>
          <div className="bg-white px-3 py-1 rounded">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* LEFT SIDE */}
        <main className="w-2/3 p-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold mb-4">
              Question {currentIndex + 1} / {questions.length}
            </h2>

            <p className="text-lg mb-6">
              {language === "en" ? q.questionEn : q.questionMr || q.questionEn}
            </p>

            <div className="space-y-3 mb-6">
              {(["A", "B", "C", "D"] as const).map((opt) => {
                const keyEn = `option${opt}En` as OptionKeyEn;
                const keyMr = `option${opt}Mr` as OptionKeyMr;

                const text =
                  language === "en" ? q[keyEn] : q[keyMr] || q[keyEn];

                return (
                  <label
                    key={opt}
                    className={`flex items-start gap-3 border-2 p-4 rounded-lg cursor-pointer transition
                      ${
                        q.userAnswer === opt
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      checked={q.userAnswer === opt}
                      onChange={() => saveAnswer(q, opt)}
                      className="mt-1 w-4 h-4"
                    />

                    <span className="flex-1">
                      <strong className="mr-2">{opt}.</strong>
                      {text}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* NAVIGATION & MARK FOR REVIEW */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>

              <button
                onClick={() => toggleMarkForReview(q.responseId)}
                className={`px-6 py-2 rounded transition-colors ${
                  q.markedForReview
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                }`}
              >
                {q.markedForReview ? "✓ Marked for Review" : "Mark for Review"}
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={() => handleSubmit(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDE - Palette */}
        <aside className="w-1/3 p-4">
          <div className="bg-white p-4 rounded-lg shadow sticky top-4">
            <h3 className="font-bold mb-3">Question Palette</h3>

            <div className="grid grid-cols-10 gap-2 mb-4">
              {questions.map((x, i) => {
                let bgColor = "bg-gray-300 hover:bg-gray-400"; // Unanswered
                
                if (x.userAnswer && x.markedForReview) {
                  bgColor = "bg-orange-500 text-white hover:bg-orange-600"; // Answered + Review
                } else if (x.userAnswer) {
                  bgColor = "bg-green-500 text-white hover:bg-green-600"; // Answered
                } else if (x.markedForReview) {
                  bgColor = "bg-purple-500 text-white hover:bg-purple-600"; // Marked for Review
                }

                return (
                  <button
                    key={x.responseId}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-8 h-8 rounded text-xs font-semibold transition-colors
                      ${i === currentIndex ? "ring-2 ring-blue-600" : ""}
                      ${bgColor}
                    `}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="text-xs space-y-2 mb-4 border-t pt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Answered ({answeredCount - answeredReviewCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>Review ({reviewCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Answered + Review ({answeredReviewCount})</span>
              </div>
            </div>

            {/* Stats */}
            <div className="text-sm border-t pt-3">
              <p>
                <strong>Answered:</strong> {answeredCount}
              </p>
              <p>
                <strong>Unanswered:</strong> {unansweredCount}
              </p>
              <p>
                <strong>Marked for Review:</strong> {reviewCount + answeredReviewCount}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}