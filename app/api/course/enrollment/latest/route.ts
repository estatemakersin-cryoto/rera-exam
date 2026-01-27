// ══════════════════════════════════════════════════════════════════════════════
// API: Get Latest Course Enrollment
// app/api/course/enrollment/latest/route.ts
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ enrollment: null });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ enrollment: null });
    }

    const enrollment = await prisma.instituteStudent.findFirst({
      where: { userId: payload.userId },
      orderBy: { appliedAt: "desc" },
      include: {
        batch: {
          include: {
            institute: { select: { name: true } },
          },
        },
      },
    });

    if (!enrollment || !enrollment.batch) {
      return NextResponse.json({ enrollment: null });
    }

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        batch: {
          name: enrollment.batch.name,
          startDate: enrollment.batch.startDate,
          mode: enrollment.batch.mode,
          institute: { name: enrollment.batch.institute.name },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return NextResponse.json({ enrollment: null });
  }
}