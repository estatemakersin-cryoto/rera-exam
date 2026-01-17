// ══════════════════════════════════════════════════════════════════════════════
// ADMIN INSTITUTE STATUS API
// app/api/admin/institutes/[id]/status/route.ts
// PATCH: Toggle institute active status
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Update institute status
    const institute = await prisma.institute.update({
      where: { id },
      data: { isActive },
    });

    // Also update all staff users' isActive status
    const staffRecords = await prisma.instituteStaff.findMany({
      where: { instituteId: id },
      select: { userId: true },
    });

    const userIds = staffRecords.map((s) => s.userId);

    if (userIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { isActive },
      });
    }

    return NextResponse.json({
      success: true,
      institute: {
        id: institute.id,
        name: institute.name,
        isActive: institute.isActive,
      },
    });
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating institute status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
