import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// POST /api/emails/send
// Send transactional emails
export async function POST(request: Request) {
  try {
    const { to, templateType, templateData } = await request.json();

    if (!to || !templateType || !templateData) {
      return NextResponse.json(
        { error: "Missing required fields: to, templateType, templateData" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      templateType,
      templateData,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
