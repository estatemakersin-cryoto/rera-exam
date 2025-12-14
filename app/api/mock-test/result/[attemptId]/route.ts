import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Auth required");
  return session;
}

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated. Please login." },
        { status: 401 }
      );
    }

    // ... Add the rest of your POST logic here ...
    // (whatever the POST function is supposed to do)

  } catch (err: any) {
    console.error("POST Error:", err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        responses: {
          include: { question: true },
          orderBy: { createdAt: "asc" },
        },
        user: { select: { testsCompleted: true } },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Test attempt not found" },
        { status: 404 }
      );
    }

    const questions = attempt.responses.map((r: any) => ({
      responseId: r.id,
      questionId: r.question.id,
      questionEn: r.question.questionEn,
      questionMr: r.question.questionMr,
      optionAEn: r.question.optionAEn,
      optionAMr: r.question.optionAMr,
      optionBEn: r.question.optionBEn,
      optionBMr: r.question.optionBMr,
      optionCEn: r.question.optionCEn,
      optionCMr: r.question.optionCMr,
      optionDEn: r.question.optionDEn,
      optionDMr: r.question.optionDMr,
      userAnswer: r.userAnswer,
      correctAnswer: r.question.correctAnswer,
      isCorrect: r.isCorrect,
    }));

    const testNumber = (attempt.user?.testsCompleted || 0) + 1;

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: attempt.score || 0,
        correctAnswers: attempt.correctAnswers || 0,
        totalQuestions: attempt.totalQuestions,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        testNumber,
      },
      questions,
    });
  } catch (error) {
    console.error("RESULT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load result data" },
      { status: 500 }
    );
  }
}