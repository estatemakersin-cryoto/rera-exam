-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'APPROVED', 'REJECTED', 'ADMIT_CARD_ISSUED', 'APPEARED', 'PASSED', 'FAILED', 'CERTIFICATE_ISSUED');

-- CreateTable
CREATE TABLE "ExamApplication" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "candidateName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "alternateMobile" TEXT,
    "photoUrl" TEXT,
    "panNumber" TEXT,
    "nameOnPan" TEXT,
    "postApplied" TEXT NOT NULL DEFAULT 'REAL ESTATE AGENT EXAM',
    "trainingInstitute" TEXT,
    "trainingCertNo" TEXT,
    "isPwBD" BOOLEAN NOT NULL DEFAULT false,
    "pwbdType" TEXT,
    "pwbdPercentage" INTEGER,
    "corrAddressLine1" TEXT,
    "corrAddressLine2" TEXT,
    "corrCountry" TEXT NOT NULL DEFAULT 'India',
    "corrState" TEXT,
    "corrDistrict" TEXT,
    "corrPincode" TEXT,
    "sameAsCorrespondence" BOOLEAN NOT NULL DEFAULT false,
    "permAddressLine1" TEXT,
    "permAddressLine2" TEXT,
    "permCountry" TEXT,
    "permState" TEXT,
    "permDistrict" TEXT,
    "permPincode" TEXT,
    "centrePreference1" TEXT,
    "centrePreference2" TEXT,
    "centrePreference3" TEXT,
    "signatureUrl" TEXT,
    "panCardUrl" TEXT,
    "trainingCertUrl" TEXT,
    "pwbdCertUrl" TEXT,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationDate" TIMESTAMP(3),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "instituteId" TEXT,
    "batchId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "examSessionId" TEXT,
    "rollNumber" TEXT,
    "seatNumber" TEXT,
    "admitCardGenerated" BOOLEAN NOT NULL DEFAULT false,
    "admitCardUrl" TEXT,
    "testAttemptId" TEXT,
    "examAttended" BOOLEAN NOT NULL DEFAULT false,
    "examScore" INTEGER,
    "resultStatus" TEXT,
    "resultDeclaredAt" TIMESTAMP(3),
    "certificateId" TEXT,
    "certificateNumber" TEXT,
    "certificateUrl" TEXT,
    "certificateIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "ExamApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "stepNumber" INTEGER,
    "performedBy" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamCentre" (
    "id" TEXT NOT NULL,
    "centreName" TEXT NOT NULL,
    "centreCode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Maharashtra',
    "pincode" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 100,
    "allocatedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamCentre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamApplication_applicationNumber_key" ON "ExamApplication"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ExamApplication_testAttemptId_key" ON "ExamApplication"("testAttemptId");

-- CreateIndex
CREATE INDEX "ExamApplication_userId_idx" ON "ExamApplication"("userId");

-- CreateIndex
CREATE INDEX "ExamApplication_status_idx" ON "ExamApplication"("status");

-- CreateIndex
CREATE INDEX "ExamApplication_instituteId_idx" ON "ExamApplication"("instituteId");

-- CreateIndex
CREATE INDEX "ExamApplication_examSessionId_idx" ON "ExamApplication"("examSessionId");

-- CreateIndex
CREATE INDEX "ExamApplication_applicationNumber_idx" ON "ExamApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "ApplicationLog_applicationId_idx" ON "ApplicationLog"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamCentre_centreCode_key" ON "ExamCentre"("centreCode");

-- CreateIndex
CREATE INDEX "ExamCentre_district_idx" ON "ExamCentre"("district");

-- CreateIndex
CREATE INDEX "ExamCentre_city_idx" ON "ExamCentre"("city");

-- AddForeignKey
ALTER TABLE "ExamApplication" ADD CONSTRAINT "ExamApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamApplication" ADD CONSTRAINT "ExamApplication_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "Institute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamApplication" ADD CONSTRAINT "ExamApplication_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "ExamSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamApplication" ADD CONSTRAINT "ExamApplication_testAttemptId_fkey" FOREIGN KEY ("testAttemptId") REFERENCES "TestAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationLog" ADD CONSTRAINT "ApplicationLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ExamApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
