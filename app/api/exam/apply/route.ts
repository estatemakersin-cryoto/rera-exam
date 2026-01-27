// ═══════════════════════════════════════════════════════════════════════════════
// FILE: app/api/exam/apply/route.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════════════
// GET: Fetch user's current/draft application
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
    }

    // Find existing draft or recent application
    const application = await prisma.examApplication.findFirst({
      where: {
        userId: session.userId,
        status: { in: ["DRAFT", "SUBMITTED"] }
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!application) {
      return NextResponse.json({ application: null });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST: Create new application
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "Please login to continue" }, { status: 401 });
    }

    const body = await req.json();
    
    // Check if user already has a draft application
    const existingDraft = await prisma.examApplication.findFirst({
      where: {
        userId: session.userId,
        status: "DRAFT"
      }
    });

    if (existingDraft) {
      // Update existing draft instead of creating new
      return updateApplication(existingDraft.id, body, session.userId);
    }

    // Generate application number
    const year = new Date().getFullYear();
    const count = await prisma.examApplication.count({
      where: {
        applicationNumber: { startsWith: `EM${year}` }
      }
    });
    const applicationNumber = `EM${year}${String(count + 1).padStart(6, "0")}`;

    // Create new application
    const application = await prisma.examApplication.create({
      data: {
        userId: session.userId,
        applicationNumber,
        currentStep: body.currentStep || 1,
        status: "DRAFT",
        
        // Step 1: Personal Details
        candidateName: body.candidateName?.toUpperCase() || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || null,
        fatherName: body.fatherName || null,
        motherName: body.motherName || null,
        email: body.email || null,
        mobile: body.mobile || null,
        alternateMobile: body.alternateMobile || null,
        photoUrl: body.photoUrl || null,
        selfieUrl: body.selfieUrl || null,

        // Step 2: Identity Details
        panNumber: body.panNumber?.toUpperCase() || null,
        nameOnPan: body.nameOnPan || null,
        postApplied: body.postApplied || "REAL ESTATE AGENT EXAM",
        trainingInstitute: body.trainingInstitute || null,
        trainingCertNo: body.trainingCertNo || null,
        isPwBD: body.isPwBD || false,
        pwbdType: body.pwbdType || null,
        pwbdPercentage: body.pwbdPercentage ? parseInt(body.pwbdPercentage) : null,
        
        // Step 3: Address Details
        corrAddressLine1: body.corrAddressLine1 || null,
        corrAddressLine2: body.corrAddressLine2 || null,
        corrCountry: body.corrCountry || "India",
        corrState: body.corrState || "Maharashtra",
        corrDistrict: body.corrDistrict || null,
        corrPincode: body.corrPincode || null,
        sameAsCorrespondence: body.sameAsCorrespondence || false,
        permAddressLine1: body.permAddressLine1 || null,
        permAddressLine2: body.permAddressLine2 || null,
        permCountry: body.permCountry || "India",
        permState: body.permState || "Maharashtra",
        permDistrict: body.permDistrict || null,
        permPincode: body.permPincode || null,
        
        // Step 4: Exam Centre
        centrePreference1: body.centrePreference1 || null,
        centrePreference2: body.centrePreference2 || null,
        centrePreference3: body.centrePreference3 || null,
        
        // Step 5: Documents
        signatureUrl: body.signatureUrl || null,
        panCardUrl: body.panCardUrl || null,
        trainingCertUrl: body.trainingCertUrl || null,
        pwbdCertUrl: body.pwbdCertUrl || null,
        
        // Step 6: Declaration
        declarationAccepted: body.declarationAccepted || false,
        declarationDate: body.declarationAccepted ? new Date() : null,
      }
    });

    // Create log entry
    await prisma.applicationLog.create({
      data: {
        applicationId: application.id,
        action: "created",
        description: `Application ${applicationNumber} created`,
        newStatus: "DRAFT",
        stepNumber: 1,
        performedBy: session.userId,
      }
    });

    return NextResponse.json({
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      message: "Application created successfully"
    });
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUT: Update existing application
// ═══════════════════════════════════════════════════════════════════════════════

export async function PUT(req: NextRequest) {
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

    return updateApplication(applicationId, body, session.userId);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: Update application
// ═══════════════════════════════════════════════════════════════════════════════

async function updateApplication(applicationId: string, body: any, userId: string) {
  // Verify ownership
  const existing = await prisma.examApplication.findUnique({
    where: { id: applicationId }
  });

  if (!existing) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (existing.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (existing.status !== "DRAFT") {
    return NextResponse.json({ error: "Cannot modify submitted application" }, { status: 400 });
  }

  const previousStep = existing.currentStep;

  // Update application
  const application = await prisma.examApplication.update({
    where: { id: applicationId },
    data: {
      currentStep: Math.max(body.currentStep || 1, existing.currentStep),
      
      // Step 1: Personal Details
      candidateName: body.candidateName?.toUpperCase() ?? existing.candidateName,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : existing.dateOfBirth,
      gender: body.gender ?? existing.gender,
      fatherName: body.fatherName ?? existing.fatherName,
      motherName: body.motherName ?? existing.motherName,
      email: body.email ?? existing.email,
      mobile: body.mobile ?? existing.mobile,
      alternateMobile: body.alternateMobile ?? existing.alternateMobile,
      photoUrl: body.photoUrl ?? existing.photoUrl,
      selfieUrl: body.selfieUrl ?? existing.selfieUrl,
      
      // Step 2: Identity Details
      panNumber: body.panNumber?.toUpperCase() ?? existing.panNumber,
      nameOnPan: body.nameOnPan ?? existing.nameOnPan,
      postApplied: body.postApplied ?? existing.postApplied,
      trainingInstitute: body.trainingInstitute ?? existing.trainingInstitute,
      trainingCertNo: body.trainingCertNo ?? existing.trainingCertNo,
      isPwBD: body.isPwBD ?? existing.isPwBD,
      pwbdType: body.pwbdType ?? existing.pwbdType,
      pwbdPercentage: body.pwbdPercentage ? parseInt(body.pwbdPercentage) : existing.pwbdPercentage,
      
      // Step 3: Address Details
      corrAddressLine1: body.corrAddressLine1 ?? existing.corrAddressLine1,
      corrAddressLine2: body.corrAddressLine2 ?? existing.corrAddressLine2,
      corrCountry: body.corrCountry ?? existing.corrCountry,
      corrState: body.corrState ?? existing.corrState,
      corrDistrict: body.corrDistrict ?? existing.corrDistrict,
      corrPincode: body.corrPincode ?? existing.corrPincode,
      sameAsCorrespondence: body.sameAsCorrespondence ?? existing.sameAsCorrespondence,
      permAddressLine1: body.permAddressLine1 ?? existing.permAddressLine1,
      permAddressLine2: body.permAddressLine2 ?? existing.permAddressLine2,
      permCountry: body.permCountry ?? existing.permCountry,
      permState: body.permState ?? existing.permState,
      permDistrict: body.permDistrict ?? existing.permDistrict,
      permPincode: body.permPincode ?? existing.permPincode,
      
      // Step 4: Exam Centre
      centrePreference1: body.centrePreference1 ?? existing.centrePreference1,
      centrePreference2: body.centrePreference2 ?? existing.centrePreference2,
      centrePreference3: body.centrePreference3 ?? existing.centrePreference3,
      
      // Step 5: Documents
      signatureUrl: body.signatureUrl ?? existing.signatureUrl,
      panCardUrl: body.panCardUrl ?? existing.panCardUrl,
      trainingCertUrl: body.trainingCertUrl ?? existing.trainingCertUrl,
      pwbdCertUrl: body.pwbdCertUrl ?? existing.pwbdCertUrl,
      
      // Step 6: Declaration
      declarationAccepted: body.declarationAccepted ?? existing.declarationAccepted,
      declarationDate: body.declarationAccepted && !existing.declarationDate ? new Date() : existing.declarationDate,
    }
  });

  // Log step progress
  if (body.currentStep && body.currentStep !== previousStep) {
    await prisma.applicationLog.create({
      data: {
        applicationId: application.id,
        action: "step_completed",
        description: `Completed step ${previousStep}, moved to step ${body.currentStep}`,
        stepNumber: body.currentStep,
        performedBy: userId,
      }
    });
  }

  return NextResponse.json({
    applicationId: application.id,
    applicationNumber: application.applicationNumber,
    message: "Application saved successfully"
  });
}