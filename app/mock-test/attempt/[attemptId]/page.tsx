"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/app/hooks/useLanguage";

// ------------------------------
// Types
// ------------------------------
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

// -------------------------------------------------------------
// MAIN PAGE
// -------------------------------------------------------------
export default function AttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);

  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(3600); // 1 hour
  const [submitting, setSubmitting] = useState(false);

  // LOAD ATTEMPT + QUESTIONS
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
        setQuestions(data.questions);

        if (data.attempt.status !== "COMPLETED") {
          setTimer(3600);
        }
      } catch {
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

  // TIMER
  useEffect(() => {
    if (!attempt || attempt.status === "COMPLETED") return;

    if (timer <= 0) {
      handleSubmit(true);
      return;
    }

    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, attempt]);

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
    } catch {}
  };

  // SUBMIT TEST
  async function handleSubmit(auto = false) {
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
      if (!res.ok) throw new Error(data.error);

      router.push(`/mock-test/result/${attemptId}`);
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
    }
  }

  // LOADING SCREEN
  if (loading || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Test...
      </div>
    );
  }

  // -------------------- RESULT SCREEN ----------------------
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
                {i + 1}. {q.questionEn}
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Start New Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- TEST UI --------------------------
  const q = questions[currentIndex];

  type OptionKeyEn = "optionAEn" | "optionBEn" | "optionCEn" | "optionDEn";
  type OptionKeyMr = "optionAMr" | "optionBMr" | "optionCMr" | "optionDMr";

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

            {/* NAVIGATION */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={() => handleSubmit(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded"
                  disabled={submitting}
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded"
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

            <div className="grid grid-cols-10 gap-2">
              {questions.map((x, i) => (
                <button
                  key={x.responseId}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 rounded text-xs font-semibold
                    ${i === currentIndex ? "ring-2 ring-blue-600" : ""}
                    ${x.userAnswer ? "bg-green-500 text-white" : "bg-gray-300"}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 text-sm">
              <p>
                <strong>Answered:</strong> {questions.filter((x) => x.userAnswer).length}
              </p>
              <p>
                <strong>Unanswered:</strong> {questions.filter((x) => !x.userAnswer).length}
              </p>
            </div>
          </div>
        </aside>
      </div> {/* CLOSE .flex */}

    </div> /* CLOSE page wrapper */
  );
}
