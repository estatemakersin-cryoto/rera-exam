// ══════════════════════════════════════════════════════════════════════════════
// ADMIN BRANCH STATUS API
// app/api/admin/institutes/[id]/branches/[branchId]/status/route.ts
// PATCH: Toggle branch active status
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  try {
    await requireAdmin();

    const { id: instituteId, branchId } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be boolean" }, { status: 400 });
    }

    // Verify branch belongs to institute
    const branch = await prisma.instituteBranch.findFirst({
      where: { id: branchId, instituteId },
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    // Update status
    const updated = await prisma.instituteBranch.update({
      where: { id: branchId },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      branch: {
        id: updated.id,
        name: updated.name,
        isActive: updated.isActive,
      },
    });
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating branch:", error);
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}
