// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE BATCHES API
// app/api/institute/batches/route.ts
// GET: List batches for current institute
// POST: Create new batch
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isInstituteRole } from "@/lib/auth";

// Helper to get current user's institute
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

// GET: List all batches for institute
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
    const status = searchParams.get("status"); // active, completed, all

    // Build where clause
    const where: any = { instituteId: instituteData.instituteId };
    
    if (branchId) {
      where.branchId = branchId;
    }

    if (status === "active") {
      where.isActive = true;
      where.endDate = { gte: new Date() };
    } else if (status === "completed") {
      where.endDate = { lt: new Date() };
    }

    const batches = await prisma.batch.findMany({
      where,
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
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

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

// POST: Create new batch
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
    if (!instituteData.canManageBatches) {
      return NextResponse.json(
        { error: "You don't have permission to create batches" },
        { status: 403 }
      );
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
    } = body;

    // Validation
    if (!name || !startDate || !endDate || fee === undefined) {
      return NextResponse.json(
        { error: "Name, start date, end date, and fee are required" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // If branchId provided, verify it belongs to this institute
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
    }

    // Create batch
    const batch = await prisma.batch.create({
      data: {
        instituteId: instituteData.instituteId,
        branchId: branchId || null,
        name: name.trim(),
        description: description?.trim() || null,
        mode: mode || "OFFLINE",
        startDate: start,
        endDate: end,
        startTime: startTime || null,
        endTime: endTime || null,
        maxStudents: maxStudents || 50,
        fee: parseInt(fee),
        address: address?.trim() || null,
        city: city?.trim() || null,
        meetingLink: meetingLink?.trim() || null,
        isActive: true,
        isPublished: true,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}
