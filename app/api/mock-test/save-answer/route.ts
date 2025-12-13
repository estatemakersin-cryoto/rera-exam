// app/api/mock-test/save-answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { responseId, answer } = await request.json();

    if (!responseId) {
      return NextResponse.json(
        { error: "Response ID is required" },
        { status: 400 }
      );
    }

    // Update response
    await prisma.response.update({
      where: { id: responseId },
      data: {
        userAnswer: answer || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save answer error:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
