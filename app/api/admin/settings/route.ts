// ══════════════════════════════════════════════════════════════════════════════
// PATH: app/api/admin/settings/route.ts
// REPLACE ENTIRE FILE WITH THIS:
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET - Fetch all settings
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const whereClause: any = {};
    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    const configs = await prisma.systemConfig.findMany({
      where: whereClause,
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    return NextResponse.json({ configs });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST - Create new setting
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { key, value, label, description, dataType, category } = body;

    if (!key || !value || !label) {
      return NextResponse.json(
        { error: "Key, value, and label are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Setting with key "${key}" already exists` },
        { status: 409 }
      );
    }

    if (dataType === "JSON") {
      try {
        JSON.parse(value);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        );
      }
    }

    const config = await prisma.systemConfig.create({
      data: {
        key,
        value,
        label,
        description: description || null,
        dataType: dataType || "STRING",
        category: category || "PLATFORM",
        isEditable: true,
      },
    });

    return NextResponse.json({ config }, { status: 201 });
  } catch (error) {
    console.error("POST settings error:", error);
    return NextResponse.json(
      { error: "Failed to create setting" },
      { status: 500 }
    );
  }
}

// PUT - Update existing setting
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id, value, label, description, dataType, category } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Setting ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.systemConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    if (!existing.isEditable) {
      return NextResponse.json(
        { error: "This setting cannot be modified" },
        { status: 403 }
      );
    }

    if (dataType === "JSON") {
      try {
        JSON.parse(value);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        );
      }
    }

    const config = await prisma.systemConfig.update({
      where: { id },
      data: {
        value,
        label,
        description: description || null,
        dataType: dataType || existing.dataType,
        category: category || existing.category,
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("PUT settings error:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a setting
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Setting ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.systemConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    await prisma.systemConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE settings error:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  }
}