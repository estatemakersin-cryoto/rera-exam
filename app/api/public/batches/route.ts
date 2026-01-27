// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC BATCHES API
// app/api/public/batches/route.ts
// GET: Fetch published batches from active institutes for enrollment page
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode"); // ONLINE, OFFLINE, or null for all

    // Build where clause
    const where: any = {
      isPublished: true,
      isActive: true,
      // Only future or ongoing batches
      endDate: { gte: new Date() },
      // Only from active and verified institutes
      institute: {
        isActive: true,
        isVerified: true,
      },
    };

    // Filter by mode if specified
    if (mode === "ONLINE" || mode === "OFFLINE") {
      where.mode = mode;
    }

    const batches = await prisma.batch.findMany({
      where,
      orderBy: [
        { mode: "asc" }, // OFFLINE first, then ONLINE
        { startDate: "asc" }, // Earliest first
      ],
      select: {
        id: true,
        name: true,
        description: true,
        mode: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        maxStudents: true,
        fee: true,
        city: true,
        address: true,
        institute: {
          select: {
            id: true,
            name: true,
            city: true,
            contactPhone: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        _count: {
          select: {
            students: {
              where: {
                status: { in: ["APPLIED", "ENROLLED"] },
              },
            },
          },
        },
      },
    });

    // Transform data for frontend
    const formattedBatches = batches.map((batch) => ({
      id: batch.id,
      name: batch.name,
      description: batch.description,
      mode: batch.mode,
      startDate: batch.startDate,
      endDate: batch.endDate,
      startTime: batch.startTime,
      endTime: batch.endTime,
      fee: batch.fee,
      // Location - prefer batch city, then branch city, then institute city
      city: batch.city || batch.branch?.city || batch.institute.city,
      address: batch.address,
      // Institute info
      instituteName: batch.institute.name,
      instituteId: batch.institute.id,
      institutePhone: batch.institute.contactPhone,
      // Branch info
      branchName: batch.branch?.name || null,
      // Capacity
      maxStudents: batch.maxStudents,
      enrolledCount: batch._count.students,
      seatsAvailable: batch.maxStudents - batch._count.students,
      isFull: batch._count.students >= batch.maxStudents,
    }));

    // Separate online and offline batches
    const onlineBatches = formattedBatches.filter((b) => b.mode === "ONLINE");
    const offlineBatches = formattedBatches.filter((b) => b.mode === "OFFLINE");

    return NextResponse.json({
      batches: formattedBatches,
      onlineBatches,
      offlineBatches,
      totalCount: formattedBatches.length,
    });
  } catch (error) {
    console.error("Error fetching public batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}