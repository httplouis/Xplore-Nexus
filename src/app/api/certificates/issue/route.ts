import { NextResponse } from "next/server";
import { generateCertificate } from "@/lib/certificate";

function generateCertificateNumber(): string {
  const prefix = "CERT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// POST /api/certificates/issue
// Issue a certificate - stores in localStorage
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

    // Get user from localStorage
    const users = JSON.parse(localStorage.getItem("xplore_users") || "[]");
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const certificateNumber = generateCertificateNumber();
    const issuedDate = new Date();

    // Generate PDF (in browser/server)
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
      // Continue even if PDF fails
    }

    // Save certificate record
    const certificate = {
      id: `cert-${Date.now()}`,
      userId,
      trainingId: trainingId || undefined,
      eventId: eventId || undefined,
      title: certificateTitle,
      certificateNumber,
      issuedDate: issuedDate.toISOString(),
    };

    const certificates = JSON.parse(
      localStorage.getItem("xplore_certificates") || "[]"
    );
    certificates.push(certificate);
    localStorage.setItem("xplore_certificates", JSON.stringify(certificates));

    // Create notification
    const notifications = JSON.parse(
      localStorage.getItem("xplore_notifications") || "[]"
    );
    notifications.push({
      id: `notif-${Date.now()}`,
      userId,
      title: "Certificate Issued",
      message: `You've earned a certificate for ${certificateTitle}`,
      category: "SYSTEM",
      priority: "high",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("xplore_notifications", JSON.stringify(notifications));

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

    const certificates = JSON.parse(
      localStorage.getItem("xplore_certificates") || "[]"
    );
    const userCerts = certificates.filter((c: any) => c.userId === userId);

    return NextResponse.json({ success: true, data: userCerts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
