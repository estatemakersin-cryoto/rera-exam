// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/payment/submit/route.ts
// User submits payment proof after UPI payment
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated. Please login." },
        { status: 401 }
      );
    }

    const { transactionId, notes, paymentType } = await req.json();

    if (!transactionId?.trim()) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Determine amount based on payment type
    let amount: number;
    let planType: string;

    if (paymentType === "additional") {
      amount = await getConfig<number>("additional_test_price") || 100;
      planType = "ADDITIONAL_TEST";
    } else {
      amount = await getConfig<number>("exam_package_price") || 1000;
      planType = "PACKAGE";
    }

    console.log("📝 Creating payment proof:", { userId: session.userId, planType, amount });

    const payment = await prisma.paymentProof.create({
      data: {
        userId: session.userId,
        amount: amount,
        planType: planType,
        transactionId: transactionId.trim(),
        notes: notes?.trim() || null,
        status: "PENDING",
      },
    });

    console.log("✅ Payment proof created:", payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
    });

  } catch (err: any) {
    console.error("❌ Payment submit error:", err);
    
    if (err.code === 'P2003') {
      return NextResponse.json(
        { error: "User not found. Please logout and login again." },
        { status: 400 }
      );
    }

    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: "This transaction ID has already been submitted." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to submit payment." },
      { status: 500 }
    );
  }
}