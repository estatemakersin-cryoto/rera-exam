import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch single chapter by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const chapterId = parseInt(id);

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: "Invalid chapter ID" },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        _count: {
          select: {
            questions: true,
            revision: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, chapter });
  } catch (err: any) {
    console.error("Chapter GET error:", err);
    
    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

// PUT - Update chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const chapterId = parseInt(id);

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: "Invalid chapter ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    console.log("📝 Updating chapter:", chapterId, body);

    // Check if chapter exists
    const existing = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Build update data - only include fields that are provided
    const updateData: any = {};

    if (body.chapterNumber !== undefined) updateData.chapterNumber = body.chapterNumber;
    if (body.titleEn !== undefined) updateData.titleEn = body.titleEn;
    if (body.titleMr !== undefined) updateData.titleMr = body.titleMr || null;
    if (body.actChapterNameEn !== undefined) updateData.actChapterNameEn = body.actChapterNameEn || null;
    if (body.actChapterNameMr !== undefined) updateData.actChapterNameMr = body.actChapterNameMr || null;
    if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn || null;
    if (body.descriptionMr !== undefined) updateData.descriptionMr = body.descriptionMr || null;
    if (body.mahareraEquivalentEn !== undefined) updateData.mahareraEquivalentEn = body.mahareraEquivalentEn || null;
    if (body.mahareraEquivalentMr !== undefined) updateData.mahareraEquivalentMr = body.mahareraEquivalentMr || null;
    if (body.sections !== undefined) updateData.sections = body.sections || null;
    if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.displayInApp !== undefined) updateData.displayInApp = body.displayInApp;

    console.log("📝 Update data:", updateData);

    // Update the chapter
    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: updateData,
    });

    console.log("✅ Chapter updated:", updated.id, updated.titleEn);

    return NextResponse.json({
      success: true,
      message: "Chapter updated successfully",
      chapter: updated,
    });
  } catch (err: any) {
    console.error("Chapter PUT error:", err);
    
    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle unique constraint violation
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Chapter number already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

// DELETE - Delete chapter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const chapterId = parseInt(id);

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: "Invalid chapter ID" },
        { status: 400 }
      );
    }

    // Check if chapter exists
    const existing = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        _count: {
          select: {
            questions: true,
            revision: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if chapter has questions or revisions
    if (existing._count.questions > 0 || existing._count.revision > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete chapter with ${existing._count.questions} questions and ${existing._count.revision} revisions. Remove them first.` 
        },
        { status: 400 }
      );
    }

    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (err: any) {
    console.error("Chapter DELETE error:", err);
    
    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}