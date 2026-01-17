// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/payment/latest/route.ts
// Get user's latest payment status for dashboard
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ status: "NONE" });
    }

    // Get user's latest payment
    const latestPayment = await prisma.paymentProof.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        planType: true,
        amount: true,
        createdAt: true,
      },
    });

    if (!latestPayment) {
      return NextResponse.json({ status: "NONE" });
    }

    return NextResponse.json({
      status: latestPayment.status,
      planType: latestPayment.planType,
      amount: latestPayment.amount,
      createdAt: latestPayment.createdAt,
    });
  } catch (error) {
    console.error("Payment Latest Error:", error);
    return NextResponse.json({ status: "NONE" });
  }
}