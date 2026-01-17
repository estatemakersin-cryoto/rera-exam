// ══════════════════════════════════════════════════════════════════════════════
// INSTITUTE BRANCHES API (VIEW ONLY)
// app/api/institute/branches/route.ts
// GET: List branches for current institute
// NOTE: Branch creation is admin-only via /api/admin/institutes/[id]/branches
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isInstituteRole } from "@/lib/auth";

// Helper to get current user's institute
async function getInstituteForUser(userId: string) {
  const staffRecord = await prisma.instituteStaff.findFirst({
    where: { userId, isActive: true },
    select: { instituteId: true, institute: { select: { isActive: true } } },
  });

  if (!staffRecord || !staffRecord.institute.isActive) {
    return null;
  }

  return staffRecord.instituteId;
}

// GET: List all branches (VIEW ONLY)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isInstituteRole(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instituteId = await getInstituteForUser(session.userId);
    if (!instituteId) {
      return NextResponse.json({ error: "Institute not found" }, { status: 404 });
    }

    const branches = await prisma.instituteBranch.findMany({
      where: { instituteId },
      orderBy: [{ isHeadOffice: "desc" }, { isOnline: "desc" }, { createdAt: "asc" }],
      include: {
        _count: {
          select: {
            batches: true,
            students: true,
          },
        },
      },
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

// POST is intentionally NOT implemented
// Branch creation is admin-only to enable monetization (₹5,000/branch/year)