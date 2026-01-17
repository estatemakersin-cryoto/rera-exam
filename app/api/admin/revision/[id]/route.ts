import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Fetch single revision by ID
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid revision ID" },
        { status: 400 }
      );
    }

    const revision = await prisma.revisionContent.findUnique({
      where: { id },
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
  } catch (e) {
    console.error("Get revision error:", e);
    return NextResponse.json(
      { error: "Failed to fetch revision" },
      { status: 500 }
    );
  }
}

// PUT - Update revision
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid revision ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Check if revision exists
    const existing = await prisma.revisionContent.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    // Update with provided fields, fallback to existing values
    const updated = await prisma.revisionContent.update({
      where: { id },
      data: {
        titleEn: body.titleEn ?? existing.titleEn,
        titleMr: body.titleMr ?? existing.titleMr,
        contentEn: body.contentEn !== undefined ? body.contentEn : existing.contentEn,
        contentMr: body.contentMr !== undefined ? body.contentMr : existing.contentMr,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
        videoUrl: body.videoUrl !== undefined ? body.videoUrl : existing.videoUrl,
        qaJson: body.qaJson !== undefined ? body.qaJson : existing.qaJson,
        order: body.order ?? existing.order,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Revision updated successfully",
      revision: updated,
    });
  } catch (e) {
    console.error("Update revision error:", e);
    return NextResponse.json(
      { error: "Failed to update revision" },
      { status: 500 }
    );
  }
}

// DELETE - Delete revision
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid revision ID" },
        { status: 400 }
      );
    }

    // Check if revision exists
    const existing = await prisma.revisionContent.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    await prisma.revisionContent.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Revision deleted successfully",
    });
  } catch (e) {
    console.error("Delete revision error:", e);
    return NextResponse.json(
      { error: "Failed to delete revision" },
      { status: 500 }
    );
  }
}