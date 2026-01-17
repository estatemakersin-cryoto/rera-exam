// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/admin/payments/route.ts
// Admin Payments API - GET list with status filter
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" | null;

    // Get payments with user info
    const payments = await prisma.paymentProof.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
            mobile: true,
            email: true,
          },
        },
      },
    });

    // Get counts for tabs
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.paymentProof.count({ where: { status: "PENDING" } }),
      prisma.paymentProof.count({ where: { status: "APPROVED" } }),
      prisma.paymentProof.count({ where: { status: "REJECTED" } }),
    ]);

    return NextResponse.json({
      payments,
      counts: {
        PENDING: pendingCount,
        APPROVED: approvedCount,
        REJECTED: rejectedCount,
      },
    });
  } catch (error) {
    console.error("Admin Payments Error:", error);
    return NextResponse.json(
      { error: "Failed to load payments" },
      { status: 500 }
    );
  }
}