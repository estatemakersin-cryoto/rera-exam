import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();

    if (!mobile || mobile.length !== 10) {
      return NextResponse.json(
        { error: "Enter valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { mobile },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Mobile number not registered" },
        { status: 404 }
      );
    }

    const token = await signToken({
      id: user.id,
      fullName: user.fullName,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
      packagePurchased: user.packagePurchased,
    });

    const redirect = user.isAdmin ? "/admin" : "/dashboard";

    const res = NextResponse.json({ 
      message: "Login successful", 
      redirect 
    });

    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 604800,
    });

    return res;

  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json(
      { error: "Login failed" }, 
      { status: 500 }
    );
  }
}
