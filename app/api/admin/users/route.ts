import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,  // ✅ Use fullName instead of name
        email: true,
        mobile: true,  // ✅ Use mobile instead of phone
        packagePurchased: true,  // ✅ Use your actual field
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);

  } catch (err: any) {
    console.error("Admin Users Error:", err);

    if (err.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}
