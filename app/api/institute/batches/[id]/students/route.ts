// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE BATCH STUDENTS API
// app/api/institute/batches/[id]/students/route.ts
// GET: List students in a specific batch
// POST: Add student to batch
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
      canManageBatches: true,
      role: true,
    },
  });

  if (!staffRecord || !staffRecord.institute.isActive) {
    return null;
  }

  return {
    instituteId: staffRecord.instituteId,
    canManageStudents: staffRecord.canManageStudents || staffRecord.role === "OWNER",
    canManageBatches: staffRecord.canManageBatches || staffRecord.role === "OWNER",
  };
}

// GET: List students in batch
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !isInstituteRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instituteData = await getInstituteForUser(session.userId);
    if (!instituteData) {
      return NextResponse.json({ error: "Institute not found" }, { status: 404 });
    }

    // Verify batch belongs to institute
    const batch = await prisma.batch.findFirst({
      where: {
        id: params.id,
        instituteId: instituteData.instituteId,
      },
      select: {
        id: true,
        name: true,
        maxStudents: true,
        mode: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Get students in this batch
    const students = await prisma.instituteStudent.findMany({
      where: { batchId: params.id },
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
      },
      orderBy: [{ status: "asc" }, { enrolledAt: "desc" }],
    });

    return NextResponse.json({ batch, students });
  } catch (error) {
    console.error("Error fetching batch students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// POST: Add student to batch (transfer or new enrollment)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "You don't have permission to manage students" },
        { status: 403 }
      );
    }

    // Verify batch belongs to institute and has capacity
    const batch = await prisma.batch.findFirst({
      where: {
        id: params.id,
        instituteId: instituteData.instituteId,
        isActive: true,
      },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found or inactive" }, { status: 404 });
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Check capacity
    if (batch._count.students >= batch.maxStudents) {
      return NextResponse.json(
        { error: "Batch is at full capacity" },
        { status: 400 }
      );
    }

    // Find the student enrollment record
    const student = await prisma.instituteStudent.findFirst({
      where: {
        id: studentId,
        instituteId: instituteData.instituteId,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update student's batch
    const updatedStudent = await prisma.instituteStudent.update({
      where: { id: studentId },
      data: {
        batchId: params.id,
        branchId: batch.branchId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            mobile: true,
          },
        },
      },
    });

    return NextResponse.json({
      student: updatedStudent,
      message: `${updatedStudent.user.fullName} added to ${batch.name}`,
    });
  } catch (error) {
    console.error("Error adding student to batch:", error);
    return NextResponse.json({ error: "Failed to add student" }, { status: 500 });
  }
}
