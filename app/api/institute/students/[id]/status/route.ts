// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE STUDENT STATUS API
// app/api/institute/students/[id]/status/route.ts
// PATCH: Quick status update for student
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

// PATCH: Update student status
export async function PATCH(
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
        { error: "You don't have permission to update student status" },
        { status: 403 }
      );
    }

    // Verify student belongs to institute
    const student = await prisma.instituteStudent.findFirst({
      where: {
        id: params.id,
        instituteId: instituteData.instituteId,
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["APPLIED", "ENROLLED", "COMPLETED", "DROPPED", "REJECTED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    // Build update data with timestamps
    const updateData: any = { status };

    if (status === "ENROLLED" && !student.enrolledAt) {
      updateData.enrolledAt = new Date();
    }
    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    // Update status
    const updatedStudent = await prisma.instituteStudent.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        completedAt: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // Status messages
    const statusMessages: Record<string, string> = {
      ENROLLED: `${updatedStudent.user.fullName} has been enrolled`,
      COMPLETED: `${updatedStudent.user.fullName} marked as completed`,
      DROPPED: `${updatedStudent.user.fullName} marked as dropped`,
      REJECTED: `${updatedStudent.user.fullName} application rejected`,
      APPLIED: `${updatedStudent.user.fullName} status reset to applied`,
    };

    return NextResponse.json({
      student: updatedStudent,
      message: statusMessages[status] || "Status updated",
    });
  } catch (error) {
    console.error("Error updating student status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
