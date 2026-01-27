// ═══════════════════════════════════════════════════════════════════════════════
// FILE: app/api/exam/apply/submit/route.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════════════
// POST: Submit application (change status from DRAFT to SUBMITTED)
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 });
    }

    // Fetch application
    const application = await prisma.examApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (application.status !== "DRAFT") {
      return NextResponse.json({ error: "Application already submitted" }, { status: 400 });
    }

    // Validate required fields before submission
    const validationErrors = validateApplication(application);
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: "Validation failed", 
        validationErrors 
      }, { status: 400 });
    }

    // Update status to SUBMITTED
    const updatedApplication = await prisma.examApplication.update({
      where: { id: applicationId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        currentStep: 6,
      }
    });

    // Create log entry
    await prisma.applicationLog.create({
      data: {
        applicationId: application.id,
        action: "submitted",
        description: `Application ${application.applicationNumber} submitted successfully`,
        previousStatus: "DRAFT",
        newStatus: "SUBMITTED",
        performedBy: session.userId,
      }
    });

    // In practice mode, automatically approve and generate admit card
    await autoApproveForPractice(applicationId, application.applicationNumber);

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      message: "Application submitted successfully!"
    });
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATE APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

function validateApplication(app: any): string[] {
  const errors: string[] = [];

  // Step 1: Personal Details
  if (!app.candidateName) errors.push("Candidate name is required");
  if (!app.dateOfBirth) errors.push("Date of birth is required");
  if (!app.gender) errors.push("Gender is required");
  if (!app.fatherName) errors.push("Father's name is required");
  if (!app.motherName) errors.push("Mother's name is required");
  if (!app.email) errors.push("Email is required");
  if (!app.mobile) errors.push("Mobile number is required");

  // Step 2: Identity Details
  if (!app.panNumber) errors.push("PAN number is required");
  if (!app.nameOnPan) errors.push("Name on PAN is required");
  if (!app.trainingInstitute) errors.push("Training institute is required");
  if (!app.trainingCertNo) errors.push("Training certificate number is required");

  // Step 3: Address Details
  if (!app.corrAddressLine1) errors.push("Correspondence address is required");
  if (!app.corrDistrict) errors.push("District is required");
  if (!app.corrPincode) errors.push("Pincode is required");

  // Step 4: Centre Preference
  if (!app.centrePreference1) errors.push("Centre preference is required");

  // Step 6: Declaration
  if (!app.declarationAccepted) errors.push("Declaration must be accepted");

  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-APPROVE FOR PRACTICE MODE
// In real system, this would be done by admin
// ═══════════════════════════════════════════════════════════════════════════════

async function autoApproveForPractice(applicationId: string, applicationNumber: string) {
  try {
    // Generate roll number
    const year = new Date().getFullYear();
    const count = await prisma.examApplication.count({
      where: {
        rollNumber: { not: null }
      }
    });
    const rollNumber = `MR${year}${String(count + 1).padStart(6, "0")}`;

    // Generate exam date (7 days from now for practice)
    const examDate = new Date();
    examDate.setDate(examDate.getDate() + 7);
    examDate.setHours(10, 0, 0, 0); // 10:00 AM

    // Update application with approval details
    await prisma.examApplication.update({
      where: { id: applicationId },
      data: {
        status: "ADMIT_CARD_ISSUED",
        rollNumber,
        seatNumber: `S${String(Math.floor(Math.random() * 100) + 1).padStart(3, "0")}`,
        admitCardGenerated: true,
        reviewedAt: new Date(),
        reviewedBy: "SYSTEM_AUTO_APPROVE",
      }
    });

    // Log the approval
    await prisma.applicationLog.create({
      data: {
        applicationId,
        action: "auto_approved",
        description: `Practice mode: Auto-approved with roll number ${rollNumber}`,
        previousStatus: "SUBMITTED",
        newStatus: "ADMIT_CARD_ISSUED",
        performedBy: "SYSTEM",
      }
    });

    console.log(`Practice mode: Application ${applicationNumber} auto-approved with roll number ${rollNumber}`);
  } catch (error) {
    console.error("Auto-approve error:", error);
    // Don't throw - this is not critical for practice mode
  }
}