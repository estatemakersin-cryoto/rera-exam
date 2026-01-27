// app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export const dynamic = 'force-dynamic';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Generate a short-lived reset token (15 minutes)
async function generateResetToken(userId: string, mobile: string) {
  return new SignJWT({ userId, mobile, purpose: "password-reset" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(SECRET);
}

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();

    // Validate mobile
    if (!mobile || mobile.length !== 10) {
      return NextResponse.json(
        { error: "Enter valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { mobile },
      select: {
        id: true,
        mobile: true,
        fullName: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Mobile number not registered. Please contact admin." },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = await generateResetToken(user.id, user.mobile!);
    
    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    console.log("===========================================");
    console.log("🔐 PASSWORD RESET REQUEST");
    console.log("===========================================");
    console.log(`User: ${user.fullName}`);
    console.log(`Mobile: ${user.mobile}`);
    console.log("Token expires in 15 minutes");
    console.log("===========================================");

    return NextResponse.json({
      success: true,
      resetUrl,
      userName: user.fullName,
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}