/*
  Warnings:

  - You are about to drop the column `questions_per_test` on the `Chapter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chapter" DROP COLUMN "questions_per_test";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "testsUnlocked" SET DEFAULT 2;
