import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { fullName, email, password, mobile } = await req.json();

    if (!fullName || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 }
      );
    }

    // Need either email or mobile
    if (!email && !mobile) {
      return NextResponse.json(
        { error: "Email or mobile is required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await prisma.user.findFirst({ where: { email } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
    }

    // Check if mobile already exists
    if (mobile) {
      const existingMobile = await prisma.user.findFirst({ where: { mobile } });
      if (existingMobile) {
        return NextResponse.json(
          { error: "Mobile number already registered" },
          { status: 400 }
        );
      }
    }

    // Generate referral code
    const referralCode = "EM" + Math.floor(100000 + Math.random() * 900000);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email: email || null,
        mobile: mobile || null,
        passwordHash: hashedPassword,
        referralCode,
        role: 'CANDIDATE',
        isAdmin: false,
        packagePurchased: false,
        testsRemaining: 2,
      },
    });

    // JWT PAYLOAD
    const payload = {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      role: user.role,
      packagePurchased: user.packagePurchased,
    };

    const token = await signToken(payload);

    // Response
    const res = NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        referralCode: user.referralCode,
      },
    });

    // Cookie
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}