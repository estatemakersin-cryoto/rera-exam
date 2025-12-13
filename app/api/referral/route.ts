import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Helper: ensure user is logged in
async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Auth required");
  return session;
}

// 🔹 Generate / ensure referral code for a user
async function ensureReferralCode(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, fullName: true },
  });

  if (!user) throw new Error("User not found");

  if (user.referralCode) return user.referralCode;

  const newCode = `EM${userId.slice(0, 4).toUpperCase()}${Math.floor(
    100 + Math.random() * 900
  )}`;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { referralCode: newCode },
    select: { referralCode: true },
  });

  return updated.referralCode!;
}

// 🔹 GET → referral summary + list
export async function GET(req: NextRequest) {
  try {
    const session = await requireUser();
    const userId = session.id; // ✅ FIXED

    const referralCode = await ensureReferralCode(userId);

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
    });

    const successfulReferrals = referrals.filter(
      (r) => r.status === "SUCCESS"
    ).length;

    // Unlock pattern: 2, 4 & 5
    let testsUnlockedFromReferrals = 0;
    if (successfulReferrals >= 2) testsUnlockedFromReferrals++;
    if (successfulReferrals >= 4) testsUnlockedFromReferrals++;
    if (successfulReferrals >= 5) testsUnlockedFromReferrals++;

    const shareMessage = `
👋 Hi! I am preparing for the MahaRERA Certificate of Competency exam using EstateMakers.

They provide:
- Unlimited chapter-wise revision
- 5 full mock tests (TCS-style)
- English + Marathi questions
- 50 MCQs • 60 minutes • 100 marks • No negative marking

Register here: https://estatemakers.in/register
Use my referral code: ${referralCode}
So that I can unlock extra mock tests. Thanks! 🙏
`.trim();

    return NextResponse.json({
      referralCode,
      shareMessage,
      successfulReferrals,
      testsUnlockedFromReferrals,
      referrals,
    });
  } catch (err: any) {
    console.error("Referral GET error:", err);
    if (err.message === "Auth required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to load referral data" },
      { status: 500 }
    );
  }
}

// 🔹 POST → add single friend (name + mobile)
export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const userId = session.id; // ✅ FIXED

    const body = await req.json();
    const name = (body.name || "").toString().trim() || null;
    const mobile = (body.mobile || "").toString().trim();

    if (!mobile) {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    // Prevent self-referral by mobile
    const self = await prisma.user.findFirst({
      where: { id: userId, mobile },
      select: { id: true },
    });
    if (self) {
      return NextResponse.json(
        { error: "You cannot refer your own mobile number." },
        { status: 400 }
      );
    }

    // Avoid duplicate referrals for same referrer + mobile
    const existing = await prisma.referral.findFirst({
      where: { referrerId: userId, mobile },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already referred this mobile number." },
        { status: 400 }
      );
    }

    const created = await prisma.referral.create({
      data: {
        referrerId: userId,
        name,
        mobile,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, referral: created });
  } catch (err: any) {
    console.error("Referral POST error:", err);
    if (err.message === "Auth required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create referral" },
      { status: 500 }
    );
  }
}