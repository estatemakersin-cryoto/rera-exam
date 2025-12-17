import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Get questions
    const easy = await prisma.question.findMany({
      where: { difficulty: "EASY" },
    });

    const moderate = await prisma.question.findMany({
      where: { difficulty: "MODERATE" },
    });

    if (easy.length < 20 || moderate.length < 30) {
      return NextResponse.json(
        { error: "Not enough questions to start test" },
        { status: 400 }
      );
    }

    // Shuffle
    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

    const questions = [
      ...shuffle(easy).slice(0, 20),
      ...shuffle(moderate).slice(0, 30),
    ];

    // Create attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: null,
        status: "IN_PROGRESS",
        totalQuestions: 50,
      },
    });

    // Create empty responses
    await prisma.response.createMany({
      data: questions.map((q) => ({
        attemptId: attempt.id,
        questionId: q.id,
      })),
    });

    return NextResponse.json({ attemptId: attempt.id });
  } catch (error) {
    console.error("Mock test start route error:", error);
    return NextResponse.json(
      { error: "Failed to start test" },
      { status: 500 }
    );
  }
}