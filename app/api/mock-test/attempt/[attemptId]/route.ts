import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
        user: {
          select: { testsCompleted: true },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // ------------------------------------------
    // CASE 1 — IN PROGRESS (Generate questions)
    // ------------------------------------------
    if (attempt.status === "IN_PROGRESS") {
      const total = attempt.totalQuestions;

      const easyCount = Math.floor(total * 0.3);
      const moderateCount = Math.floor(total * 0.5);
      const hardCount = total - easyCount - moderateCount;

      // Fetch questions by difficulty
      const easy = await prisma.question.findMany({
        where: { difficulty: "EASY" },
      });

      const moderate = await prisma.question.findMany({
        where: { difficulty: "MODERATE" },
      });

      const hard = await prisma.question.findMany({
        where: { difficulty: "HARD" },
      });

      // Helper function to randomly pick unique items
      function pickRandom(list: any[], count: number) {
        return list
          .map((q) => ({ q, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .slice(0, count)
          .map((x) => x.q);
      }

      let selected = [
        ...pickRandom(easy, Math.min(easy.length, easyCount)),
        ...pickRandom(moderate, Math.min(moderate.length, moderateCount)),
        ...pickRandom(hard, Math.min(hard.length, hardCount)),
      ];

      // If shortage in any category → fill balance from all
      if (selected.length < total) {
        const all = [...easy, ...moderate, ...hard];
        const remaining = total - selected.length;

        const extra = pickRandom(all, remaining);

        // Avoid duplicates
        const ids = new Set(selected.map((q) => q.id));
        extra.forEach((q) => {
          if (!ids.has(q.id)) selected.push(q);
        });
      }

      // Final shuffle
      selected = selected
        .map((x) => ({ x, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map((obj) => obj.x);

      // Update attempt responses (clear old & insert new)
      await prisma.response.deleteMany({
        where: { attemptId: attempt.id },
      });

      const responses = await Promise.all(
        selected.map((q) =>
          prisma.response.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
            },
            include: { question: true },
          })
        )
      );

      // Prepare return structure
      const questions = responses.map((r) => ({
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
        userAnswer: null,
        correctAnswer: r.question.correctAnswer,
      }));

      return NextResponse.json({
        attempt: {
          id: attempt.id,
          startTime: attempt.startTime.toISOString(),
          totalQuestions: attempt.totalQuestions,
          testNumber: (attempt.user?.testsCompleted || 0) + 1,
          status: attempt.status, // ✅ CRITICAL: status field must be included
        },
        questions,
      });
    }

    // ------------------------------------------
    // CASE 2 — COMPLETED (Show results)
    // ------------------------------------------
    if (attempt.status === "COMPLETED") {
      const questions = attempt.responses.map((r) => ({
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
        isCorrect: r.isCorrect || false,
      }));

      return NextResponse.json({
        attempt: {
          id: attempt.id,
          score: attempt.correctAnswers || 0,
          correctAnswers: attempt.correctAnswers || 0,
          totalQuestions: attempt.totalQuestions,
          startTime: attempt.startTime.toISOString(),
          endTime: attempt.endTime?.toISOString(),
          testNumber: (attempt.user?.testsCompleted || 0) + 1,
          status: attempt.status, // ✅ CRITICAL: status field must be included
        },
        questions,
      });
    }

    return NextResponse.json({ error: "Unknown status" }, { status: 400 });
  } catch (error) {
    console.error("Attempt Load Error:", error);
    return NextResponse.json({ error: "Failed to load attempt" }, { status: 500 });
  }
}