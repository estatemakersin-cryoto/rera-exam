// ═══════════════════════════════════════════════════════════════════════════════
// FILE: app/api/exam/session/start/route.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════════════
// POST: Start exam session - creates a TestAttempt linked to ExamApplication
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 });
    }

    // Fetch application
    const application = await prisma.examApplication.findUnique({
      where: { id: applicationId },
      include: {
        testAttempt: true,
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already has an attempt
    if (application.testAttemptId) {
      const existingAttempt = await prisma.testAttempt.findUnique({
        where: { id: application.testAttemptId }
      });
      
      if (existingAttempt) {
        if (existingAttempt.status === "IN_PROGRESS") {
          // Resume existing attempt
          return NextResponse.json({ attemptId: existingAttempt.id });
        }
        
        if (existingAttempt.status === "COMPLETED") {
          return NextResponse.json({ 
            error: "You have already completed this exam" 
          }, { status: 400 });
        }
      }
    }

    // Check application status
    if (application.status !== "ADMIT_CARD_ISSUED") {
      return NextResponse.json({ 
        error: "Cannot start exam. Invalid application status." 
      }, { status: 400 });
    }

    // Get questions for the exam
    // Using same logic as mock test - 50 questions with difficulty distribution
    const totalQuestions = 50;
    const easyCount = 15;     // 30%
    const moderateCount = 25; // 50%
    const hardCount = 10;     // 20%

    const [easy, moderate, hard] = await Promise.all([
      prisma.question.findMany({ where: { difficulty: "EASY", isActive: true } }),
      prisma.question.findMany({ where: { difficulty: "MODERATE", isActive: true } }),
      prisma.question.findMany({ where: { difficulty: "HARD", isActive: true } }),
    ]);

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

    // Create test attempt with mode = REAL_EXAM
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.userId,
        status: "IN_PROGRESS",
        mode: "REAL_EXAM",
        totalQuestions: totalQuestions,
        durationMinutes: 60,
        passingMarks: 20,
      },
    });

    // Create responses
    await prisma.response.createMany({
      data: selectedQuestions.map((q) => ({
        attemptId: attempt.id,
        questionId: q.id,
      })),
    });

    // Link attempt to application and update status
    await prisma.examApplication.update({
      where: { id: applicationId },
      data: {
        testAttemptId: attempt.id,
        status: "APPEARED",
        examAttended: true,
      }
    });

    // Create log
    await prisma.applicationLog.create({
      data: {
        applicationId,
        action: "exam_started",
        description: `Practice exam started. Attempt ID: ${attempt.id}`,
        previousStatus: "ADMIT_CARD_ISSUED",
        newStatus: "APPEARED",
        performedBy: session.userId,
      }
    });

    return NextResponse.json({ 
      attemptId: attempt.id,
      message: "Exam started successfully"
    });
  } catch (error) {
    console.error("Start exam error:", error);
    return NextResponse.json({ error: "Failed to start exam" }, { status: 500 });
  }
}