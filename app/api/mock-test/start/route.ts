import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Removed rollNo requirement since it's not used

    const [easy, moderate] = await Promise.all([
      prisma.question.findMany({ where: { difficulty: "EASY" }, take: 40 }),
      prisma.question.findMany({ where: { difficulty: "MODERATE" }, take: 40 }),
    ]);

    const shuffle = (a: typeof easy) => a.sort(() => 0.5 - Math.random());
    const questions = shuffle([...shuffle(easy).slice(0, 20), ...shuffle(moderate).slice(0, 30)]);

    const attempt = await prisma.testAttempt.create({
      data: { userId: null, status: "IN_PROGRESS", totalQuestions: 50 },
    });

    await prisma.response.createMany({
      data: questions.slice(0, 50).map((q) => ({
        attemptId: attempt.id,
        questionId: q.id,
      })),
    });

    return NextResponse.json({ attemptId: attempt.id });
  } catch (error) {
    console.error("Mock test start error:", error);
    return NextResponse.json({ error: "Failed to start test" }, { status: 500 });
  }
}