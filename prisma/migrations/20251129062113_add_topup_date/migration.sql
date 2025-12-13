/*
  Warnings:

  - A unique constraint covering the columns `[mobile]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "RevisionContent" DROP CONSTRAINT "RevisionContent_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "TestAttempt" DROP CONSTRAINT "TestAttempt_userId_fkey";

-- AlterTable
ALTER TABLE "TestAttempt" ADD COLUMN     "correctAnswers" INTEGER,
ADD COLUMN     "status" "TestStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasTopup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "packageExpiry" TIMESTAMP(3),
ADD COLUMN     "packagePurchased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "packagePurchasedDate" TIMESTAMP(3),
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referralCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referredBy" TEXT,
ADD COLUMN     "testsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "testsUnlocked" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "topupDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- AddForeignKey
ALTER TABLE "RevisionContent" ADD CONSTRAINT "RevisionContent_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
