// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE BATCH PUBLISH API
// app/api/institute/batches/[id]/publish/route.ts
// PATCH: Toggle batch publish status
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

// PATCH: Toggle publish status
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
    if (!instituteData.canManageBatches) {
      return NextResponse.json(
        { error: "You don't have permission to publish batches" },
        { status: 403 }
      );
    }

    // Verify batch belongs to institute
    const batch = await prisma.batch.findFirst({
      where: {
        id: params.id,
        instituteId: instituteData.instituteId,
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const body = await request.json();
    const { isPublished } = body;

    // Update publish status
    const updatedBatch = await prisma.batch.update({
      where: { id: params.id },
      data: { isPublished: isPublished ?? !batch.isPublished },
      select: {
        id: true,
        name: true,
        isPublished: true,
      },
    });

    return NextResponse.json({ 
      batch: updatedBatch,
      message: updatedBatch.isPublished ? "Batch published" : "Batch unpublished"
    });
  } catch (error) {
    console.error("Error toggling publish status:", error);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}
