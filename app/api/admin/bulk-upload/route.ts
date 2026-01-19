import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* ============================================
   SMART MCQ FORMAT CONVERTER
============================================ */
function smartConvertMCQ(item: any): any {
  let converted: any = {
    _wasConverted: false
  };

  converted.chapterNumber = Number(
    item.chapterNumber ?? 
    item.chapter ?? 
    item.chapterNo ?? 
    item.chapterId ??
    item.ch ??
    1
  );

  if (typeof item.question === 'object' && item.question !== null) {
    converted.questionEn = String(item.question.en ?? item.question.english ?? item.question.eng ?? "");
    converted.questionMr = item.question.mr ?? item.question.marathi ?? item.question.mar ?? null;
    converted._wasConverted = true;
  } else {
    converted.questionEn = String(item.questionEn ?? item.question ?? item.q ?? item.questionText ?? item.text ?? "");
    converted.questionMr = item.questionMr ?? item.questionMarathi ?? item.qMr ?? null;
  }

  if (item.options && typeof item.options === 'object' && !Array.isArray(item.options)) {
    const opts = item.options;
    
    if (opts.A && typeof opts.A === 'object') {
      converted.optionAEn = String(opts.A.en ?? opts.A.english ?? opts.A);
      converted.optionAMr = opts.A.mr ?? opts.A.marathi ?? null;
      converted.optionBEn = String(opts.B?.en ?? opts.B?.english ?? opts.B ?? "");
      converted.optionBMr = opts.B?.mr ?? opts.B?.marathi ?? null;
      converted.optionCEn = String(opts.C?.en ?? opts.C?.english ?? opts.C ?? "");
      converted.optionCMr = opts.C?.mr ?? opts.C?.marathi ?? null;
      converted.optionDEn = String(opts.D?.en ?? opts.D?.english ?? opts.D ?? "");
      converted.optionDMr = opts.D?.mr ?? opts.D?.marathi ?? null;
      converted._wasConverted = true;
    } else {
      converted.optionAEn = String(opts.A ?? opts.a ?? "");
      converted.optionBEn = String(opts.B ?? opts.b ?? "");
      converted.optionCEn = String(opts.C ?? opts.c ?? "");
      converted.optionDEn = String(opts.D ?? opts.d ?? "");
      converted.optionAMr = null;
      converted.optionBMr = null;
      converted.optionCMr = null;
      converted.optionDMr = null;
      converted._wasConverted = true;
    }
  } else if (Array.isArray(item.options)) {
    converted.optionAEn = String(item.options[0] ?? "");
    converted.optionBEn = String(item.options[1] ?? "");
    converted.optionCEn = String(item.options[2] ?? "");
    converted.optionDEn = String(item.options[3] ?? "");
    converted.optionAMr = null;
    converted.optionBMr = null;
    converted.optionCMr = null;
    converted.optionDMr = null;
    converted._wasConverted = true;
  } else {
    converted.optionAEn = String(item.optionAEn ?? item.optionA ?? item.a ?? item.option1 ?? "");
    converted.optionAMr = item.optionAMr ?? item.optionAMarathi ?? null;
    converted.optionBEn = String(item.optionBEn ?? item.optionB ?? item.b ?? item.option2 ?? "");
    converted.optionBMr = item.optionBMr ?? item.optionBMarathi ?? null;
    converted.optionCEn = String(item.optionCEn ?? item.optionC ?? item.c ?? item.option3 ?? "");
    converted.optionCMr = item.optionCMr ?? item.optionCMarathi ?? null;
    converted.optionDEn = String(item.optionDEn ?? item.optionD ?? item.d ?? item.option4 ?? "");
    converted.optionDMr = item.optionDMr ?? item.optionDMarathi ?? null;
  }

  const rawAnswer = String(item.correctAnswer ?? item.correct ?? item.answer ?? item.ans ?? item.key ?? "A").toUpperCase();
  if (rawAnswer === "1" || rawAnswer === "A") converted.correctAnswer = "A";
  else if (rawAnswer === "2" || rawAnswer === "B") converted.correctAnswer = "B";
  else if (rawAnswer === "3" || rawAnswer === "C") converted.correctAnswer = "C";
  else if (rawAnswer === "4" || rawAnswer === "D") converted.correctAnswer = "D";
  else converted.correctAnswer = rawAnswer;

  const rawDifficulty = String(item.difficulty ?? item.level ?? item.difficultyLevel ?? "MODERATE").toUpperCase();
  if (rawDifficulty === "EASY" || rawDifficulty === "1") {
    converted.difficulty = "EASY";
  } else if (rawDifficulty === "HARD" || rawDifficulty === "DIFFICULT" || rawDifficulty === "3") {
    converted.difficulty = "HARD";
  } else {
    converted.difficulty = "MODERATE";
  }

  if (typeof item.explanation === 'object' && item.explanation !== null) {
    converted.explanationEn = item.explanation.en ?? item.explanation.english ?? null;
    converted.explanationMr = item.explanation.mr ?? item.explanation.marathi ?? null;
    converted._wasConverted = true;
  } else {
    converted.explanationEn = item.explanationEn ?? item.explanation ?? item.explain ?? null;
    converted.explanationMr = item.explanationMr ?? item.explanationMarathi ?? null;
  }

  return converted;
}

/* ============================================
   SMART REVISION FORMAT CONVERTER
============================================ */
function smartConvertRevision(item: any): any {
  const chapterNumber = Number(
    item.chapterNumber ?? 
    item.chapter ?? 
    item.chapterNo ?? 
    item.courseChapter ??
    item.chapterId
  );

  let titleEn = 
    item.titleEn ?? 
    item.title?.en ?? 
    item.title ?? 
    item.heading ?? 
    item.name ?? 
    item.topicEn ??
    `Chapter ${chapterNumber} Revision`;

  let titleMr = 
    item.titleMr ?? 
    item.title?.mr ?? 
    item.titleMarathi ??
    item.topicMr ??
    titleEn;

  let contentEn = 
    item.contentEn ?? 
    item.content?.en ?? 
    item.content ?? 
    item.notes ?? 
    item.description ?? 
    item.text ??
    null;

  let contentMr = 
    item.contentMr ?? 
    item.content?.mr ?? 
    item.notesMarathi ??
    null;

  let qaJson = 
    item.qaJson ?? 
    item.questions ?? 
    item.qna ?? 
    item.qa ?? 
    item.questionsAndAnswers ??
    [];

  if (Array.isArray(qaJson)) {
    qaJson = qaJson.map((q: any) => ({
      questionEn: q.questionEn ?? q.question?.en ?? q.question ?? q.q ?? "",
      questionMr: q.questionMr ?? q.question?.mr ?? q.questionMarathi ?? q.questionEn ?? q.question ?? "",
      answerEn: q.answerEn ?? q.answer?.en ?? q.answer ?? q.a ?? "",
      answerMr: q.answerMr ?? q.answer?.mr ?? q.answerMarathi ?? q.answerEn ?? q.answer ?? ""
    }));
  }

  const imageUrl = item.imageUrl ?? item.image ?? item.img ?? null;
  const order = Number(item.order ?? item.orderIndex ?? item.sequence ?? 0);

  return {
    chapterNumber,
    titleEn,
    titleMr,
    contentEn,
    contentMr,
    imageUrl,
    qaJson,
    order,
    _wasConverted: true
  };
}

/* ============================================
   MAIN BULK UPLOAD HANDLER
============================================ */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");
    
    let type: string | null = null;
    let resetIds = false;
    let buffer: ArrayBuffer | null = null;
    let items: any[] = [];

    // ============================================
    // HANDLE JSON PASTE
    // ============================================
    if (contentType?.includes("application/json")) {
      const body = await req.json();
      
      // Handle multiple JSON formats
      if (Array.isArray(body)) {
        items = body;
      } else if (Array.isArray(body.data)) {
        items = body.data;
      } else if (Array.isArray(body.data?.chapters)) {
        items = body.data.chapters;
      } else if (Array.isArray(body.data?.questions)) {
        items = body.data.questions;
      } else if (Array.isArray(body.data?.revisions)) {
        items = body.data.revisions;
      } else if (Array.isArray(body.chapters)) {
        items = body.chapters;
      } else if (Array.isArray(body.questions)) {
        items = body.questions;
      } else if (Array.isArray(body.revisions)) {
        items = body.revisions;
      } else if (body.data) {
        items = [body.data];
      } else {
        return NextResponse.json(
          { error: "Invalid JSON format. Expected array or wrapped object like { chapters: [...] }" },
          { status: 400 }
        );
      }
      
      type = body.type;
      resetIds = body.resetIds === "true" || body.resetIds === true;
      
      console.log("📋 JSON Paste Upload:", { 
        type, 
        itemCount: items.length,
        resetIds
      });
    }
    // ============================================
    // HANDLE FILE UPLOAD
    // ============================================
    else if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      buffer = await file.arrayBuffer();
      type = formData.get("type") as string | null;
      resetIds = formData.get("resetIds") === "true";
      
      console.log("📁 File Upload:", { type, fileName: file.name, resetIds });

      // Parse file
      if (type === "mcq") {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // raw: false preserves formatted strings like "5%" instead of converting to 0.05
        items = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { 
          raw: false, 
          defval: "" 
        });
      } else {
        try {
          const json = JSON.parse(Buffer.from(buffer).toString("utf-8"));
          items = Array.isArray(json) ? json : [json];
        } catch (parseError) {
          return NextResponse.json(
            { error: `Invalid JSON file: ${parseError instanceof Error ? parseError.message : 'Parse failed'}` },
            { status: 400 }
          );
        }
      }
    } else {
      return NextResponse.json(
        { error: "Content-Type must be 'application/json' or 'multipart/form-data'" },
        { status: 400 }
      );
    }

    // Validate type
    if (!type) {
      return NextResponse.json({ error: "Upload type is required" }, { status: 400 });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No valid data found. Please check your file format." },
        { status: 400 }
      );
    }

    console.log(`📦 Processing ${items.length} items for type: ${type}`);

    // Load existing chapters
    const chapters = await prisma.chapter.findMany();
    const chapterMap = new Map<number, number>();
    chapters.forEach((ch) => chapterMap.set(ch.chapterNumber, ch.id));

    // =======================================
    // MCQ UPLOAD
    // =======================================
    if (type === "mcq") {
      if (resetIds) {
        await prisma.question.deleteMany({});
        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "Question_id_seq" RESTART WITH 1`
        );
        console.log("✅ Reset all questions and IDs");
      }

      let inserted = 0;
      let skipped = 0;
      let converted = 0;
      const skippedDetails: any[] = [];

      console.log("=== MCQ UPLOAD START ===");
      console.log("Available chapters:", Array.from(chapterMap.keys()));

      for (let i = 0; i < items.length; i++) {
        const rawItem = items[i];
        
        try {
          const item = smartConvertMCQ(rawItem);
          
          if (item._wasConverted) {
            converted++;
          }

          // Validate chapter
          const chapterId = chapterMap.get(item.chapterNumber);
          if (!chapterId) {
            skipped++;
            skippedDetails.push({
              row: i + 1,
              question: item.questionEn?.substring(0, 50) + "...",
              chapterNumber: item.chapterNumber,
              reason: `Chapter ${item.chapterNumber} not found`
            });
            continue;
          }

          // Validate required fields
          if (!item.questionEn || !item.optionAEn || !item.optionBEn || !item.correctAnswer) {
            skipped++;
            skippedDetails.push({
              row: i + 1,
              question: item.questionEn || "Unknown",
              reason: "Missing required fields"
            });
            continue;
          }

          // Check for duplicates
          const existingQuestion = await prisma.question.findFirst({
            where: {
              chapterId,
              questionEn: item.questionEn
            }
          });

          if (existingQuestion) {
            skipped++;
            skippedDetails.push({
              row: i + 1,
              question: item.questionEn.substring(0, 50) + "...",
              reason: "Duplicate question"
            });
            continue;
          }

          // Insert question
          await prisma.question.create({
            data: {
              chapterId,
              questionEn: item.questionEn,
              questionMr: item.questionMr,
              optionAEn: String(item.optionAEn),
              optionAMr: item.optionAMr ? String(item.optionAMr) : null,
              optionBEn: String(item.optionBEn),
              optionBMr: item.optionBMr ? String(item.optionBMr) : null,
              optionCEn: String(item.optionCEn),
              optionCMr: item.optionCMr ? String(item.optionCMr) : null,
              optionDEn: String(item.optionDEn),
              optionDMr: item.optionDMr ? String(item.optionDMr) : null,
              correctAnswer: item.correctAnswer,
              difficulty: item.difficulty,
            },
          });

          inserted++;
        } catch (error: any) {
          console.error(`Error processing row ${i + 1}:`, error);
          skipped++;
          skippedDetails.push({
            row: i + 1,
            reason: error.message
          });
        }
      }

      return NextResponse.json({
        message: `✅ MCQ upload completed!\n\nInserted: ${inserted}\nConverted: ${converted}\nSkipped: ${skipped}`,
        details: { 
          inserted, 
          converted,
          skipped,
          skippedItems: skippedDetails.slice(0, 10)
        }
      });
    }

    // =======================================
    // REVISION UPLOAD
    // =======================================
    if (type === "revision") {
      if (resetIds) {
        await prisma.revisionContent.deleteMany({});
        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "RevisionContent_id_seq" RESTART WITH 1`
        );
        console.log("✅ Reset all revision content and IDs");
      }

      let inserted = 0;
      let skipped = 0;
      let converted = 0;
      const skippedDetails: any[] = [];

      console.log("=== REVISION UPLOAD START ===");
      console.log("Available chapters:", Array.from(chapterMap.keys()));

      for (let i = 0; i < items.length; i++) {
        const rawItem = items[i];
        
        try {
          const item = smartConvertRevision(rawItem);
          
          if (item._wasConverted) {
            converted++;
          }

          // Validate chapter
          if (!item.chapterNumber || isNaN(item.chapterNumber)) {
            skipped++;
            skippedDetails.push({
              row: i + 1,
              title: item.titleEn,
              reason: "Invalid chapterNumber"
            });
            continue;
          }

          const chapterId = chapterMap.get(item.chapterNumber);
          if (!chapterId) {
            skipped++;
            skippedDetails.push({
              row: i + 1,
              title: item.titleEn,
              chapterNumber: item.chapterNumber,
              reason: `Chapter ${item.chapterNumber} not found`
            });
            continue;
          }

          // Validate required fields
          if (!item.titleEn || !item.titleMr) {
            skipped++;
            skippedDetails.push({
              row: i + 1,
              title: item.titleEn || "Unknown",
              reason: "Missing titleEn or titleMr"
            });
            continue;
          }

          // Check for duplicates
          const existingRevision = await prisma.revisionContent.findFirst({
            where: {
              chapterId,
              titleEn: item.titleEn,
              order: item.order
            }
          });

          if (existingRevision) {
            skipped++;
            skippedDetails.push({
              row: i + 1,
              title: item.titleEn,
              reason: "Duplicate revision"
            });
            continue;
          }

          // Insert revision
          await prisma.revisionContent.create({
            data: {
              chapterId,
              titleEn: item.titleEn,
              titleMr: item.titleMr,
              contentEn: item.contentEn,
              contentMr: item.contentMr,
              imageUrl: item.imageUrl,
              qaJson: item.qaJson,
              order: item.order,
            },
          });

          inserted++;
        } catch (error: any) {
          console.error(`Error processing row ${i + 1}:`, error);
          skipped++;
          skippedDetails.push({
            row: i + 1,
            reason: error.message
          });
        }
      }

      return NextResponse.json({
        message: `✅ Revision upload completed!\n\nInserted: ${inserted}\nConverted: ${converted}\nSkipped: ${skipped}`,
        details: {
          inserted,
          converted,
          skipped,
          skippedItems: skippedDetails.slice(0, 10)
        }
      });
    }

    // =======================================
    // CHAPTER UPLOAD
    // =======================================
    if (type === "chapters") {
      if (resetIds) {
        await prisma.revisionContent.deleteMany({});
        await prisma.question.deleteMany({});
        await prisma.chapter.deleteMany({});

        await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Chapter_id_seq" RESTART WITH 1`);
        await prisma.$executeRawUnsafe(`ALTER SEQUENCE "RevisionContent_id_seq" RESTART WITH 1`);
        await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Question_id_seq" RESTART WITH 1`);
        
        console.log("✅ Reset all chapters, questions, and revision content");
      }

      let insertedOrUpdated = 0;
      const errors: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        try {
          // Support both formats: chapterNumber OR courseChapter
          const chapterNumber = Number(item.chapterNumber ?? item.courseChapter);

          if (!chapterNumber || isNaN(chapterNumber)) {
            errors.push(`Row ${i + 1}: Invalid chapterNumber`);
            continue;
          }

          // Smart field mapping for both formats
          const titleEn = item.titleEn || item.courseTitleEn || "";
          const titleMr = item.titleMr || item.courseTitleMr || null;
          const actChapterNameEn = item.actChapterNameEn || item.actTitleEn || item.actChapter || null;
          const actChapterNameMr = item.actChapterNameMr || item.actTitleMr || null;
          
          // Convert arrays to JSON string for storage
          let sectionsData = item.sections || null;
          if (Array.isArray(item.actSectionsReferenced)) {
            sectionsData = JSON.stringify(item.actSectionsReferenced);
          }

          await prisma.chapter.upsert({
            where: { chapterNumber },
            create: {
              chapterNumber,
              titleEn,
              titleMr,
              actChapterNameEn,
              actChapterNameMr,
              sections: sectionsData,
              descriptionEn: item.descriptionEn || null,
              descriptionMr: item.descriptionMr || null,
              mahareraEquivalentEn: item.mahareraEquivalentEn || null,
              mahareraEquivalentMr: item.mahareraEquivalentMr || null,
              orderIndex: item.orderIndex ?? chapterNumber,
              isActive: item.isActive ?? true,
              displayInApp: item.displayInApp ?? true,
            },
            update: {
              titleEn,
              titleMr,
              actChapterNameEn,
              actChapterNameMr,
              sections: sectionsData,
              descriptionEn: item.descriptionEn || null,
              descriptionMr: item.descriptionMr || null,
              mahareraEquivalentEn: item.mahareraEquivalentEn || null,
              mahareraEquivalentMr: item.mahareraEquivalentMr || null,
              orderIndex: item.orderIndex ?? chapterNumber,
              isActive: item.isActive ?? true,
              displayInApp: item.displayInApp ?? true,
            },
          });

          insertedOrUpdated++;
        } catch (error: any) {
          console.error(`Error processing chapter row ${i + 1}:`, error);
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      return NextResponse.json({
        message: `✅ Chapters upload complete!\n\nInserted/Updated: ${insertedOrUpdated}`,
        details: { 
          insertedOrUpdated, 
          errors: errors.length > 0 ? errors.slice(0, 10) : undefined 
        }
      });
    }

    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });

  } catch (error: any) {
    console.error("❌ BULK UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: error.message ?? "Bulk upload failed" },
      { status: 500 }
    );
  }
}