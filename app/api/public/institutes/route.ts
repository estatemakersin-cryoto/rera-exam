// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC INSTITUTES API
// app/api/public/institutes/route.ts
// Returns list of active institutes for public browsing
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: List all active institutes (public)
export async function GET() {
  try {
    const institutes = await prisma.institute.findMany({
      where: {
        isActive: true,
        // Only show institutes with valid subscription
        validUntil: {
          gte: new Date(),
        },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        contactPhone: true,
        branches: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            city: true,
            isOnline: true,
          },
          orderBy: [{ isHeadOffice: "desc" }, { name: "asc" }],
        },
        _count: {
          select: {
            batches: {
              where: { isActive: true, isPublished: true },
            },
            students: true,
          },
        },
      },
    });

    return NextResponse.json({ institutes });
  } catch (error) {
    console.error("Error fetching institutes:", error);
    
    // Return empty array on error (graceful degradation)
    return NextResponse.json({ institutes: [] });
  }
}