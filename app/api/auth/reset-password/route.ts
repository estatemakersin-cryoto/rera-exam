// app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { hashPassword } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

interface ResetTokenPayload {
  userId: string;
  mobile: string;
  purpose: string;
}

async function verifyResetToken(token: string): Promise<ResetTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    
    // Verify it's a reset token, not a regular auth token
    if (payload.purpose !== "password-reset") {
      return null;
    }
    
    return payload as unknown as ResetTokenPayload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await req.json();

    // Validate inputs
    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Verify the reset token
    const payload = await verifyResetToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 401 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, mobile: true, fullName: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify mobile matches (extra security)
    if (user.mobile !== payload.mobile) {
      return NextResponse.json(
        { error: "Invalid reset request" },
        { status: 401 }
      );
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update the password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    console.log(`✅ Password reset successful for user: ${user.fullName} (${user.mobile})`);

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. Please login with your new password.",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}