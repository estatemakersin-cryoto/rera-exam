import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const payments = await prisma.paymentProof.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            registrationNo: true,
            packagePurchased: true,
            testsUnlocked: true,
            testsCompleted: true,
            testsRemaining: true,
          },
        },
      },
    });

    return NextResponse.json({ payments });
  } catch (err) {
    console.error("Admin payments GET error:", err);
    return NextResponse.json(
      { error: "Failed to load payments" },
      { status: 500 }
    );
  }
}

// ==============================
// POST → APPROVE / REJECT
// ==============================
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { paymentId, action } = await req.json();

    const payment = await prisma.paymentProof.findUnique({
      where: { id: paymentId },
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

    // ---------------- REJECT ----------------
    if (action === "REJECT") {
      await prisma.paymentProof.update({
        where: { id: paymentId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true });
    }

    // ---------------- APPROVE ----------------
    const user = await prisma.user.findUnique({
      where: { id: payment.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // NEW SINGLE PLAN LOGIC — Always unlock full access
    const totalTests = 5;
    const testsCompleted = user.testsCompleted || 0;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        packagePurchased: true,
        packagePurchasedDate: new Date(),

        // RESET TEST ACCESS FOR PREMIUM
        testsUnlocked: 5,
        testsCompleted: 0,
        testsRemaining: 5,
      },
    });

    // Mark payment approved
    await prisma.paymentProof.update({
      where: { id: paymentId },
      data: { status: "APPROVED" },
    });


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin payments POST error:", err);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
