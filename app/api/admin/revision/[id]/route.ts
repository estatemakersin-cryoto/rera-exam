import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid revision ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.titleEn || !body.titleMr) {
      return NextResponse.json(
        { error: "titleEn and titleMr are required" },
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

    // Update the revision
    const updated = await prisma.revisionContent.update({
      where: { id },
      data: {
        titleEn: body.titleEn,
        titleMr: body.titleMr,
        contentEn: body.contentEn ?? null,
        contentMr: body.contentMr ?? null,
        imageUrl: body.imageUrl ?? null,
        qaJson: body.qaJson ?? [],
        order: body.order ?? existing.order,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Revision updated successfully",
      revision: updated,
    });
  } catch (error) {
    console.error("Update revision error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update revision" },
      { status: 500 }
    );
  }
}
