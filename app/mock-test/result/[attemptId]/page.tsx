"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/app/providers/LanguageProvider";

// ------------------------------
// Types matching Prisma schema
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
  isCorrect: boolean;
}

interface ResultData {
  attempt: {
    id: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    startTime: string;
    endTime: string;
    testNumber: number;
  };
  questions: Question[];
}

export default function ResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultData | null>(null);
  const [showUnanswered, setShowUnanswered] = useState(false);

  // ------------------------------
  // LOAD RESULT DATA
  // ------------------------------
  useEffect(() => {
    const loadResult = async () => {
      try {
        const res = await fetch(`/api/mock-test/result/${attemptId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to load result");
        }

        const data = await res.json();
        setResult(data);
      } catch (error: any) {
        alert(
          language === "en"
            ? error.message || "Failed to load result"
            : "निकाल लोड करण्यात अयशस्वी"
        );
        router.push("/mock-test");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId, router, language]);

  // ------------------------------
  // LOADING STATE
  // ------------------------------
  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 mb-2">
            {language === "en" ? "Loading Result..." : "निकाल लोड होत आहे..."}
          </div>
          <div className="text-sm text-gray-500">
            {language === "en" ? "Please wait..." : "कृपया प्रतीक्षा करा..."}
          </div>
        </div>
      </div>
    );
  }

  const { attempt, questions } = result;

  // Separate answered and unanswered questions
  const answeredQuestions = questions.filter((q) => q.userAnswer !== null);
  const unansweredQuestions = questions.filter((q) => q.userAnswer === null);

  const answeredCount = answeredQuestions.length;
  const unansweredCount = unansweredQuestions.length;
  const wrongAnswers = answeredCount - attempt.correctAnswers;

  const percentageNum = (attempt.score / attempt.totalQuestions) * 100;
  const percentage = percentageNum.toFixed(1);

  const getQuestionText = (q: Question) =>
    language === "en" ? q.questionEn : q.questionMr || q.questionEn;

  const getOptionText = (q: Question, key: string) => {
    if (language === "en") {
      return {
        A: q.optionAEn,
        B: q.optionBEn,
        C: q.optionCEn,
        D: q.optionDEn,
      }[key];
    } else {
      return {
        A: q.optionAMr || q.optionAEn,
        B: q.optionBMr || q.optionBEn,
        C: q.optionCMr || q.optionCEn,
        D: q.optionDMr || q.optionDEn,
      }[key];
    }
  };

  // Find original question number from the full list
  const getOriginalQuestionNumber = (q: Question) => {
    return questions.findIndex((question) => question.responseId === q.responseId) + 1;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 relative">
      {/* TOP RIGHT BUTTONS */}
      <div className="absolute top-6 right-6 flex gap-3 z-20">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Dashboard
        </button>

        <button
          onClick={() => router.push("/mock-test")}
          className="px-5 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition"
        >
          Mock Tests
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* SCORE CARD */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center border">
              <p className="text-xs text-gray-600 mb-1">
                {language === "en" ? "Total Score" : "एकूण गुण"}
              </p>
              <p className="text-3xl font-bold text-blue-600">{attempt.score}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center border">
              <p className="text-xs text-gray-600 mb-1">
                {language === "en" ? "Percentage" : "टक्केवारी"}
              </p>
              <p className="text-3xl font-bold text-purple-600">{percentage}%</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center border">
              <p className="text-xs text-gray-600 mb-1">
                {language === "en" ? "Correct" : "बरोबर"}
              </p>
              <p className="text-3xl font-bold text-green-600">
                {attempt.correctAnswers}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg text-center border">
              <p className="text-xs text-gray-600 mb-1">
                {language === "en" ? "Wrong" : "चूक"}
              </p>
              <p className="text-3xl font-bold text-red-600">{wrongAnswers}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-center border">
              <p className="text-xs text-gray-600 mb-1">
                {language === "en" ? "Unanswered" : "अनुत्तरित"}
              </p>
              <p className="text-3xl font-bold text-gray-700">
                {unansweredCount}
              </p>
            </div>
          </div>
        </div>

        {/* ANSWERED QUESTIONS SECTION */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            {language === "en" ? "Your Answers" : "तुमची उत्तरे"}
            <span className="text-lg font-normal text-gray-500">
              ({answeredCount} {language === "en" ? "questions" : "प्रश्न"})
            </span>
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {language === "en"
              ? "Questions you attempted in this test"
              : "या परीक्षेत तुम्ही प्रयत्न केलेले प्रश्न"}
          </p>

          {answeredCount === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {language === "en"
                ? "You did not answer any questions"
                : "तुम्ही कोणत्याही प्रश्नाचे उत्तर दिले नाही"}
            </div>
          ) : (
            <div className="space-y-6">
              {answeredQuestions.map((q) => (
                <div
                  key={q.responseId}
                  className={`border-l-4 p-5 rounded-lg ${
                    q.isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">
                    {language === "en"
                      ? `Question ${getOriginalQuestionNumber(q)}`
                      : `प्रश्न ${getOriginalQuestionNumber(q)}`}
                    <span
                      className={`ml-2 text-sm font-medium px-2 py-1 rounded ${
                        q.isCorrect
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {q.isCorrect
                        ? language === "en"
                          ? "Correct"
                          : "बरोबर"
                        : language === "en"
                        ? "Wrong"
                        : "चूक"}
                    </span>
                  </h3>

                  <p className="font-medium mb-4">{getQuestionText(q)}</p>

                  {/* User's Answer */}
                  <div
                    className={`p-3 rounded-lg mb-2 ${
                      q.isCorrect
                        ? "bg-green-100 border border-green-300"
                        : "bg-red-100 border border-red-300"
                    }`}
                  >
                    <strong
                      className={
                        q.isCorrect ? "text-green-700" : "text-red-700"
                      }
                    >
                      {language === "en" ? "Your Answer: " : "तुमचे उत्तर: "}
                    </strong>
                    {q.userAnswer}. {getOptionText(q, q.userAnswer!)}
                  </div>

                  {/* Show correct answer if wrong */}
                  {!q.isCorrect && (
                    <div className="bg-blue-100 border border-blue-300 p-3 rounded-lg">
                      <strong className="text-blue-700">
                        {language === "en"
                          ? "Correct Answer: "
                          : "बरोबर उत्तर: "}
                      </strong>
                      {q.correctAnswer}. {getOptionText(q, q.correctAnswer)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UNANSWERED QUESTIONS SECTION (Collapsible) */}
        {unansweredCount > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <button
              onClick={() => setShowUnanswered(!showUnanswered)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  {language === "en" ? "Unanswered Questions" : "अनुत्तरित प्रश्न"}
                  <span className="text-lg font-normal text-gray-500">
                    ({unansweredCount} {language === "en" ? "questions" : "प्रश्न"})
                  </span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {language === "en"
                    ? "Click to view questions you skipped"
                    : "तुम्ही वगळलेले प्रश्न पाहण्यासाठी क्लिक करा"}
                </p>
              </div>
              <svg
                className={`w-6 h-6 text-gray-500 transition-transform ${
                  showUnanswered ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showUnanswered && (
              <div className="mt-6 space-y-6">
                {unansweredQuestions.map((q) => (
                  <div
                    key={q.responseId}
                    className="border-l-4 border-gray-400 bg-gray-50 p-5 rounded-lg"
                  >
                    <h3 className="font-bold text-lg mb-2">
                      {language === "en"
                        ? `Question ${getOriginalQuestionNumber(q)}`
                        : `प्रश्न ${getOriginalQuestionNumber(q)}`}
                      <span className="ml-2 text-sm font-medium px-2 py-1 rounded bg-gray-200 text-gray-600">
                        {language === "en" ? "Skipped" : "वगळले"}
                      </span>
                    </h3>

                    <p className="font-medium mb-4">{getQuestionText(q)}</p>

                    <div className="bg-blue-100 border border-blue-300 p-3 rounded-lg">
                      <strong className="text-blue-700">
                        {language === "en"
                          ? "Correct Answer: "
                          : "बरोबर उत्तर: "}
                      </strong>
                      {q.correctAnswer}. {getOptionText(q, q.correctAnswer)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push("/mock-test")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {language === "en" ? "Back to Mock Tests" : "मॉक टेस्टकडे परत जा"}
          </button>
        </div>
      </div>
    </div>
  );
}