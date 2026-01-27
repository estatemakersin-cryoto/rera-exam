// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE SINGLE BATCH API
// app/api/institute/batches/[id]/route.ts
// GET: Get single batch details
// PUT: Update batch
// DELETE: Delete batch (soft delete by setting isActive = false)
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
      canManageBatches: true,
      role: true,
    },
  });

  if (!staffRecord || !staffRecord.institute.isActive) {
    return null;
  }

  return {
    instituteId: staffRecord.instituteId,
    canManageBatches: staffRecord.canManageBatches || staffRecord.role === "OWNER",
  };
}

// Helper to verify batch belongs to institute
async function getBatchForInstitute(batchId: string, instituteId: string) {
  return prisma.batch.findFirst({
    where: {
      id: batchId,
      instituteId: instituteId,
    },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      _count: {
        select: {
          students: true,
          examSessions: true,
        },
      },
    },
  });
}

// GET: Get single batch details
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

    const batch = await getBatchForInstitute(params.id, instituteData.instituteId);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Also get students for this batch
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
      },
      orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json({ batch, students });
  } catch (error) {
    console.error("Error fetching batch:", error);
    return NextResponse.json({ error: "Failed to fetch batch" }, { status: 500 });
  }
}

// PUT: Update batch
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
    if (!instituteData.canManageBatches) {
      return NextResponse.json(
        { error: "You don't have permission to update batches" },
        { status: 403 }
      );
    }

    const batch = await getBatchForInstitute(params.id, instituteData.instituteId);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      branchId,
      mode,
      startDate,
      endDate,
      startTime,
      endTime,
      maxStudents,
      fee,
      address,
      city,
      meetingLink,
      isActive,
      isPublished,
    } = body;

    // Build update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (mode !== undefined) updateData.mode = mode;
    if (startTime !== undefined) updateData.startTime = startTime || null;
    if (endTime !== undefined) updateData.endTime = endTime || null;
    if (maxStudents !== undefined) updateData.maxStudents = parseInt(maxStudents);
    if (fee !== undefined) updateData.fee = parseInt(fee);
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (city !== undefined) updateData.city = city?.trim() || null;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Handle dates
    if (startDate !== undefined) {
      updateData.startDate = new Date(startDate);
    }
    if (endDate !== undefined) {
      updateData.endDate = new Date(endDate);
    }

    // Validate dates if both are being updated
    if (updateData.startDate && updateData.endDate) {
      if (updateData.endDate <= updateData.startDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
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
          return NextResponse.json(
            { error: "Invalid branch selected" },
            { status: 400 }
          );
        }
        updateData.branchId = branchId;
      } else {
        updateData.branchId = null;
      }
    }

    // Update batch
    const updatedBatch = await prisma.batch.update({
      where: { id: params.id },
      data: updateData,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        _count: {
          select: {
            students: true,
            examSessions: true,
          },
        },
      },
    });

    return NextResponse.json({ batch: updatedBatch });
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}

// DELETE: Soft delete batch
export async function DELETE(
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
    if (!instituteData.canManageBatches) {
      return NextResponse.json(
        { error: "You don't have permission to delete batches" },
        { status: 403 }
      );
    }

    const batch = await getBatchForInstitute(params.id, instituteData.instituteId);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Check if batch has students
    if (batch._count.students > 0) {
      return NextResponse.json(
        { error: "Cannot delete batch with enrolled students. Deactivate instead." },
        { status: 400 }
      );
    }

    // Soft delete - set isActive to false
    await prisma.batch.update({
      where: { id: params.id },
      data: { isActive: false, isPublished: false },
    });

    return NextResponse.json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json({ error: "Failed to delete batch" }, { status: 500 });
  }
}
export const PATCH = PUT;