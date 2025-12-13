import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Auth required");
  return session;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const userId = session.userId; // ✅ STRING

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let createdCount = 0;
    let skippedExisting = 0;
    let skippedInvalid = 0;

    for (const row of rows) {
      const name =
        (row["Name"] || row["name"] || "").toString().trim() || null;
      const mobile = (row["Mobile"] || row["mobile"] || "").toString().trim();

      if (!mobile) {
        skippedInvalid++;
        continue;
      }

      // Prevent self-referral
      const self = await prisma.user.findFirst({
        where: { id: userId, mobile },
      });
      if (self) {
        skippedInvalid++;
        continue;
      }

      const existing = await prisma.referral.findFirst({
        where: { referrerId: userId, mobile },
      });

      if (existing) {
        skippedExisting++;
        continue;
      }

      await prisma.referral.create({
        data: {
          referrerId: userId,
          name,
          mobile,
          status: "PENDING",
        },
      });

      createdCount++;
    }

    return NextResponse.json({
      success: true,
      createdCount,
      skippedExisting,
      skippedInvalid,
      totalRows: rows.length,
    });
  } catch (err: any) {
    console.error("Referral BULK POST error:", err);
    if (err.message === "Auth required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to process bulk referral upload" },
      { status: 500 }
    );
  }
}
