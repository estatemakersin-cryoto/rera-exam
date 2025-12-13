import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const chapterId = req.nextUrl.searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "chapterId is required" },
        { status: 400 }
      );
    }

    const revisions = await prisma.revisionContent.findMany({
      where: { chapterId: Number(chapterId) },
      orderBy: { order: "asc" },
      select: {
        id: true,
        chapterId: true,
        titleEn: true,
        titleMr: true,
        contentEn: true,
        contentMr: true,
        imageUrl: true,
        qaJson: true,
        order: true,
      }
    });

    return NextResponse.json(
      { revisions },  // ✅ Changed from 'content' to 'revisions'
      { status: 200 }
    );
    
  } catch (error) {
    console.error("❌ User Revision API Error:", error);
    return NextResponse.json(
      { error: "Failed to load revision content" },
      { status: 500 }
    );
  }
}
