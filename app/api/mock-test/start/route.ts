import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // ✅ Get user session
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Please login to start test" },
        { status: 401 }
      );
    }

    // Check if user has remaining tests
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { 
        testsCompleted: true, 
        testsUnlocked: true,
        testsRemaining: true,
        packagePurchased: true 
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has purchased package
    if (!user.packagePurchased) {
      return NextResponse.json(
        { error: "Please purchase a package to take tests" },
        { status: 403 }
      );
    }

    // Check if user has remaining tests
    const totalTests = user.testsUnlocked > 0 ? user.testsUnlocked : 2;
    const remaining = totalTests - user.testsCompleted;
    
    if (remaining <= 0) {
      return NextResponse.json(
        { error: "No tests remaining. Please purchase additional tests." },
        { status: 403 }
      );
    }

    // Check for any in-progress test
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: session.userId,
        status: "IN_PROGRESS",
      },
    });

    if (existingAttempt) {
      // Return existing attempt instead of creating new
      return NextResponse.json({ attemptId: existingAttempt.id });
    }

    // Get questions by difficulty
    const [easy, moderate, hard] = await Promise.all([
      prisma.question.findMany({ where: { difficulty: "EASY", isActive: true } }),
      prisma.question.findMany({ where: { difficulty: "MODERATE", isActive: true } }),
      prisma.question.findMany({ where: { difficulty: "HARD", isActive: true } }),
    ]);

    const totalQuestions = 50;
    const easyCount = 15;     // 30%
    const moderateCount = 25; // 50%
    const hardCount = 10;     // 20%

    if (easy.length < easyCount || moderate.length < moderateCount) {
      return NextResponse.json(
        { error: "Not enough questions available. Please contact support." },
        { status: 400 }
      );
    }

    // Shuffle function
    const shuffle = <T>(arr: T[]): T[] => 
      arr.map((q) => ({ q, sort: Math.random() }))
         .sort((a, b) => a.sort - b.sort)
         .map((x) => x.q);

    // Select questions
    let selectedQuestions = [
      ...shuffle(easy).slice(0, easyCount),
      ...shuffle(moderate).slice(0, moderateCount),
      ...shuffle(hard).slice(0, Math.min(hard.length, hardCount)),
    ];

    // Fill remaining if needed
    if (selectedQuestions.length < totalQuestions) {
      const all = [...easy, ...moderate, ...hard];
      const selectedIds = new Set(selectedQuestions.map((q) => q.id));
      const remaining = all.filter((q) => !selectedIds.has(q.id));
      const extra = shuffle(remaining).slice(0, totalQuestions - selectedQuestions.length);
      selectedQuestions = [...selectedQuestions, ...extra];
    }

    // Final shuffle
    selectedQuestions = shuffle(selectedQuestions);

    // ✅ Create attempt with userId
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.userId,  // ✅ Link to user!
        status: "IN_PROGRESS",
        totalQuestions: totalQuestions,
        durationMinutes: 60,
      },
    });

    // ✅ Create responses using createMany (single connection)
    await prisma.response.createMany({
      data: selectedQuestions.map((q) => ({
        attemptId: attempt.id,
        questionId: q.id,
      })),
    });

    return NextResponse.json({ attemptId: attempt.id });
  } catch (error) {
    console.error("Mock test start error:", error);
    return NextResponse.json(
      { error: "Failed to start test" },
      { status: 500 }
    );
  }
}