'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  response_id: number;
  chapter_id: number;
  question_en: string;
  question_mr: string;
  option_a_en: string;
  option_a_mr: string;
  option_b_en: string;
  option_b_mr: string;
  option_c_en: string;
  option_c_mr: string;
  option_d_en: string;
  option_d_mr: string;
}

interface TestInterfaceProps {
  attemptId: number;
  questions: Question[];
  duration: number | null;
  testMode: 'revision' | 'mock';
}

export default function TestInterface({ attemptId, questions, duration, testMode }: TestInterfaceProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<'en' | 'mr'>('en');
  const [timeLeft, setTimeLeft] = useState(duration ? duration * 60 : null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isRevision = testMode === 'revision';

  // Timer (only for mock tests)
  useEffect(() => {
    if (!isRevision && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isRevision]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'No Time Limit';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveAnswer = async (answer: string, review: boolean = false) => {
    const newAnswers = { ...answers, [currentIndex]: answer };
    setAnswers(newAnswers);

    if (review) {
      setMarkedForReview(prev => new Set([...prev, currentIndex]));
    }

    try {
      await fetch('/api/test/save-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseId: currentQuestion.response_id,
          userAnswer: answer,
          markedForReview: review,
        }),
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleAnswerSelect = (option: string) => {
    saveAnswer(option, markedForReview.has(currentIndex));
  };

  const handleMarkForReview = () => {
    if (markedForReview.has(currentIndex)) {
      const newSet = new Set(markedForReview);
      newSet.delete(currentIndex);
      setMarkedForReview(newSet);
    } else {
      setMarkedForReview(prev => new Set([...prev, currentIndex]));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAutoSubmit = async () => {
    await submitTest(true);
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const submitTest = async (auto = false) => {
    try {
      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, autoSubmit: auto }),
      });

      const data = await response.json();
      router.push(`/test/result/${attemptId}`);
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const getQuestionStatus = (index: number) => {
    if (answers[index]) return 'answered';
    if (markedForReview.has(index)) return 'review';
    return 'unanswered';
  };

  const answeredCount = Object.keys(answers).length;
  const reviewCount = markedForReview.size;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`${isRevision ? 'bg-blue-900' : 'bg-green-900'} text-white px-6 py-4 flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">
            {isRevision ? '🔄 Revision Mode' : '🎯 Mock Test'}
          </div>
          <div className={`px-4 py-1 rounded ${isRevision ? 'bg-blue-700' : 'bg-green-700'} text-sm`}>
            MahaRERA MCQ Examination
          </div>
        </div>
        <div className="flex items-center gap-6">
          {!isRevision && timeLeft !== null && (
            <div className={`text-3xl font-mono font-bold ${timeLeft < 300 ? 'text-red-300 animate-pulse' : ''}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          )}
          {isRevision && (
            <div className="text-lg bg-blue-700 px-4 py-2 rounded">
              ♾️ Unlimited Time
            </div>
          )}
          <button
            onClick={() => setLanguage(lang => lang === 'en' ? 'mr' : 'en')}
            className="bg-white text-blue-900 px-4 py-2 rounded font-semibold hover:bg-gray-100"
          >
            {language === 'en' ? 'मराठी' : 'English'}
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Question Area */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              {isRevision && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold">
                  Practice Mode - No Test Count
                </span>
              )}
            </div>
            
            <div className="text-xl font-semibold mb-6">
              {language === 'en' ? currentQuestion.question_en : currentQuestion.question_mr}
            </div>

            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map(option => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentIndex] === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="font-bold mr-3">{option}.</span>
                    <span>
                      {language === 'en'
                        ? currentQuestion[`option_${option.toLowerCase()}_en` as keyof Question]
                        : currentQuestion[`option_${option.toLowerCase()}_mr` as keyof Question]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <button
              onClick={handleMarkForReview}
              className={`px-6 py-2 rounded ${
                markedForReview.has(currentIndex)
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {markedForReview.has(currentIndex) ? '⭐ Marked for Review' : 'Mark for Review'}
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentIndex === questions.length - 1 ? 'Review All' : 'Save & Next →'}
            </button>
          </div>
        </div>

        {/* Question Palette */}
        <div className="w-80 bg-white border-l p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-4">Question Palette</h3>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-green-500"></div>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-500"></div>
                <span>Not Answered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-purple-500"></div>
                <span>Marked for Review ({reviewCount})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {questions.map((_, index) => {
              const status = getQuestionStatus(index);
              const bgColor =
                status === 'answered'
                  ? 'bg-green-500 text-white'
                  : status === 'review'
                  ? 'bg-purple-500 text-white'
                  : 'bg-red-500 text-white';

              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-10 h-10 rounded font-semibold ${bgColor} ${
                    currentIndex === index ? 'ring-4 ring-blue-300' : ''
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full py-3 ${isRevision ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-bold`}
          >
            {isRevision ? 'Finish Practice' : 'Submit Test'}
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {isRevision ? 'Finish Practice Session?' : 'Confirm Test Submission'}
            </h3>
            <p className="mb-2">Answered: {answeredCount}</p>
            <p className="mb-2">Not Answered: {unansweredCount}</p>
            <p className="mb-6">Marked for Review: {reviewCount}</p>
            {!isRevision && (
              <p className="text-red-600 mb-6 font-semibold">
                ⚠️ This will count as 1 of your 5 mock test attempts!
              </p>
            )}
            <p className="text-gray-700 mb-6">
              {isRevision 
                ? 'You can practice again anytime. Ready to finish this session?' 
                : 'Are you sure you want to submit the test?'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => submitTest(false)}
                className={`flex-1 py-2 ${isRevision ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded`}
              >
                {isRevision ? 'Finish' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
