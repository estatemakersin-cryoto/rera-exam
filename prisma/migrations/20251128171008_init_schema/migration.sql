/*
  Warnings:

  - The values [MEDIUM] on the enum `Difficulty` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `Chapter` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Chapter` table. All the data in the column will be lost.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `questionText` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Question` table. All the data in the column will be lost.
  - The `id` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `timeSpent` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `correctAnswers` on the `TestAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `TestAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `hasTopup` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `packageExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `packagePurchased` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referralCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `testsAvailable` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `testsCompleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `testsUnlocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CaseStudy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Faq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FaqBookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KeyPoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevisionProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevisionTopic` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[registrationNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionEn` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Made the column `chapterId` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `questionId` on the `Response` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNo` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Difficulty_new" AS ENUM ('EASY', 'MODERATE', 'HARD');
ALTER TABLE "Question" ALTER COLUMN "difficulty" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "difficulty" TYPE "Difficulty_new" USING ("difficulty"::text::"Difficulty_new");
ALTER TYPE "Difficulty" RENAME TO "Difficulty_old";
ALTER TYPE "Difficulty_new" RENAME TO "Difficulty";
DROP TYPE "Difficulty_old";
ALTER TABLE "Question" ALTER COLUMN "difficulty" SET DEFAULT 'MODERATE';
COMMIT;

-- DropForeignKey
ALTER TABLE "CaseStudy" DROP CONSTRAINT "CaseStudy_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "Faq" DROP CONSTRAINT "Faq_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "Faq" DROP CONSTRAINT "Faq_revisionTopicId_fkey";

-- DropForeignKey
ALTER TABLE "FaqBookmark" DROP CONSTRAINT "FaqBookmark_faqId_fkey";

-- DropForeignKey
ALTER TABLE "FaqBookmark" DROP CONSTRAINT "FaqBookmark_userId_fkey";

-- DropForeignKey
ALTER TABLE "KeyPoint" DROP CONSTRAINT "KeyPoint_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "KeyPoint" DROP CONSTRAINT "KeyPoint_revisionTopicId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_questionId_fkey";

-- DropForeignKey
ALTER TABLE "RevisionProgress" DROP CONSTRAINT "RevisionProgress_revisionTopicId_fkey";

-- DropForeignKey
ALTER TABLE "RevisionProgress" DROP CONSTRAINT "RevisionProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "RevisionTopic" DROP CONSTRAINT "RevisionTopic_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "TestAttempt" DROP CONSTRAINT "TestAttempt_userId_fkey";

-- DropIndex
DROP INDEX "Question_chapterId_idx";

-- DropIndex
DROP INDEX "Response_attemptId_idx";

-- DropIndex
DROP INDEX "Response_questionId_idx";

-- DropIndex
DROP INDEX "TestAttempt_userId_idx";

-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "Chapter" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "titleMr" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "category",
DROP COLUMN "createdAt",
DROP COLUMN "explanation",
DROP COLUMN "isActive",
DROP COLUMN "questionText",
DROP COLUMN "updatedAt",
ADD COLUMN     "explanationEn" TEXT,
ADD COLUMN     "explanationMr" TEXT,
ADD COLUMN     "questionEn" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "difficulty" SET DEFAULT 'MODERATE',
ALTER COLUMN "chapterId" SET NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "timeSpent",
DROP COLUMN "questionId",
ADD COLUMN     "questionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TestAttempt" DROP COLUMN "correctAnswers",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hasTopup",
DROP COLUMN "name",
DROP COLUMN "packageExpiry",
DROP COLUMN "packagePurchased",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "referralCount",
DROP COLUMN "role",
DROP COLUMN "testsAvailable",
DROP COLUMN "testsCompleted",
DROP COLUMN "testsUnlocked",
DROP COLUMN "updatedAt",
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "registrationNo" TEXT NOT NULL,
ADD COLUMN     "testsRemaining" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "CaseStudy";

-- DropTable
DROP TABLE "Faq";

-- DropTable
DROP TABLE "FaqBookmark";

-- DropTable
DROP TABLE "KeyPoint";

-- DropTable
DROP TABLE "RevisionProgress";

-- DropTable
DROP TABLE "RevisionTopic";

-- DropEnum
DROP TYPE "FaqDifficulty";

-- DropEnum
DROP TYPE "TestStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "RevisionContent" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "contentEn" TEXT,
    "contentMr" TEXT,
    "imageUrl" TEXT,
    "qaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_registrationNo_key" ON "User"("registrationNo");

-- AddForeignKey
ALTER TABLE "RevisionContent" ADD CONSTRAINT "RevisionContent_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
