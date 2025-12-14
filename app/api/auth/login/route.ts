import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    const { mobile, password } = await req.json();

    // Validate input
    if (!mobile || mobile.length !== 10) {
      return NextResponse.json(
        { error: "Invalid mobile number" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      );
    }

    // Look for user
    const user = await prisma.user.findUnique({
      where: { mobile },
      select: {
        id: true,
        email: true,
        fullName: true,
        mobile: true,
        passwordHash: true,
        isAdmin: true,
        packagePurchased: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Mobile number not registered" },
        { status: 404 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // ✅ Create JWT token with correct AuthPayload
    const token = await signToken({
      userId: user.id,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email,
      isAdmin: user.isAdmin,
      packagePurchased: user.packagePurchased,
    });

    // Set cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
      },
      { status: 200 }
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}