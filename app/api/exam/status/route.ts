// ═══════════════════════════════════════════════════════════════════════════════
// FILE: app/api/exam/status/route.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════════════
// GET: Fetch application status by ID
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("id");

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 });
    }

    const application = await prisma.examApplication.findUnique({
      where: { id: applicationId },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        testAttempt: {
          select: {
            id: true,
            score: true,
            correctAnswers: true,
            totalQuestions: true,
            status: true,
            isPassed: true,
            endTime: true,
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Verify ownership
    if (application.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Get application status error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}