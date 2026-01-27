// ══════════════════════════════════════════════════════════════════════════════
// COURSE ENROLLMENT API
// app/api/course/enroll/route.ts
// POST: Submit course enrollment with payment details
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      batchId,
      fullName,
      mobile,
      email,
      panNumber,
      transactionId,
      notes,
      amount,
    } = body;

    // Validation
    if (!batchId || !fullName || !mobile || !email || !panNumber || !transactionId || !amount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid PAN number format" },
        { status: 400 }
      );
    }

    // Validate mobile format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number" },
        { status: 400 }
      );
    }

    // Verify batch exists and is available
    const batch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        isPublished: true,
        isActive: true,
        endDate: { gte: new Date() },
        institute: {
          isActive: true,
          isVerified: true,
        },
      },
      include: {
        institute: {
          select: {
            id: true,
            name: true,
            revenueSharePercent: true,
          },
        },
        _count: {
          select: {
            students: {
              where: {
                status: { in: ["APPLIED", "ENROLLED"] },
              },
            },
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found or no longer available" },
        { status: 404 }
      );
    }

    // Check if batch is full
    if (batch._count.students >= batch.maxStudents) {
      return NextResponse.json(
        { error: "This batch is full. Please select another batch." },
        { status: 400 }
      );
    }

    // Check for existing enrollment with same mobile in this batch
    const existingByMobile = await prisma.instituteStudent.findFirst({
      where: {
        batchId: batchId,
        user: {
          mobile: mobile,
        },
        status: { in: ["APPLIED", "ENROLLED"] },
      },
    });

    if (existingByMobile) {
      return NextResponse.json(
        { error: "This mobile number is already enrolled in this batch" },
        { status: 400 }
      );
    }

    // Try to get logged in user or find/create by mobile
    let userId: string;
    const session = await getSession();

    if (session?.userId) {
      userId = session.userId;
    } else {
      // Find or create user by mobile
      let user = await prisma.user.findUnique({
        where: { mobile },
      });

      if (!user) {
        // Create new user
        const referralCode = `EM${mobile.slice(-6)}${Date.now().toString(36).slice(-4).toUpperCase()}`;
        
        user = await prisma.user.create({
          data: {
            mobile,
            email: email.toLowerCase(),
            fullName: fullName.toUpperCase(),
            referralCode,
            isVerified: false,
          },
        });
      }

      userId = user.id;
    }

    // Calculate revenue split
    // Default: Platform 20%, Institute 80%
    const platformSharePercent = batch.institute.revenueSharePercent || 20;
    const instituteSharePercent = 100 - platformSharePercent;
    const platformShare = Math.round((amount * platformSharePercent) / 100);
    const instituteShare = amount - platformShare;

    // Create InstituteStudent record
    const enrollment = await prisma.instituteStudent.create({
      data: {
        instituteId: batch.institute.id,
        userId: userId,
        batchId: batchId,
        branchId: batch.branchId,
        status: "APPLIED",
        notes: `PAN: ${panNumber.toUpperCase()}\nEmail: ${email}\nTransaction: ${transactionId}${notes ? `\nNotes: ${notes}` : ""}`,
      },
    });

    // Create ExamPayment record for admin approval
    const payment = await prisma.paymentProof.create({
      data: {
        userId: userId,
        amount: amount,
        planType: "TRAINING_COURSE",
        transactionId: transactionId,
        notes: `Batch: ${batch.name}\nInstitute: ${batch.institute.name}\nPAN: ${panNumber.toUpperCase()}${notes ? `\nNotes: ${notes}` : ""}`,
        status: "PENDING",
      },
    });

    // Update user details if needed
    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName.toUpperCase(),
        email: email.toLowerCase(),
      },
    });

    const result = { enrollment, payment };

    return NextResponse.json({
      success: true,
      message: "Enrollment submitted successfully",
      enrollmentId: result.enrollment.id,
      paymentId: result.payment.id,
    });
  } catch (error) {
    console.error("Error processing enrollment:", error);
    return NextResponse.json(
      { error: "Failed to process enrollment. Please try again." },
      { status: 500 }
    );
  }
}