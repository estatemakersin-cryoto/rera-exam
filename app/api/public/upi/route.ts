// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC UPI API
// app/api/public/upi/route.ts
// Returns UPI details for payment pages based on type (exam or course)
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "exam"; // exam or course

  try {
    // Fetch all UPI related settings
    const settings = await prisma.systemConfig.findMany({
      where: {
        key: {
          in: [
            "upi_id", "upi_name", "upi_phone",
            "course_upi_id", "course_upi_name", "course_upi_phone",
          ],
        },
      },
    });

    // Build settings map
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Return based on type
    if (type === "course") {
      // Use course_upi_* if available, otherwise fallback to upi_*
      return NextResponse.json({
        upiId: settingsMap["course_upi_id"] || settingsMap["upi_id"] || "vaishkamath@oksbi",
        upiName: settingsMap["course_upi_name"] || settingsMap["upi_name"] || "Vaishali Kamath",
        upiPhone: settingsMap["course_upi_phone"] || settingsMap["upi_phone"] || "9699091086",
      });
    }

    // For exam, use upi_* keys
    return NextResponse.json({
      upiId: settingsMap["upi_id"] || "vaishkamath@oksbi",
      upiName: settingsMap["upi_name"] || "Vaishali Kamath",
      upiPhone: settingsMap["upi_phone"] || "9699091086",
    });
  } catch (error) {
    console.error("Error fetching UPI settings:", error);
    return NextResponse.json({
      upiId: "vaishkamath@oksbi",
      upiName: "Vaishali Kamath",
      upiPhone: "9699091086",
    });
  }
}