"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

// Types
interface Question {
  id: string;
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
  difficulty: string;
}

interface Response {
  id: string;
  questionId: string;
  userAnswer: string | null;
  question: Question;
}

interface AttemptData {
  id: string;
  status: string;
  startTime: string;
  endTime: string | null;
  score: number | null;
  correctAnswers: number | null;
  responses: Response[];
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
  const [timer, setTimer] = useState(3600); // 60 minutes
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Fetch attempt data
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const response = await fetch(`/api/attempt/${attemptId}`);
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching attempt:", data.error);
          router.push("/tests");
          return;
        }

        setAttempt(data);
        
        // Extract questions from responses
        const questionsData = data.responses.map((r: Response) => r.question);
        setQuestions(questionsData);

        // Set selected answer if already answered
        if (data.responses[0]?.userAnswer) {
          setSelectedAnswer(data.responses[0].userAnswer);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch attempt:", error);
        router.push("/tests");
      }
    };

    if (attemptId) {
      fetchAttempt();
    }
  }, [attemptId, router]);

  // Timer countdown
  useEffect(() => {
    if (loading || !attempt || attempt.status === "COMPLETED") return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, attempt]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = async (answer: string) => {
    if (!attempt || submitting) return;

    setSelectedAnswer(answer);

    try {
      // Save answer to database
      await fetch(`/api/save-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId: attempt.responses[currentIndex].id,
          userAnswer: answer,
        }),
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      // Load saved answer for next question
      const nextAnswer = attempt?.responses[nextIndex]?.userAnswer;
      setSelectedAnswer(nextAnswer || null);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      
      // Load saved answer for previous question
      const prevAnswer = attempt?.responses[prevIndex]?.userAnswer;
      setSelectedAnswer(prevAnswer || null);
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    const answer = attempt?.responses[index]?.userAnswer;
    setSelectedAnswer(answer || null);
  };

  // Submit test
  const handleSubmit = async () => {
    if (submitting) return;

    const confirmSubmit = window.confirm(
      "Are you sure you want to submit the test? This action cannot be undone."
    );

    if (!confirmSubmit) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/submit-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Redirect to results page using returned attemptId
        router.push(`/attempt/${data.attemptId}`);
      } else {
        alert(data.error || "Failed to submit test");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit test. Please try again.");
      setSubmitting(false);
    }
  };

  // Calculate answered questions
  const answeredCount = attempt?.responses.filter(r => r.userAnswer).length || 0;
  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading test...</div>
      </div>
    );
  }

  if (!attempt || !questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Test not found</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Estate Makers | MahaRERA Mock Test</h1>
            <p className="text-sm">Test {currentIndex + 1} of {questions.length}</p>
          </div>
          
          {/* Timer */}
          <div className="bg-white text-blue-600 px-6 py-3 rounded-lg font-mono text-2xl font-bold">
            {formatTime(timer)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Question Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Question {currentIndex + 1} / {questions.length}
              </h2>
              
              {/* Language Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded ${
                    language === "en"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("mr")}
                  className={`px-4 py-2 rounded ${
                    language === "mr"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  मराठी
                </button>
              </div>

              {/* Question Text */}
              <p className="text-lg text-gray-900 leading-relaxed">
                {language === "en" ? currentQuestion.questionEn : currentQuestion.questionMr}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {["A", "B", "C", "D"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === option
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        selectedAnswer === option
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {option}
                    </div>
                    <span className="flex-1 pt-1">
                      {language === "en"
                        ? currentQuestion[`option${option}En` as keyof Question]
                        : currentQuestion[`option${option}Mr` as keyof Question]}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Question Palette */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-xl p-6 sticky top-6">
            <h3 className="text-xl font-bold mb-4">Question Palette</h3>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-100 p-3 rounded text-center">
                <div className="text-2xl font-bold text-green-700">{answeredCount}</div>
                <div className="text-sm text-gray-600">Answered</div>
              </div>
              <div className="bg-orange-100 p-3 rounded text-center">
                <div className="text-2xl font-bold text-orange-700">{unansweredCount}</div>
                <div className="text-sm text-gray-600">Unanswered</div>
              </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((_, index) => {
                const isAnswered = attempt.responses[index]?.userAnswer;
                const isCurrent = index === currentIndex;

                return (
                  <button
                    key={index}
                    onClick={() => handleJumpToQuestion(index)}
                    className={`w-full aspect-square rounded flex items-center justify-center font-semibold text-sm ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : isAnswered
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}