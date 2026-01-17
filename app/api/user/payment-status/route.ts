// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/user/payment-status/route.ts
// Get user's latest payment status for dashboard notification
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's latest payment
    // Get latest payment - prioritize APPROVED, then PENDING, then REJECTED
    const latestPayment = await prisma.paymentProof.findFirst({
      where: { userId: session.userId },
      orderBy: [
        { status: 'asc' },      // APPROVED comes before PENDING, PENDING before REJECTED
        { createdAt: 'desc' }   // Then by most recent
      ],
      select: {
        id: true,
        status: true,
        planType: true,
        amount: true,
        createdAt: true,
      },
    });

    // Get user's package status
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        packagePurchased: true,
        packagePurchasedDate: true,
        testsCompleted: true,
      },
    });

    return NextResponse.json({
      latestPayment,
      packagePurchased: user?.packagePurchased || false,
      testsCompleted: user?.testsCompleted || 0,
    });
  } catch (error) {
    console.error("Payment Status Error:", error);
    return NextResponse.json(
      { error: "Failed to get payment status" },
      { status: 500 }
    );
  }
}