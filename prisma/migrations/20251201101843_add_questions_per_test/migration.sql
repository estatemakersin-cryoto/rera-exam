/*
  Warnings:

  - You are about to drop the column `description` on the `Chapter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chapter" DROP COLUMN "description",
ADD COLUMN     "actChapterNameEn" TEXT,
ADD COLUMN     "actChapterNameMr" TEXT,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionMr" TEXT,
ADD COLUMN     "displayInApp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mahareraEquivalentEn" TEXT,
ADD COLUMN     "mahareraEquivalentMr" TEXT,
ADD COLUMN     "orderIndex" INTEGER,
ADD COLUMN     "questions_per_test" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sections" TEXT;
