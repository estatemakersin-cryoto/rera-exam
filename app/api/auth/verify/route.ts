import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    // No token = not logged in (not an error)
    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify JWT
    let payload;
    try {
      const result = await jwtVerify(token, SECRET);
      payload = result.payload;
    } catch {
      // Invalid/expired token = not logged in
      return NextResponse.json({ user: null });
    }

    const userId = payload.userId as string;
    if (!userId) {
      return NextResponse.json({ user: null });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        isAdmin: true,
        isActive: true,
        isVerified: true,
        avatar: true,
        packagePurchased: true,
        packagePurchasedDate: true,
        packageExpiry: true,
        testsRemaining: true,
        testsUnlocked: true,
        testsCompleted: true,
        referralCount: true,
        referralCode: true,
        referredBy: true,
      },
    });

    // User not found or inactive = treat as not logged in
    if (!user || !user.isActive) {
      return NextResponse.json({ user: null });
    }

    // Return user data
    return NextResponse.json({
      user: {
        ...user,
        role: user.role || "USER",
      },
    });
  } catch (error) {
    console.error("Verify API Error:", error);
    // Don't expose errors - just return null user
    return NextResponse.json({ user: null });
  }
}