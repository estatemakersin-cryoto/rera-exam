import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch single revision by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const revisionId = parseInt(id);

    if (isNaN(revisionId)) {
      return NextResponse.json(
        { error: "Invalid revision ID" },
        { status: 400 }
      );
    }

    const revision = await prisma.revisionContent.findUnique({
      where: { id: revisionId },
      include: {
        chapter: {
          select: { id: true, chapterNumber: true, titleEn: true, titleMr: true },
        },
      },
    });

    if (!revision) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, revision });
  } catch (err: any) {
    console.error("Revision GET error:", err);
    
    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch revision" },
      { status: 500 }
    );
  }
}

// PUT - Update revision
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const revisionId = parseInt(id);

    if (isNaN(revisionId)) {
      return NextResponse.json(
        { error: "Invalid revision ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    console.log("📝 Updating revision:", revisionId, body);

    // Check if revision exists
    const existing = await prisma.revisionContent.findUnique({
      where: { id: revisionId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    
    if (body.titleEn !== undefined) updateData.titleEn = body.titleEn;
    if (body.titleMr !== undefined) updateData.titleMr = body.titleMr;
    if (body.contentEn !== undefined) updateData.contentEn = body.contentEn || null;
    if (body.contentMr !== undefined) updateData.contentMr = body.contentMr || null;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl || null;
    if (body.qaJson !== undefined) updateData.qaJson = body.qaJson;
    if (body.order !== undefined) updateData.order = body.order;

    console.log("📝 Update data:", updateData);

    // Update the revision
    const updated = await prisma.revisionContent.update({
      where: { id: revisionId },
      data: updateData,
    });

    console.log("✅ Revision updated:", updated.id);

    return NextResponse.json({
      success: true,
      message: "Revision updated successfully",
      revision: updated,
    });
  } catch (err: any) {
    console.error("Revision PUT error:", err);
    
    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Failed to update revision" },
      { status: 500 }
    );
  }
}

// DELETE - Delete revision
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const revisionId = parseInt(id);

    if (isNaN(revisionId)) {
      return NextResponse.json(
        { error: "Invalid revision ID" },
        { status: 400 }
      );
    }

    // Check if revision exists
    const existing = await prisma.revisionContent.findUnique({
      where: { id: revisionId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    await prisma.revisionContent.delete({
      where: { id: revisionId },
    });

    console.log("✅ Revision deleted:", revisionId);

    return NextResponse.json({
      success: true,
      message: "Revision deleted successfully",
    });
  } catch (err: any) {
    console.error("Revision DELETE error:", err);
    
    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: "Failed to delete revision" },
      { status: 500 }
    );
  }
}