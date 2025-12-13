import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET all questions with filters
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    const difficulty = searchParams.get("difficulty");

    // Build where clause
    const where: any = {};
    
    if (chapterId) {
      where.chapterId = parseInt(chapterId);
    }
    
    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        chapter: {
          select: {
            chapterNumber: true,
            titleEn: true,
            titleMr: true,
          },
        },
      },
      orderBy: { chapterId: 'asc' }
    });

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Questions GET error:", error);

    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST - Create new question
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      chapterId,
      difficulty,
      questionEn,
      questionMr,
      optionAEn,
      optionAMr,
      optionBEn,
      optionBMr,
      optionCEn,
      optionCMr,
      optionDEn,
      optionDMr,
      correctAnswer,
      explanationEn,
      explanationMr,
    } = body;

    // Validation
    if (!chapterId || !difficulty || !questionEn || !correctAnswer) {
      return NextResponse.json(
        { error: "Missing required fields: chapterId, difficulty, questionEn, correctAnswer" },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ["EASY", "MODERATE", "HARD"];
    const difficultyUpper = difficulty.toUpperCase();
    
    if (!validDifficulties.includes(difficultyUpper)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Must be EASY, MODERATE, or HARD" },
        { status: 400 }
      );
    }

    // Validate correct answer
    const validAnswers = ["A", "B", "C", "D"];
    const answerUpper = correctAnswer.toUpperCase();
    
    if (!validAnswers.includes(answerUpper)) {
      return NextResponse.json(
        { error: "Invalid correctAnswer. Must be A, B, C, or D" },
        { status: 400 }
      );
    }

    // Verify chapter exists
    const chapterExists = await prisma.chapter.findUnique({
      where: { id: parseInt(chapterId) },
    });

    if (!chapterExists) {
      return NextResponse.json(
        { error: `Chapter with id ${chapterId} not found` },
        { status: 404 }
      );
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        chapterId: parseInt(chapterId),
        difficulty: difficultyUpper as "EASY" | "MODERATE" | "HARD",
        questionEn,
        questionMr: questionMr || null,
        optionAEn: optionAEn || "",
        optionAMr: optionAMr || null,
        optionBEn: optionBEn || "",
        optionBMr: optionBMr || null,
        optionCEn: optionCEn || "",
        optionCMr: optionCMr || null,
        optionDEn: optionDEn || "",
        optionDMr: optionDMr || null,
        correctAnswer: answerUpper,
      },
      include: {
        chapter: {
          select: {
            chapterNumber: true,
            titleEn: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (error: any) {
    console.error("Create question error:", error);

    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create question" },
      { status: 500 }
    );
  }
}

// PUT - Update question
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Question ID required" },
        { status: 400 }
      );
    }

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Build update data object
    const updateData: any = {};

    // Map fields with validation
    if (updateFields.chapterId !== undefined) {
      updateData.chapterId = parseInt(updateFields.chapterId);
      
      // Verify chapter exists
      const chapterExists = await prisma.chapter.findUnique({
        where: { id: updateData.chapterId },
      });
      
      if (!chapterExists) {
        return NextResponse.json(
          { error: `Chapter with id ${updateData.chapterId} not found` },
          { status: 404 }
        );
      }
    }

    if (updateFields.difficulty !== undefined) {
      const validDifficulties = ["EASY", "MODERATE", "HARD"];
      const difficultyUpper = updateFields.difficulty.toUpperCase();
      
      if (!validDifficulties.includes(difficultyUpper)) {
        return NextResponse.json(
          { error: "Invalid difficulty. Must be EASY, MODERATE, or HARD" },
          { status: 400 }
        );
      }
      
      updateData.difficulty = difficultyUpper as "EASY" | "MODERATE" | "HARD";
    }

    if (updateFields.correctAnswer !== undefined) {
      const validAnswers = ["A", "B", "C", "D"];
      const answerUpper = updateFields.correctAnswer.toUpperCase();
      
      if (!validAnswers.includes(answerUpper)) {
        return NextResponse.json(
          { error: "Invalid correctAnswer. Must be A, B, C, or D" },
          { status: 400 }
        );
      }
      
      updateData.correctAnswer = answerUpper;
    }

    // Map all other fields
    const fieldMapping = [
      "questionEn",
      "questionMr",
      "optionAEn",
      "optionAMr",
      "optionBEn",
      "optionBMr",
      "optionCEn",
      "optionCMr",
      "optionDEn",
      "optionDMr",
      "explanationEn",
      "explanationMr",
    ];

    fieldMapping.forEach((field) => {
      if (updateFields[field] !== undefined) {
        updateData[field] = updateFields[field] || null;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update question
    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        chapter: {
          select: {
            chapterNumber: true,
            titleEn: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (error: any) {
    console.error("Update question error:", error);

    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE question
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Question ID required" },
        { status: 400 }
      );
    }

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Delete question
    await prisma.question.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete question error:", error);

    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
