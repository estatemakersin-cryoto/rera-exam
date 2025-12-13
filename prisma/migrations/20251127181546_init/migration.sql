-- CreateEnum
CREATE TYPE "FaqDifficulty" AS ENUM ('EASY', 'MODERATE', 'HARD');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "chapterId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasTopup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "packageExpiry" TIMESTAMP(3),
ADD COLUMN     "packagePurchased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "testsAvailable" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "testsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "testsUnlocked" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Chapter" (
    "id" SERIAL NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMr" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionTopic" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "topicNumber" INTEGER NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMr" TEXT NOT NULL,
    "sectionNumbers" TEXT,
    "contentEn" TEXT,
    "contentMr" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "revisionTopicId" INTEGER,
    "questionEn" TEXT NOT NULL,
    "questionMr" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "answerMr" TEXT NOT NULL,
    "difficulty" "FaqDifficulty" NOT NULL DEFAULT 'MODERATE',
    "sectionReference" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyPoint" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "revisionTopicId" INTEGER,
    "pointEn" TEXT NOT NULL,
    "pointMr" TEXT NOT NULL,
    "pointType" TEXT NOT NULL DEFAULT 'important',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMr" TEXT NOT NULL,
    "scenarioEn" TEXT NOT NULL,
    "scenarioMr" TEXT NOT NULL,
    "solutionEn" TEXT NOT NULL,
    "solutionMr" TEXT NOT NULL,
    "sectionReference" TEXT,
    "learningPointsEn" TEXT[],
    "learningPointsMr" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionProgress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "revisionTopicId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "RevisionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqBookmark" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "faqId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_chapterNumber_key" ON "Chapter"("chapterNumber");

-- CreateIndex
CREATE INDEX "RevisionTopic_chapterId_idx" ON "RevisionTopic"("chapterId");

-- CreateIndex
CREATE INDEX "Faq_chapterId_idx" ON "Faq"("chapterId");

-- CreateIndex
CREATE INDEX "Faq_revisionTopicId_idx" ON "Faq"("revisionTopicId");

-- CreateIndex
CREATE INDEX "KeyPoint_chapterId_idx" ON "KeyPoint"("chapterId");

-- CreateIndex
CREATE INDEX "KeyPoint_revisionTopicId_idx" ON "KeyPoint"("revisionTopicId");

-- CreateIndex
CREATE INDEX "CaseStudy_chapterId_idx" ON "CaseStudy"("chapterId");

-- CreateIndex
CREATE INDEX "RevisionProgress_userId_idx" ON "RevisionProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionProgress_userId_revisionTopicId_key" ON "RevisionProgress"("userId", "revisionTopicId");

-- CreateIndex
CREATE INDEX "FaqBookmark_userId_idx" ON "FaqBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FaqBookmark_userId_faqId_key" ON "FaqBookmark"("userId", "faqId");

-- CreateIndex
CREATE INDEX "Question_chapterId_idx" ON "Question"("chapterId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionTopic" ADD CONSTRAINT "RevisionTopic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_revisionTopicId_fkey" FOREIGN KEY ("revisionTopicId") REFERENCES "RevisionTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyPoint" ADD CONSTRAINT "KeyPoint_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyPoint" ADD CONSTRAINT "KeyPoint_revisionTopicId_fkey" FOREIGN KEY ("revisionTopicId") REFERENCES "RevisionTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStudy" ADD CONSTRAINT "CaseStudy_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionProgress" ADD CONSTRAINT "RevisionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionProgress" ADD CONSTRAINT "RevisionProgress_revisionTopicId_fkey" FOREIGN KEY ("revisionTopicId") REFERENCES "RevisionTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqBookmark" ADD CONSTRAINT "FaqBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqBookmark" ADD CONSTRAINT "FaqBookmark_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "Faq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
