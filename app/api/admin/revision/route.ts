// app/api/admin/revision/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - List all revisions (optional filter by chapterId)
export async function GET(req: NextRequest) {
  try {
    const chapterId = req.nextUrl.searchParams.get("chapterId");

    const revisions = await prisma.revisionContent.findMany({
      where: chapterId ? { chapterId: Number(chapterId) } : undefined,
      orderBy: [{ chapterId: "asc" }, { order: "asc" }],
      include: {
        chapter: {
          select: { id: true, chapterNumber: true, titleEn: true },
        },
      },
    });

    return NextResponse.json({ revisions });
  } catch (error) {
    console.error("GET revisions error:", error);
    return NextResponse.json({ error: "Failed to fetch revisions" }, { status: 500 });
  }
}

// POST - Create new revision(s)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both single object and array (bulk upload)
    const items = Array.isArray(body) ? body : [body];
    const created = [];
    const skipped = [];

    // Get all chapters for lookup
    const allChapters = await prisma.chapter.findMany({
      select: { id: true, chapterNumber: true, titleEn: true }
    });
    
    const chapterMap = new Map(allChapters.map(ch => [ch.chapterNumber, ch]));

    for (const item of items) {
      let chapter = null;

      // ALWAYS prioritize chapterNumber lookup (this prevents ID mismatch issues)
      if (item.chapterNumber !== undefined) {
        chapter = chapterMap.get(item.chapterNumber);
        
        if (!chapter) {
          console.warn(`Chapter number ${item.chapterNumber} not found, skipping: ${item.titleEn}`);
          skipped.push({
            title: item.titleEn || "Unknown",
            reason: `Chapter number ${item.chapterNumber} not found`
          });
          continue;
        }
      } else if (item.chapterId) {
        // Fallback: verify chapterId exists
        chapter = allChapters.find(ch => ch.id === item.chapterId);
        
        if (!chapter) {
          console.warn(`Chapter ID ${item.chapterId} not found, skipping: ${item.titleEn}`);
          skipped.push({
            title: item.titleEn || "Unknown", 
            reason: `Chapter ID ${item.chapterId} not found`
          });
          continue;
        }
      } else {
        console.warn("No chapter reference provided, skipping:", item.titleEn);
        skipped.push({
          title: item.titleEn || "Unknown",
          reason: "No chapterNumber or chapterId provided"
        });
        continue;
      }

      // Validate required fields
      if (!item.titleEn || !item.titleMr) {
        skipped.push({
          title: item.titleEn || "Unknown",
          reason: "Missing titleEn or titleMr"
        });
        continue;
      }

      const revision = await prisma.revisionContent.create({
        data: {
          chapterId: chapter.id,  // Always use the verified chapter.id
          titleEn: item.titleEn,
          titleMr: item.titleMr,
          contentEn: item.contentEn || null,
          contentMr: item.contentMr || null,
          imageUrl: item.imageUrl || null,
          videoUrl: item.videoUrl || null,
          qaJson: item.qaJson || [],
          order: item.order ?? 0,
        },
      });

      created.push(revision);
      console.log(`✅ Created revision for Chapter ${chapter.chapterNumber}: ${item.titleEn}`);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} revision(s)${skipped.length > 0 ? `, skipped ${skipped.length}` : ''}`,
      details: {
        inserted: created.length,
        skipped: skipped.length,
        skippedItems: skipped,
        availableChapters: allChapters.map(ch => ch.chapterNumber).sort((a, b) => a - b)
      },
      revisions: created,
    }, { status: 201 });

  } catch (error) {
    console.error("POST revision error:", error);
    return NextResponse.json({ error: "Failed to create revision" }, { status: 500 });
  }
}