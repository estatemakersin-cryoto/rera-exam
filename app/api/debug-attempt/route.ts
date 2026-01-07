import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const attempts = await prisma.testAttempt.findMany({
    take: 5,
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json({ attempts });
}
