import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { rollNo } = await req.json();

    // Not required but keep validation
    if (!rollNo) {
      return NextResponse.json(
        { error: "Roll number required" },
        { status: 400 }
      );
    }

    // Get questions
    const easy = await prisma.question.findMany({
      where: { difficulty: "EASY" },
      take: 40,
    });

    const moderate = await prisma.question.findMany({
      where: { difficulty: "MODERATE" },
      take: 40,
    });

    // Shuffle helper
    const shuffle = (arr: any[]) => arr.sort(() => 0.5 - Math.random());

    // Pick 20 easy + 30 moderate
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

    // Save responses (empty)
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
      { error: "Failed to start mock test" },
      { status: 500 }
    );
  }
}
