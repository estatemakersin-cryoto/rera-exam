import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { fullName, email, password, mobile } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate registration number
    const regNo = "MR" + Math.floor(100000 + Math.random() * 900000);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        mobile,
        registrationNo: regNo,
        passwordHash: hashedPassword,
        packagePurchased: false,
        testsRemaining: 2,
      },
    });

    // JWT PAYLOAD — MUST MATCH AuthPayload EXACTLY
    const payload = {
      id: user.id,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      packagePurchased: user.packagePurchased,
    };

    const token = await signToken(payload);

    // Response
    const res = NextResponse.json({
      message: "Registration successful",
      user: payload,
    });

    // Cookie
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: true,
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
