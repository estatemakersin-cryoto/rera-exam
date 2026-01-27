// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC SETTINGS API
// app/api/public/settings/route.ts
// Returns exam package prices for dashboard/payment pages
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    examPackagePrice: 1000,
    additionalTestPrice: 100,
    trainingCourseFee: 5900,
    trainingCourseName: "MahaRERA Agent Training Course",
  });
}