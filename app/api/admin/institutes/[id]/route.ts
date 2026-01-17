// ══════════════════════════════════════════════════════════════════════════════
// ADMIN INSTITUTE DETAIL API
// app/api/admin/institutes/[id]/route.ts
// GET: Get institute with branches
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const institute = await prisma.institute.findUnique({
      where: { id },
      include: {
        branches: {
          orderBy: [{ isHeadOffice: "desc" }, { isOnline: "desc" }, { createdAt: "asc" }],
          include: {
            _count: {
              select: {
                batches: true,
                students: true,
              },
            },
          },
        },
        _count: {
          select: {
            batches: true,
            students: true,
          },
        },
      },
    });

    if (!institute) {
      return NextResponse.json({ error: "Institute not found" }, { status: 404 });
    }

    return NextResponse.json({ institute });
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching institute:", error);
    return NextResponse.json({ error: "Failed to fetch institute" }, { status: 500 });
  }
}
