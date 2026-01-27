// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/admin/payments/route.ts
// Admin Payments API - Fetches from both PaymentProof and ExamPayment
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    // Get payments from PaymentProof (exam package, additional test)
    const paymentProofs = await prisma.paymentProof.findMany({
      where: statusParam ? { status: statusParam as "PENDING" | "APPROVED" | "REJECTED" } : {},
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

    // Get payments from ExamPayment (training course)
    const examPayments = await prisma.examPayment.findMany({
      where: statusParam ? { status: statusParam as "PENDING" | "APPROVED" | "REJECTED" } : {},
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
            mobile: true,
            email: true,
          },
        },
        institute: {
          select: {
            name: true,
          },
        },
      },
    });

    // Merge and sort by createdAt
    const allPayments = [
      ...paymentProofs.map((p) => ({
        ...p,
        source: "paymentProof" as const,
        instituteName: null as string | null,
      })),
      ...examPayments.map((p) => ({
        ...p,
        source: "examPayment" as const,
        instituteName: p.institute?.name || null,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get counts for tabs
    const [proofPending, proofApproved, proofRejected] = await Promise.all([
      prisma.paymentProof.count({ where: { status: "PENDING" } }),
      prisma.paymentProof.count({ where: { status: "APPROVED" } }),
      prisma.paymentProof.count({ where: { status: "REJECTED" } }),
    ]);

    const [examPending, examApproved, examRejected] = await Promise.all([
      prisma.examPayment.count({ where: { status: "PENDING" } }),
      prisma.examPayment.count({ where: { status: "APPROVED" } }),
      prisma.examPayment.count({ where: { status: "REJECTED" } }),
    ]);

    return NextResponse.json({
      payments: allPayments,
      counts: {
        PENDING: proofPending + examPending,
        APPROVED: proofApproved + examApproved,
        REJECTED: proofRejected + examRejected,
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