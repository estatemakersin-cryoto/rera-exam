import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();

    const chapters = await prisma.chapter.findMany({
      orderBy: { chapterNumber: "asc" },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json({ chapters });

  } catch (err: any) {
    console.error("Chapters GET error:", err);

    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to load chapters" },
      { status: 500 }
    );
  }
}