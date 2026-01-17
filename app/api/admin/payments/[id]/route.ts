// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/admin/payments/[id]/route.ts
// Admin Payment Action - Approve or Reject a payment
// Handles both new (PACKAGE) and legacy (PREMIUM_PLAN) types
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const { action } = await req.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the payment
    const payment = await prisma.paymentProof.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Payment already processed" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    // Use transaction for approve action
    if (action === "approve") {
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.paymentProof.update({
          where: { id },
          data: { status: newStatus },
        });

        // Check if it's a package purchase (handle both new and legacy types)
        const isPackagePurchase = 
          payment.planType === "PACKAGE" || 
          payment.planType === "PREMIUM_PLAN";

        if (isPackagePurchase) {
          // Full package - enable access + set tests
          await tx.user.update({
            where: { id: payment.userId },
            data: {
              packagePurchased: true,
              packagePurchasedDate: new Date(),
              testsCompleted: 0, // Reset tests completed
            },
          });
        } else if (payment.planType === "ADDITIONAL_TEST") {
          // Additional test - decrement testsCompleted by 1 (gives +1 test)
          await tx.user.update({
            where: { id: payment.userId },
            data: {
              testsCompleted: {
                decrement: 1,
              },
            },
          });
        }
      });
    } else {
      // Just reject - update status only
      await prisma.paymentProof.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
    });
  } catch (error) {
    console.error("Payment Action Error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}