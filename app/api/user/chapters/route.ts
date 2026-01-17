import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET - List all active chapters (for users)
export async function GET() {
  try {
    const chapters = await prisma.chapter.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        chapterNumber: "asc",
      },
      select: {
        id: true,
        chapterNumber: true,
        titleEn: true,
        titleMr: true,
        descriptionEn: true,
        descriptionMr: true,
      },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("User chapters API error:", error);
    return NextResponse.json(
      { error: "Failed to load chapters" },
      { status: 500 }
    );
  }
}