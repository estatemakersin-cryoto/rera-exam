import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - List all revisions (optionally filter by chapter)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    const where = chapterId ? { chapterId: parseInt(chapterId) } : {};

    const revisions = await prisma.revisionContent.findMany({
      where,
      orderBy: [
        { chapterId: "asc" },
        { order: "asc" },
      ],
      include: {
        chapter: {
          select: {
            id: true,
            chapterNumber: true,
            titleEn: true,
            titleMr: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, revisions });
  } catch (err: any) {
    console.error("Revisions GET error:", err);

    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to load revisions" },
      { status: 500 }
    );
  }
}

// POST - Create new revision
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    
    console.log("📝 Creating revision:", body);

    // Validate required fields
    if (!body.chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    if (!body.titleEn?.trim()) {
      return NextResponse.json(
        { error: "Title (English) is required" },
        { status: 400 }
      );
    }

    if (!body.titleMr?.trim()) {
      return NextResponse.json(
        { error: "Title (Marathi) is required" },
        { status: 400 }
      );
    }

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(body.chapterId) },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Create the revision
    const revision = await prisma.revisionContent.create({
      data: {
        chapterId: parseInt(body.chapterId),
        titleEn: body.titleEn.trim(),
        titleMr: body.titleMr.trim(),
        contentEn: body.contentEn || null,
        contentMr: body.contentMr || null,
        imageUrl: body.imageUrl || null,
        videoUrl: body.videoUrl || null,
        qaJson: body.qaJson || [],
        order: body.order ?? 0,
      },
    });

    console.log("✅ Revision created:", revision.id);

    return NextResponse.json({
      success: true,
      message: "Revision created successfully",
      revision,
    });
  } catch (err: any) {
    console.error("Revision POST error:", err);

    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create revision" },
      { status: 500 }
    );
  }
}