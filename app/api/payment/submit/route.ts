import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Auth required");
  return session;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated. Please login." },
        { status: 401 }
      );
    }

    // Parse request body
    const { transactionId, notes } = await req.json();

    if (!transactionId?.trim()) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const planType = "PLAN_500";
    const amount = 500;

    console.log("📝 Creating payment proof for user:", session.userId);

    // Create payment proof
    const payment = await prisma.paymentProof.create({
      data: {
        userId: session.userId,           // ✅ session.userId is a String (cuid)
        amount: amount,
        planType: planType,
        transactionId: transactionId.trim(),
        notes: notes?.trim() || null,
        status: "PENDING",
      },
    });

    console.log("✅ Payment proof created successfully:", payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
    });

  } catch (err: any) {
    console.error("❌ Payment submit error:", err);
    console.error("Error details:", {
      code: err.code,
      message: err.message,
      meta: err.meta,
    });
    
    // Handle specific Prisma errors
    if (err.code === 'P2003') {
      return NextResponse.json(
        { error: "User not found in database. Please logout and login again." },
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
      { error: err.message || "Failed to submit payment. Please try again." },
      { status: 500 }
    );
  }
}
