// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/admin/stats/route.ts
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const totalUsers = await prisma.user.count();
    const premiumUsers = await prisma.user.count({
      where: { packagePurchased: true },
    });

    const pendingPayments = await prisma.paymentProof.count({
      where: { status: "PENDING" },
    });

    const approvedPayments = await prisma.paymentProof.count({
      where: { status: "APPROVED" },
    });

    const revenue = await prisma.paymentProof.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" },
    });

    const examPackagePrice = await getConfig<number>("exam_package_price");

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      pendingPayments,
      approvedPayments,
      totalRevenue: revenue._sum.amount || 0,
      examPackagePrice,
    });
    
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}