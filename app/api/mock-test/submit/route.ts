import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId } = await req.json();

    if (!attemptId) {
      return NextResponse.json(
        { error: "Attempt ID required" },
        { status: 400 }
      );
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        responses: {
          include: { question: true },
        },
        user: true, // ⚡ Optional user load
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Already submitted" },
        { status: 400 }
      );
    }

    let correct = 0;

    // Evaluate answers
    const updates = attempt.responses.map((r) => {
      const isCorrect = r.userAnswer === r.question.correctAnswer;
      if (isCorrect) correct++;

      return prisma.response.update({
        where: { id: r.id },
        data: { isCorrect },
      });
    });

    await Promise.all(updates);

    // Update attempt result
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        endTime: new Date(),
        correctAnswers: correct,
        score: correct,
      },
    });

    // ---------------------------------------------------------
    // OPTIONAL USER UPDATE (only if userId exists)
    // ---------------------------------------------------------
    if (attempt.userId) {
      await prisma.user.update({
        where: { id: attempt.userId },
        data: {
          testsCompleted: { increment: 1 },
          testsRemaining: { decrement: 1 },
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Submit Error:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}
