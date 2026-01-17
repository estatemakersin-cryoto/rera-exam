// ══════════════════════════════════════════════════════════════════════════════
// ADMIN INSTITUTES API
// app/api/admin/institutes/route.ts
// GET: List all institutes
// POST: Create new institute + User + Default Branches
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

// Generate random password
function generatePassword(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Generate institute code from name
function generateCode(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${random}`;
}

// GET: List all institutes with counts
export async function GET() {
  try {
    await requireAdmin();

    const institutes = await prisma.institute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            branches: true,
            batches: true,
            students: true,
          },
        },
      },
    });

    return NextResponse.json({ institutes });
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching institutes:", error);
    return NextResponse.json(
      { error: "Failed to fetch institutes" },
      { status: 500 }
    );
  }
}

// POST: Create new institute
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      description,
      contactPerson,
      contactPhone,
      contactEmail,
      address,
      city,
      subscriptionMonths = 12,
    } = body;

    // Validate required fields
    if (!name || !contactPerson || !contactPhone || !contactEmail || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: contactEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { mobile: contactPhone },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Generate password and code
    const password = generatePassword();
    const passwordHash = await hashPassword(password);
    const code = generateCode(name);

    // Calculate subscription expiry
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + subscriptionMonths);

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User with INSTITUTE_OWNER role
      const user = await tx.user.create({
        data: {
          fullName: contactPerson,
          email: contactEmail,
          mobile: contactPhone,
          passwordHash,
          role: "INSTITUTE_OWNER",
          isActive: true,
          isVerified: true,
        },
      });

      // 2. Create Institute
      const institute = await tx.institute.create({
        data: {
          name,
          code,
          description,
          contactPerson,
          contactPhone,
          contactEmail,
          address,
          city,
          isActive: true,
          isVerified: true,
          verifiedAt: new Date(),
          validUntil,
        },
      });

      // 3. Create InstituteStaff entry (owner)
      await tx.instituteStaff.create({
        data: {
          instituteId: institute.id,
          userId: user.id,
          role: "OWNER",
          isActive: true,
          canManageStudents: true,
          canManageBatches: true,
          canManageExams: true,
          canManageQuestions: true,
          canViewReports: true,
        },
      });

      // 4. Create Head Office Branch
      await tx.instituteBranch.create({
        data: {
          instituteId: institute.id,
          name: `${city} - Head Office`,
          address,
          city,
          contactPerson,
          contactPhone,
          isActive: true,
          isHeadOffice: true,
          isOnline: false,
        },
      });

      // 5. Create Online Branch (virtual)
      await tx.instituteBranch.create({
        data: {
          instituteId: institute.id,
          name: "Online Classes",
          isActive: true,
          isHeadOffice: false,
          isOnline: true,
        },
      });

      return { user, institute };
    });

    return NextResponse.json({
      success: true,
      institute: {
        id: result.institute.id,
        name: result.institute.name,
        code: result.institute.code,
      },
      credentials: {
        email: contactEmail,
        password,
      },
    });
  } catch (error: any) {
    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating institute:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create institute" },
      { status: 500 }
    );
  }
}
