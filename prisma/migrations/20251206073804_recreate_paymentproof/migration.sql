/*
  Warnings:

  - The primary key for the `PaymentProof` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `explanationEn` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `explanationMr` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `optionA` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `optionB` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `optionC` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `optionD` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `RevisionContent` table. All the data in the column will be lost.
  - You are about to drop the column `guestRollNo` on the `TestAttempt` table. All the data in the column will be lost.
  - Added the required column `optionAEn` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionBEn` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionCEn` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionDEn` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleEn` to the `RevisionContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleMr` to the `RevisionContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RevisionContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentProof" DROP CONSTRAINT "PaymentProof_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PaymentProof_id_seq";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "explanationEn",
DROP COLUMN "explanationMr",
DROP COLUMN "optionA",
DROP COLUMN "optionB",
DROP COLUMN "optionC",
DROP COLUMN "optionD",
ADD COLUMN     "optionAEn" TEXT NOT NULL,
ADD COLUMN     "optionAMr" TEXT,
ADD COLUMN     "optionBEn" TEXT NOT NULL,
ADD COLUMN     "optionBMr" TEXT,
ADD COLUMN     "optionCEn" TEXT NOT NULL,
ADD COLUMN     "optionCMr" TEXT,
ADD COLUMN     "optionDEn" TEXT NOT NULL,
ADD COLUMN     "optionDMr" TEXT;

-- AlterTable
ALTER TABLE "RevisionContent" DROP COLUMN "title",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "titleEn" TEXT NOT NULL,
ADD COLUMN     "titleMr" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "qaJson" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "TestAttempt" DROP COLUMN "guestRollNo";

-- CreateIndex
CREATE INDEX "RevisionContent_chapterId_idx" ON "RevisionContent"("chapterId");
