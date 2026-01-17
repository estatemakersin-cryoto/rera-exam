// ══════════════════════════════════════════════════════════════════════════════
// ADMIN INSTITUTE BRANCHES API
// app/api/admin/institutes/[id]/branches/route.ts
// POST: Add branch to institute (Admin only)
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();

    const { id: instituteId } = await params;
    const body = await request.json();

    const {
      name,
      city,
      address,
      contactPerson,
      contactPhone,
      isOnline,
      subscriptionFee,
      validMonths,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Branch name is required" }, { status: 400 });
    }

    if (!isOnline && !city) {
      return NextResponse.json({ error: "City is required for physical branches" }, { status: 400 });
    }

    // Verify institute exists
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
    });

    if (!institute) {
      return NextResponse.json({ error: "Institute not found" }, { status: 404 });
    }

    // Calculate validity
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + (validMonths || 12));

    // Create branch
    const branch = await prisma.instituteBranch.create({
      data: {
        instituteId,
        name,
        city: isOnline ? null : city,
        address: isOnline ? null : address,
        contactPerson,
        contactPhone,
        isOnline: isOnline || false,
        isHeadOffice: false,
        isActive: true,
        subscriptionFee: subscriptionFee || 5000,
        validUntil,
        approvedAt: new Date(),
        approvedBy: session.userId,
      },
    });

    return NextResponse.json({
      success: true,
      branch: {
        id: branch.id,
        name: branch.name,
      },
    });
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating branch:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
