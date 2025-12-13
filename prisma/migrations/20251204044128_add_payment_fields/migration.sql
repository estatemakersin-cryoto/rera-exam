/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `PaymentProof` table. All the data in the column will be lost.
  - You are about to drop the column `planLabel` on the `PaymentProof` table. All the data in the column will be lost.
  - You are about to drop the column `txnId` on the `PaymentProof` table. All the data in the column will be lost.
  - Added the required column `planType` to the `PaymentProof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `PaymentProof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentProof" DROP COLUMN "imageUrl",
DROP COLUMN "planLabel",
DROP COLUMN "txnId",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "planType" TEXT NOT NULL,
ADD COLUMN     "transactionId" TEXT NOT NULL;
