import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

/* ============================================
   SMART MCQ FORMAT CONVERTER
   Converts various MCQ JSON formats to bilingual schema
============================================ */
function smartConvertMCQ(item: any): any {
  let converted: any = {
    _wasConverted: false
  };

  // Extract Chapter Number
  converted.chapterNumber = Number(
    item.chapterNumber ?? 
    item.chapter ?? 
    item.chapterNo ?? 
    item.chapterId ??
    item.ch ??
    1
  );

  // Extract Question (English & Marathi)
  if (typeof item.question === 'object' && item.question !== null) {
    converted.questionEn = String(item.question.en ?? item.question.english ?? item.question.eng ?? "");
    converted.questionMr = item.question.mr ?? item.question.marathi ?? item.question.mar ?? null;
    converted._wasConverted = true;
  } else {
    converted.questionEn = String(item.questionEn ?? item.question ?? item.q ?? item.questionText ?? item.text ?? "");
    converted.questionMr = item.questionMr ?? item.questionMarathi ?? item.qMr ?? null;
  }

  // Extract Options
  if (item.options && typeof item.options === 'object' && !Array.isArray(item.options)) {
    const opts = item.options;
    
    if (opts.A && typeof opts.A === 'object') {
      // Nested bilingual options
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
      // Simple object {A: "text", B: "text"}
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
    // Array format
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
    // Individual fields
    converted.optionAEn = String(item.optionAEn ?? item.optionA ?? item.a ?? item.option1 ?? "");
    converted.optionAMr = item.optionAMr ?? item.optionAMarathi ?? null;
    converted.optionBEn = String(item.optionBEn ?? item.optionB ?? item.b ?? item.option2 ?? "");
    converted.optionBMr = item.optionBMr ?? item.optionBMarathi ?? null;
    converted.optionCEn = String(item.optionCEn ?? item.optionC ?? item.c ?? item.option3 ?? "");
    converted.optionCMr = item.optionCMr ?? item.optionCMarathi ?? null;
    converted.optionDEn = String(item.optionDEn ?? item.optionD ?? item.d ?? item.option4 ?? "");
    converted.optionDMr = item.optionDMr ?? item.optionDMarathi ?? null;
  }

  // Extract Correct Answer
  const rawAnswer = String(item.correctAnswer ?? item.correct ?? item.answer ?? item.ans ?? item.key ?? "A").toUpperCase();
  if (rawAnswer === "1" || rawAnswer === "A") converted.correctAnswer = "A";
  else if (rawAnswer === "2" || rawAnswer === "B") converted.correctAnswer = "B";
  else if (rawAnswer === "3" || rawAnswer === "C") converted.correctAnswer = "C";
  else if (rawAnswer === "4" || rawAnswer === "D") converted.correctAnswer = "D";
  else converted.correctAnswer = rawAnswer;

  // Extract Difficulty
  const rawDifficulty = String(item.difficulty ?? item.level ?? item.difficultyLevel ?? "MODERATE").toUpperCase();
  if (rawDifficulty === "EASY" || rawDifficulty === "1") {
    converted.difficulty = "EASY";
  } else if (rawDifficulty === "HARD" || rawDifficulty === "DIFFICULT" || rawDifficulty === "3") {
    converted.difficulty = "HARD";
  } else {
    converted.difficulty = "MODERATE";
  }

  // Extract Explanations
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
   Converts various JSON formats to required schema
============================================ */
function smartConvertRevision(item: any): any {
  // Extract chapter number from various possible fields
  const chapterNumber = Number(
    item.chapterNumber ?? 
    item.chapter ?? 
    item.chapterNo ?? 
    item.courseChapter ??
    item.chapterId
  );

  // Extract titles with fallbacks
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
    titleEn; // Fallback to English if Marathi missing

  // Extract content with fallbacks
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

  // Extract Q&A with fallbacks
  let qaJson = 
    item.qaJson ?? 
    item.questions ?? 
    item.qna ?? 
    item.qa ?? 
    item.questionsAndAnswers ??
    [];

  // Normalize Q&A format
  if (Array.isArray(qaJson)) {
    qaJson = qaJson.map((q: any) => ({
      questionEn: q.questionEn ?? q.question?.en ?? q.question ?? q.q ?? "",
      questionMr: q.questionMr ?? q.question?.mr ?? q.questionMarathi ?? q.questionEn ?? q.question ?? "",
      answerEn: q.answerEn ?? q.answer?.en ?? q.answer ?? q.a ?? "",
      answerMr: q.answerMr ?? q.answer?.mr ?? q.answerMarathi ?? q.answerEn ?? q.answer ?? ""
    }));
  }

  // Extract other fields
  const imageUrl = item.imageUrl ?? item.image ?? item.img ?? null;
  const order = item.order ?? item.orderIndex ?? item.sequence ?? 0;

  return {
    chapterNumber,
    titleEn,
    titleMr,
    contentEn,
    contentMr,
    imageUrl,
    qaJson,
    order,
    _wasConverted: true // Flag to track conversion
  };
}

/* ============================================
   CONTENT ENHANCEMENT HELPERS
============================================ */

/**
 * Extract bullet points from content
 */
function extractBulletPoints(content: string | null): string[] {
  if (!content) return [];
  
  const bullets: string[] = [];
  
  // Split by common bullet indicators
  const lines = content.split(/\n|\\n/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for existing bullet points
    if (trimmed.match(/^[-•*●○▪▫]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      bullets.push(trimmed.replace(/^[-•*●○▪▫]\s+/, '').replace(/^\d+\.\s+/, ''));
    }
    // Extract sentences that look like key points (short, declarative)
    else if (trimmed.length > 10 && trimmed.length < 150 && trimmed.endsWith('.')) {
      bullets.push(trimmed);
    }
  }
  
  return bullets.slice(0, 10); // Limit to 10 points
}

/**
 * Generate additional Q&A from content
 * (Placeholder - in production, use AI API)
 */
function generateAdditionalQA(content: string | null, existingQA: any[]): any[] {
  if (!content || existingQA.length >= 5) return [];
  
  const additionalQA: any[] = [];
  
  // Simple keyword extraction for demo
  // In production, use Claude/GPT API to generate real questions
  
  const keywords = extractKeywords(content);
  
  keywords.slice(0, 3).forEach((keyword, index) => {
    additionalQA.push({
      questionEn: `What is ${keyword}?`,
      questionMr: `${keyword} म्हणजे काय?`,
      answerEn: `${keyword} is explained in the content above.`,
      answerMr: `${keyword} वरील सामग्रीमध्ये स्पष्ट केले आहे.`,
      _autoGenerated: true
    });
  });
  
  return additionalQA;
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string[] {
  if (!content) return [];
  
  // Remove common words
  const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but']);
  
  const words = content
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !commonWords.has(w));
  
  // Count frequency
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  
  // Sort by frequency and return top keywords
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

/**
 * Enhance content with bullet points
 */
function enhanceContent(content: string | null): string | null {
  if (!content) return null;
  
  const bullets = extractBulletPoints(content);
  
  if (bullets.length === 0) return content;
  
  // Add bullet points section if not already present
  if (!content.includes('Key Points') && !content.includes('मुख्य मुद्दे')) {
    return content + '\n\n# Key Points\n' + bullets.map(b => `• ${b}`).join('\n');
  }
  
  return content;
}

/* ============================================
   MAIN BULK UPLOAD HANDLER
============================================ */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");
    
    let type: string | null = null;
    let resetIds = false;
    let enhanceContent_flag = false;
    let buffer: ArrayBuffer | null = null;
    let items: any[] = [];

    // ============================================
    // HANDLE JSON PASTE (application/json)
    // ============================================
    if (contentType?.includes("application/json")) {
      const body = await req.json();
      items = Array.isArray(body.data) ? body.data : body.data ? [body.data] : [];
      type = body.type;
      resetIds = body.resetIds === "true" || body.resetIds === true;
      enhanceContent_flag = body.enhanceContent === "true" || body.enhanceContent === true;
      
      console.log("📋 JSON Paste Upload:", { 
        type, 
        itemCount: items.length,
        resetIds,
        enhance: enhanceContent_flag 
      });
    }
    // ============================================
    // HANDLE FILE UPLOAD (multipart/form-data)
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
      enhanceContent_flag = formData.get("enhanceContent") === "true";
      
      console.log("📁 File Upload:", { type, fileName: file.name, resetIds });

      // Parse file based on type
      if (type === "mcq") {
        // Excel file for MCQ
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        items = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
      } else {
        // JSON file for revision/chapters
        try {
          const json = JSON.parse(Buffer.from(buffer).toString("utf-8"));
          items = Array.isArray(json) ? json : json ? [json] : [];
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

    if (!type) {
      return NextResponse.json({ error: "Upload type is required" }, { status: 400 });
    }

    // Load existing chapters
    const chapters = await prisma.chapter.findMany();
    const chapterMap = new Map<number, number>();
    chapters.forEach((ch) => chapterMap.set(ch.chapterNumber, ch.id));

    // =======================================
    // MCQ UPLOAD (Excel OR JSON)
    // =======================================
    if (type === "mcq") {
      if (resetIds) {
        await prisma.question.deleteMany({});
        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "Question_id_seq" RESTART WITH 1`
        );
      }

      let inserted = 0;
      let skipped = 0;
      let converted = 0;
      const skippedDetails: any[] = [];

      console.log("=== SMART MCQ UPLOAD ===");
      console.log("Total items:", items.length);
      console.log("Available chapters:", Array.from(chapterMap.keys()));

      for (const rawItem of items) {
        // 🔧 Smart Format Conversion
        const item = smartConvertMCQ(rawItem);
        
        if (item._wasConverted) {
          converted++;
          console.log(`✓ Converted MCQ: ${item.questionEn?.substring(0, 50)}...`);
        }

        const chapterNumberFromRow = item.chapterNumber
          ? Number(item.chapterNumber)
          : undefined;

        const chapterId =
          item.chapterId != null
            ? Number(item.chapterId)
            : chapterNumberFromRow != null
            ? chapterMap.get(chapterNumberFromRow)
            : undefined;

        if (!chapterId) {
          console.warn("❌ SKIPPED - Chapter not found:", item.questionEn?.substring(0, 50));
          skipped++;
          skippedDetails.push({
            question: item.questionEn?.substring(0, 50) + "...",
            chapterNumber: item.chapterNumber,
            reason: "Chapter not found in database"
          });
          continue;
        }

        // Validate required fields
        if (!item.questionEn || !item.optionAEn || !item.optionBEn || !item.correctAnswer) {
          console.warn("❌ SKIPPED - Missing required fields");
          skipped++;
          skippedDetails.push({
            question: item.questionEn || "Unknown",
            reason: "Missing required fields (questionEn, optionAEn, optionBEn, correctAnswer)"
          });
          continue;
        }

        const rawDifficulty = String(item.difficulty || "MODERATE").toUpperCase();
        const difficulty: "EASY" | "MODERATE" | "HARD" =
          rawDifficulty === "EASY" || rawDifficulty === "HARD"
            ? rawDifficulty
            : "MODERATE";

        // 🔍 DUPLICATE CHECK: Check if question already exists
        const existingQuestion = await prisma.question.findFirst({
          where: {
            chapterId,
            questionEn: String(item.questionEn || "")
          }
        });

        if (existingQuestion) {
          console.warn(`⚠️ DUPLICATE - Question already exists: ${item.questionEn?.substring(0, 50)}...`);
          skipped++;
          skippedDetails.push({
            question: item.questionEn?.substring(0, 50) + "...",
            reason: "Duplicate question (already exists in database)"
          });
          continue;
        }

        await prisma.question.create({
          data: {
            chapterId,
            questionEn: String(item.questionEn || ""),
            questionMr: item.questionMr ? String(item.questionMr) : null,
            
            // Convert all options to strings (handles numeric values like 8, 10, 12)
            optionAEn: String(item.optionAEn || item.optionA || ""),
            optionAMr: item.optionAMr ? String(item.optionAMr) : null,
            optionBEn: String(item.optionBEn || item.optionB || ""),
            optionBMr: item.optionBMr ? String(item.optionBMr) : null,
            optionCEn: String(item.optionCEn || item.optionC || ""),
            optionCMr: item.optionCMr ? String(item.optionCMr) : null,
            optionDEn: String(item.optionDEn || item.optionD || ""),
            optionDMr: item.optionDMr ? String(item.optionDMr) : null,
            
            correctAnswer: String(item.correctAnswer || "").toUpperCase(),
            difficulty,
          },
        });

        inserted++;
      }

      console.log("\n=== MCQ UPLOAD COMPLETE ===");
      console.log(`Inserted: ${inserted}`);
      console.log(`Converted: ${converted}`);
      console.log(`Skipped: ${skipped}`);

      return NextResponse.json({
        message: converted > 0 
          ? `✅ MCQ upload completed!\n\nInserted: ${inserted} questions\nAuto-converted: ${converted} questions\nSkipped: ${skipped} questions`
          : `✅ MCQ upload completed!\n\nInserted: ${inserted} questions\nSkipped: ${skipped} questions`,
        details: { 
          inserted, 
          converted,
          skipped, 
          availableChapters: Array.from(chapterMap.keys()),
          skippedItems: skippedDetails.length > 0 ? skippedDetails : undefined
        }
      });
    }

    // =======================================
    // REVISION UPLOAD WITH SMART CONVERSION
    // =======================================
    if (type === "revision") {
      if (!items.length) {
        return NextResponse.json(
          { error: "No items found in JSON file" },
          { status: 400 }
        );
      }

      if (resetIds) {
        await prisma.revisionContent.deleteMany({});
        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "RevisionContent_id_seq" RESTART WITH 1`
        );
      }

      let inserted = 0;
      let skipped = 0;
      let converted = 0;
      let enhanced = 0;
      const skippedDetails: any[] = [];
      const conversionLog: string[] = [];

      console.log("=== SMART REVISION UPLOAD ===");
      console.log("Total items:", items.length);
      console.log("Available chapters:", Array.from(chapterMap.keys()));

      for (const rawItem of items) {
        // 🔧 STEP 1: Smart Format Conversion
        const item = smartConvertRevision(rawItem);
        
        if (item._wasConverted) {
          converted++;
          conversionLog.push(`Converted: ${item.titleEn}`);
        }

        // Validate chapter exists
        if (!item.chapterNumber || isNaN(item.chapterNumber)) {
          console.warn("❌ SKIPPED - Invalid chapterNumber:", item.titleEn);
          skipped++;
          skippedDetails.push({
            title: item.titleEn,
            reason: "Invalid or missing chapterNumber"
          });
          continue;
        }

        const chapterId = chapterMap.get(item.chapterNumber);

        if (!chapterId) {
          console.warn(`❌ SKIPPED - Chapter ${item.chapterNumber} not found`);
          skipped++;
          skippedDetails.push({
            title: item.titleEn,
            chapterNumber: item.chapterNumber,
            reason: "Chapter not found in database"
          });
          continue;
        }

        // Validate required fields
        if (!item.titleEn || !item.titleMr) {
          console.warn("❌ SKIPPED - Missing titleEn or titleMr");
          skipped++;
          skippedDetails.push({
            title: item.titleEn || "Unknown",
            reason: "Missing required titleEn or titleMr"
          });
          continue;
        }

        // 🎨 STEP 2: Content Enhancement (if enabled)
        let finalContentEn = item.contentEn;
        let finalContentMr = item.contentMr;
        let finalQaJson = item.qaJson || [];

        if (enhanceContent_flag) {
          // Enhance English content with bullet points
          const enhancedEn = enhanceContent(item.contentEn);
          if (enhancedEn !== item.contentEn) {
            finalContentEn = enhancedEn;
            enhanced++;
          }

          // Generate additional Q&As
          const additionalQA = generateAdditionalQA(item.contentEn, finalQaJson);
          if (additionalQA.length > 0) {
            finalQaJson = [...finalQaJson, ...additionalQA];
            enhanced++;
            conversionLog.push(`Added ${additionalQA.length} auto-generated Q&As for: ${item.titleEn}`);
          }
        }

        // 🔍 DUPLICATE CHECK: Check if revision content already exists
        const existingRevision = await prisma.revisionContent.findFirst({
          where: {
            chapterId,
            titleEn: item.titleEn,
            order: item.order
          }
        });

        if (existingRevision) {
          console.warn(`⚠️ DUPLICATE - Revision already exists: ${item.titleEn}`);
          skipped++;
          skippedDetails.push({
            title: item.titleEn,
            reason: "Duplicate revision (same chapter, title, and order already exists)"
          });
          continue;
        }

        // 💾 STEP 3: Save to Database
        console.log(`✓ Creating revision: ${item.titleEn} (Chapter ${item.chapterNumber})`);

        await prisma.revisionContent.create({
          data: {
            chapterId,
            titleEn: item.titleEn,
            titleMr: item.titleMr,
            contentEn: finalContentEn,
            contentMr: finalContentMr,
            imageUrl: item.imageUrl,
            qaJson: finalQaJson,
            order: item.order,
          },
        });

        inserted++;
      }

      console.log("\n=== UPLOAD COMPLETE ===");
      console.log(`Inserted: ${inserted}`);
      console.log(`Converted: ${converted}`);
      console.log(`Enhanced: ${enhanced}`);
      console.log(`Skipped: ${skipped}`);

      return NextResponse.json({
        message: `✅ Revision upload completed!\n\nInserted: ${inserted} items\nAuto-converted: ${converted} items\nEnhanced: ${enhanced} items\nSkipped: ${skipped} items`,
        details: {
          inserted,
          converted,
          enhanced,
          skipped,
          availableChapters: Array.from(chapterMap.keys()),
          skippedItems: skippedDetails.length > 0 ? skippedDetails : undefined,
          conversionLog: conversionLog.length > 0 ? conversionLog : undefined
        }
      });
    }

    // =======================================
    // CHAPTER UPLOAD
    // =======================================
    if (type === "chapters") {
      if (!items.length) {
        return NextResponse.json(
          { error: "No items found in chapters JSON" },
          { status: 400 }
        );
      }

      if (resetIds) {
        await prisma.revisionContent.deleteMany({});
        await prisma.question.deleteMany({});
        await prisma.chapter.deleteMany({});

        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "Chapter_id_seq" RESTART WITH 1`
        );
        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "RevisionContent_id_seq" RESTART WITH 1`
        );
        await prisma.$executeRawUnsafe(
          `ALTER SEQUENCE "Question_id_seq" RESTART WITH 1`
        );
      }

      let insertedOrUpdated = 0;

      for (const item of items) {
        const chapterNumber = Number(item.chapterNumber ?? item.courseChapter);

        if (!chapterNumber || isNaN(chapterNumber)) {
          console.error("❌ Skipping chapter – invalid chapterNumber:", item);
          continue;
        }

        await prisma.chapter.upsert({
          where: { chapterNumber },
          create: {
            chapterNumber,
            titleEn: item.titleEn || item.courseTitleEn || "",
            titleMr: item.titleMr || item.courseTitleMr || null,
            actChapterNameEn: item.actChapterNameEn || item.actTitleEn || null,
            actChapterNameMr: item.actChapterNameMr || item.actTitleMr || null,
            sections: item.sections || null,
            descriptionEn: item.descriptionEn || null,
            descriptionMr: item.descriptionMr || null,
            mahareraEquivalentEn: item.mahareraEquivalentEn || null,
            mahareraEquivalentMr: item.mahareraEquivalentMr || null,
            orderIndex: item.orderIndex ?? null,
            isActive: item.isActive ?? true,
            displayInApp: item.displayInApp ?? true,
          },
          update: {
            titleEn: item.titleEn || item.courseTitleEn || "",
            titleMr: item.titleMr || item.courseTitleMr || null,
            actChapterNameEn: item.actChapterNameEn || item.actTitleEn || null,
            actChapterNameMr: item.actChapterNameMr || item.actTitleMr || null,
            sections: item.sections || null,
            descriptionEn: item.descriptionEn || null,
            descriptionMr: item.descriptionMr || null,
            mahareraEquivalentEn: item.mahareraEquivalentEn || null,
            mahareraEquivalentMr: item.mahareraEquivalentMr || null,
            orderIndex: item.orderIndex ?? null,
            isActive: item.isActive ?? true,
            displayInApp: item.displayInApp ?? true,
          },
        });

        insertedOrUpdated++;
      }

      return NextResponse.json({
        message: `Chapters upload complete. Inserted/Updated ${insertedOrUpdated} chapters.`,
        details: { insertedOrUpdated, resetPerformed: resetIds }
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