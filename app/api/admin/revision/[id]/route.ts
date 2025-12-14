import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid revision ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.titleEn || !body.titleMr) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.revisionContent.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

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
