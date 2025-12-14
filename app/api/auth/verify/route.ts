import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    // Get session from JWT cookie
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return sanitized user object
    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        registrationNo: user.registrationNo,

        packagePurchased: user.packagePurchased,
        packagePurchasedDate: user.packagePurchasedDate,
        packageExpiry: user.packageExpiry,

        testsRemaining: user.testsRemaining,
        testsUnlocked: user.testsUnlocked,
        testsCompleted: user.testsCompleted,

        referralCount: user.referralCount,
        referralCode: user.referralCode,
        referredBy: user.referredBy,

        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.error("Verify API Error:", error);
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
