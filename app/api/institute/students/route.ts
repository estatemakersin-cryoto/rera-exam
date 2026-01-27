// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE STUDENTS API
// app/api/institute/students/route.ts
// GET: List all students for current institute
// POST: Enroll new student
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isInstituteRole } from "@/lib/auth";

// Helper to get current user's institute with permissions
async function getInstituteForUser(userId: string) {
  const staffRecord = await prisma.instituteStaff.findFirst({
    where: { userId, isActive: true },
    select: {
      instituteId: true,
      institute: { select: { isActive: true } },
      canManageStudents: true,
      role: true,
    },
  });

  if (!staffRecord || !staffRecord.institute.isActive) {
    return null;
  }

  return {
    instituteId: staffRecord.instituteId,
    canManageStudents: staffRecord.canManageStudents || staffRecord.role === "OWNER",
  };
}

// GET: List all students
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isInstituteRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instituteData = await getInstituteForUser(session.userId);
    if (!instituteData) {
      return NextResponse.json({ error: "Institute not found" }, { status: 404 });
    }

    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const batchId = searchParams.get("batchId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = { instituteId: instituteData.instituteId };

    if (branchId) where.branchId = branchId;
    if (batchId) where.batchId = batchId;
    if (status && status !== "all") where.status = status;

    // Search filter (applied separately via include)
    const userWhere = search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { mobile: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const students = await prisma.instituteStudent.findMany({
      where: {
        ...where,
        ...(userWhere ? { user: userWhere } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            mobile: true,
            email: true,
            avatar: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            mode: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { appliedAt: "desc" }],
    });

    // Get summary stats
    const stats = await prisma.instituteStudent.groupBy({
      by: ["status"],
      where: { instituteId: instituteData.instituteId },
      _count: true,
    });

    const statusCounts = stats.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      students,
      stats: {
        total: students.length,
        ...statusCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// POST: Enroll new student
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isInstituteRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instituteData = await getInstituteForUser(session.userId);
    if (!instituteData) {
      return NextResponse.json({ error: "Institute not found" }, { status: 404 });
    }

    // Check permission
    if (!instituteData.canManageStudents) {
      return NextResponse.json(
        { error: "You don't have permission to enroll students" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { mobile, fullName, email, branchId, batchId, notes } = body;

    // Validation
    if (!mobile || !fullName) {
      return NextResponse.json(
        { error: "Mobile and full name are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { mobile },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          mobile,
          fullName: fullName.trim(),
          email: email?.trim() || null,
          role: "CANDIDATE",
          isActive: true,
        },
      });
    }

    // Check if already enrolled in this institute
    const existingEnrollment = await prisma.instituteStudent.findFirst({
      where: {
        instituteId: instituteData.instituteId,
        userId: user.id,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Student already enrolled in this institute" },
        { status: 400 }
      );
    }

    // Validate branch if provided
    if (branchId) {
      const branch = await prisma.instituteBranch.findFirst({
        where: {
          id: branchId,
          instituteId: instituteData.instituteId,
          isActive: true,
        },
      });
      if (!branch) {
        return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
      }
    }

    // Validate batch if provided
    if (batchId) {
      const batch = await prisma.batch.findFirst({
        where: {
          id: batchId,
          instituteId: instituteData.instituteId,
          isActive: true,
        },
        include: {
          _count: { select: { students: true } },
        },
      });
      if (!batch) {
        return NextResponse.json({ error: "Invalid batch" }, { status: 400 });
      }
      if (batch._count.students >= batch.maxStudents) {
        return NextResponse.json({ error: "Batch is at full capacity" }, { status: 400 });
      }
    }

    // Create enrollment
    const enrollment = await prisma.instituteStudent.create({
      data: {
        instituteId: instituteData.instituteId,
        userId: user.id,
        branchId: branchId || null,
        batchId: batchId || null,
        status: "ENROLLED",
        enrolledAt: new Date(),
        notes: notes?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            mobile: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        student: enrollment,
        message: `${user.fullName} enrolled successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error enrolling student:", error);
    return NextResponse.json({ error: "Failed to enroll student" }, { status: 500 });
  }
}
