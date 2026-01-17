// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE DASHBOARD API
// app/api/institute/dashboard/route.ts
// GET: Dashboard stats and data for institute owner
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isInstituteRole } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is institute owner/staff
    if (!isInstituteRole(session.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get user's institute
    const staffRecord = await prisma.instituteStaff.findFirst({
      where: {
        userId: session.userId,
        isActive: true,
      },
      include: {
        institute: true,
      },
    });

    if (!staffRecord || !staffRecord.institute) {
      return NextResponse.json(
        { error: "Institute not found" },
        { status: 404 }
      );
    }

    const institute = staffRecord.institute;

    // Get branches with counts
    const branches = await prisma.instituteBranch.findMany({
      where: { instituteId: institute.id },
      orderBy: [{ isHeadOffice: "desc" }, { createdAt: "asc" }],
      include: {
        _count: {
          select: {
            batches: true,
            students: true,
          },
        },
      },
    });

    // Get batch stats
    const batchStats = await prisma.batch.aggregate({
      where: { instituteId: institute.id },
      _count: true,
    });

    const activeBatches = await prisma.batch.count({
      where: {
        instituteId: institute.id,
        isActive: true,
        endDate: { gte: new Date() },
      },
    });

    // Get student stats
    const totalStudents = await prisma.instituteStudent.count({
      where: { instituteId: institute.id },
    });

    const completedStudents = await prisma.instituteStudent.count({
      where: {
        instituteId: institute.id,
        status: "COMPLETED",
      },
    });

    // Get recent batches
    const recentBatches = await prisma.batch.findMany({
      where: { instituteId: institute.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        branch: { select: { name: true } },
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json({
      institute: {
        id: institute.id,
        name: institute.name,
        code: institute.code,
        validUntil: institute.validUntil,
        isActive: institute.isActive,
      },
      stats: {
        totalBranches: branches.length,
        totalBatches: batchStats._count,
        activeBatches,
        totalStudents,
        completedStudents,
      },
      branches,
      recentBatches,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}