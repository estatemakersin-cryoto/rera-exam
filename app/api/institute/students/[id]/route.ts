// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE SINGLE STUDENT API
// app/api/institute/students/[id]/route.ts
// GET: Get single student details
// PUT: Update student enrollment
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

// GET: Get single student details
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

    const student = await prisma.instituteStudent.findFirst({
      where: {
        id: params.id,
        instituteId: instituteData.instituteId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            mobile: true,
            email: true,
            avatar: true,
            testsCompleted: true,
            createdAt: true,
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
            fee: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get test attempts for this student in this institute's exam sessions
    const examAttempts = await prisma.testAttempt.findMany({
      where: {
        userId: student.userId,
        examSession: {
          instituteId: instituteData.instituteId,
        },
      },
      include: {
        examSession: {
          select: {
            id: true,
            name: true,
            examDate: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
      take: 10,
    });

    return NextResponse.json({ student, examAttempts });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

// PUT: Update student enrollment
export async function PUT(
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
        { error: "You don't have permission to update students" },
        { status: 403 }
      );
    }

    // Verify student belongs to institute
    const student = await prisma.instituteStudent.findFirst({
      where: {
        id: params.id,
        instituteId: instituteData.instituteId,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await request.json();
    const { branchId, batchId, status, notes } = body;

    // Build update data
    const updateData: any = {};

    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null;
    }

    // Handle branch change
    if (branchId !== undefined) {
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
        updateData.branchId = branchId;
      } else {
        updateData.branchId = null;
      }
    }

    // Handle batch change
    if (batchId !== undefined) {
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
        // Check capacity (exclude current student)
        const currentCount = student.batchId === batchId
          ? batch._count.students
          : batch._count.students;
        if (currentCount >= batch.maxStudents && student.batchId !== batchId) {
          return NextResponse.json({ error: "Batch is at full capacity" }, { status: 400 });
        }
        updateData.batchId = batchId;
        // Also update branch to match batch's branch
        if (batch.branchId) {
          updateData.branchId = batch.branchId;
        }
      } else {
        updateData.batchId = null;
      }
    }

    // Handle status change
    if (status !== undefined) {
      const validStatuses = ["APPLIED", "ENROLLED", "COMPLETED", "DROPPED", "REJECTED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = status;

      // Set timestamps based on status
      if (status === "ENROLLED" && !student.enrolledAt) {
        updateData.enrolledAt = new Date();
      }
      if (status === "COMPLETED") {
        updateData.completedAt = new Date();
      }
    }

    // Update student
    const updatedStudent = await prisma.instituteStudent.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}
