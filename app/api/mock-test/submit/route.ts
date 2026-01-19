import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log("\n🚀 ========== SUBMIT API CALLED ==========");
  
  try {
    const { attemptId } = await req.json();
    console.log("📋 Attempt ID:", attemptId);

    if (!attemptId) {
      return NextResponse.json(
        { error: "Attempt ID required" },
        { status: 400 }
      );
    }

    // Get current session
    const session = await getSession();
    console.log("👤 Session:", session ? { userId: session.userId } : "NO SESSION");

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        responses: {
          include: { question: true },
        },
        user: true,
      },
    });

    if (!attempt) {
      console.log("❌ Attempt not found!");
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    console.log("📝 Attempt found:", {
      id: attempt.id,
      visaluserId: attempt.userId,
      status: attempt.status,
      responseCount: attempt.responses.length,
    });

    if (attempt.status === "COMPLETED") {
      console.log("⚠️ Already completed!");
      return NextResponse.json(
        { 
          error: "Already submitted",
          attemptId: attemptId,
          redirectUrl: `/mock-test/result/${attemptId}`
        },
        { status: 400 }
      );
    }

    let correct = 0;

    // Evaluate answers
    console.log("📊 Evaluating answers...");
    const updates = attempt.responses.map((r) => {
      const isCorrect = r.userAnswer === r.question.correctAnswer;
      if (isCorrect) correct++;

      return prisma.response.update({
        where: { id: r.id },
        data: { isCorrect },
      });
    });

    await Promise.all(updates);
    console.log("✅ Answers evaluated. Correct:", correct, "/ Total:", attempt.responses.length);

    // Update attempt result
    console.log("📝 Updating attempt status to COMPLETED...");
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        endTime: new Date(),
        correctAnswers: correct,
        score: correct,
      },
    });
    console.log("✅ Attempt updated successfully");

    // UPDATE USER
    const userId = attempt.userId || session?.userId;
    console.log("👤 User ID to update:", userId);

    if (userId) {
      try {
        // First, get current user state
        const userBefore = await prisma.user.findUnique({
          where: { id: userId },
          select: { testsCompleted: true, testsRemaining: true, testsUnlocked: true }
        });
        console.log("📊 User BEFORE update:", userBefore);

        // Update user
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            testsCompleted: { increment: 1 },
            testsRemaining: { decrement: 1 },
          },
          select: { testsCompleted: true, testsRemaining: true, testsUnlocked: true }
        });
        console.log("✅ User AFTER update:", updatedUser);
        
      } catch (userUpdateError: any) {
        console.error("❌ USER UPDATE FAILED:", userUpdateError.message);
        console.error("Full error:", userUpdateError);
      }
    } else {
      console.log("⚠️ NO USER ID - Cannot update user stats!");
    }

    console.log("🎉 ========== SUBMIT COMPLETE ==========\n");

    return NextResponse.json({ 
      success: true,
      attemptId: attemptId,
      redirectUrl: `/mock-test/result/${attemptId}`,
      score: correct,
      totalQuestions: attempt.responses.length,
      percentage: Math.round((correct / attempt.responses.length) * 100)
    });

  } catch (error: any) {
    console.error("❌ SUBMIT ERROR:", error.message);
    console.error("Full error:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}