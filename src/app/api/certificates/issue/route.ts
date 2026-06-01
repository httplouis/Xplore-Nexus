import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationCategory } from "@prisma/client";
import { generateCertificate } from "@/lib/certificate";

function generateCertificateNumber(): string {
  const prefix = "CERT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// POST /api/certificates/issue
export async function POST(request: Request) {
  try {
    const {
      userId,
      trainingId,
      eventId,
      certificateTitle,
      instructorName,
      organizationName = "Xplore Nexus",
    } = await request.json();

    if (!userId || (!trainingId && !eventId) || !certificateTitle) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId, trainingId or eventId, certificateTitle",
        },
        { status: 400 }
      );
    }

    // Get user from DB
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const certificateNumber = generateCertificateNumber();
    const issuedDate = new Date();

    // Generate PDF
    let pdfBase64 = "";
    try {
      const pdfBuffer = await generateCertificate({
        recipientName: `${user.firstName} ${user.lastName}`,
        certificateNumber,
        certificationTitle: certificateTitle,
        issuedDate,
        instructorName,
        organizationName,
      });
      pdfBase64 = pdfBuffer.toString("base64");
    } catch (pdfError) {
      console.warn("PDF generation warning:", pdfError);
    }

    // Save certificate record in DB
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        trainingId: trainingId || null,
        eventId: eventId || null,
        title: certificateTitle,
        certificateNumber,
        issuedDate,
      },
    });

    // Create notification in DB
    await prisma.notification.create({
      data: {
        userId,
        title: "Certificate Issued",
        message: `You've earned a certificate for ${certificateTitle}`,
        category: NotificationCategory.SYSTEM,
        priority: "high",
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        certificateId: certificate.id,
        certificateNumber: certificate.certificateNumber,
        pdfBase64: pdfBase64 || null,
      },
    });
  } catch (error: any) {
    console.error("Certificate generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

// GET /api/certificates?userId=XXX
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter required" },
        { status: 400 }
      );
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedDate: "desc" },
    });

    return NextResponse.json({ success: true, data: certificates });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
