// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/public/settings/route.ts
// Public settings API - returns exam price, test count, chapter count
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemConfig.findMany({
      where: {
        key: {
          in: [
            "exam_package_price",
            "total_mock_tests",
            "total_chapters",
            "additional_test_price",
          ],
        },
      },
    });

    const config: Record<string, any> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    // Count chapters from DB if not set
    const chapterCount = await prisma.chapter.count({ where: { isActive: true } });

    return NextResponse.json({
      examPackagePrice: Number(config.exam_package_price) || 350,
      totalMockTests: Number(config.exam_package_tests) || 2,
      totalChapters: Number(config.total_chapters) || chapterCount || 11,
      additionalTestPrice: Number(config.additional_test_price) || 100,
    });
  } catch (error) {
    console.error("Settings Error:", error);
    return NextResponse.json({
      examPackagePrice: 350,
      examPackageTests: 2,
      totalChapters: 11,
      additionalTestPrice: 100,
    });
  }
}