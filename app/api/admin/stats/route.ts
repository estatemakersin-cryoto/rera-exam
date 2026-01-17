// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/admin/stats/route.ts
// Admin dashboard statistics
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // This month's date range
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // User Stats
    const totalUsers = await prisma.user.count();
    
    const paidUsers = await prisma.user.count({
      where: { packagePurchased: true },
    });

    const usersToday = await prisma.user.count({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    const paidToday = await prisma.user.count({
      where: {
        packagePurchased: true,
        packagePurchasedDate: { gte: todayStart, lte: todayEnd },
      },
    });

    // Payment Stats
    const pendingPayments = await prisma.paymentProof.count({
      where: { status: "PENDING" },
    });

    // Total Revenue (all time)
    const revenueResult = await prisma.paymentProof.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" },
    });

    // Revenue Today
    const revenueTodayResult = await prisma.paymentProof.aggregate({
      _sum: { amount: true },
      where: { 
        status: "APPROVED",
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    // Revenue This Month
    const revenueMonthResult = await prisma.paymentProof.aggregate({
      _sum: { amount: true },
      where: { 
        status: "APPROVED",
        createdAt: { gte: monthStart },
      },
    });

    // Institute Stats
    const activeInstitutes = await prisma.institute.count({
      where: { isActive: true },
    });

    const totalBranches = await prisma.instituteBranch.count({
      where: { isActive: true },
    });

    const totalBatches = await prisma.batch.count({
      where: { isActive: true },
    });

    const examPackagePrice = await getConfig<number>("exam_package_price") || 350;

    return NextResponse.json({
      // User stats
      totalUsers,
      paidUsers,
      usersToday,
      paidToday,
      
      // Revenue stats
      revenue: revenueResult._sum?.amount || 0,
      revenueToday: revenueTodayResult._sum?.amount || 0,
      revenueThisMonth: revenueMonthResult._sum?.amount || 0,
      examPackagePrice,
      
      // Payment counts
      pendingPayments,
      
      // Institute stats
      activeInstitutes,
      totalBranches,
      totalBatches,
    });
    
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}