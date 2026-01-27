// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/admin/payments/[id]/route.ts
// Admin Payment Action - Approve or Reject a payment
// Handles both PaymentProof and ExamPayment models
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
    const { action, source } = await req.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    // Handle ExamPayment (course enrollment)
    if (source === "examPayment") {
      const payment = await prisma.examPayment.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      if (payment.status !== "PENDING") {
        return NextResponse.json({ error: "Payment already processed" }, { status: 400 });
      }

      // Update payment status
      await prisma.examPayment.update({
        where: { id },
        data: {
          status: newStatus,
          approvedAt: action === "approve" ? new Date() : null,
          rejectedAt: action === "reject" ? new Date() : null,
        },
      });

      // Update InstituteStudent status
      if (payment.planType === "TRAINING_COURSE") {
        const instituteStudent = await prisma.instituteStudent.findFirst({
          where: {
            userId: payment.userId,
            status: "APPLIED",
          },
          orderBy: { appliedAt: "desc" },
        });

        if (instituteStudent) {
          await prisma.instituteStudent.update({
            where: { id: instituteStudent.id },
            data: {
              status: action === "approve" ? "ENROLLED" : "DROPPED",
              enrolledAt: action === "approve" ? new Date() : null,
            },
          });
        }
      }

      return NextResponse.json({ success: true, status: newStatus });
    }

    // Handle PaymentProof (exam package, additional test)
    const payment = await prisma.paymentProof.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 });
    }

    // Update payment status
    await prisma.paymentProof.update({
      where: { id },
      data: { status: newStatus },
    });

    // If approved, update user access
    if (action === "approve") {
      const isPackagePurchase =
        payment.planType === "PACKAGE" || payment.planType === "PREMIUM_PLAN";

      if (isPackagePurchase) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            packagePurchased: true,
            packagePurchasedDate: new Date(),
            testsCompleted: 0,
          },
        });
      } else if (payment.planType === "ADDITIONAL_TEST") {
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            testsCompleted: { decrement: 1 },
          },
        });
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Payment Action Error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}