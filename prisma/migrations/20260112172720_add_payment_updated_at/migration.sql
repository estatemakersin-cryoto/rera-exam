-- AlterTable
ALTER TABLE "PaymentProof" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "PaymentProof_status_idx" ON "PaymentProof"("status");
