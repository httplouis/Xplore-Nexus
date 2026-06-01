import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// POST /api/auth/forgot-password
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Security: always return 200 regardless of whether email exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store hash + expiry directly on the user row
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        templateType: "REGISTRATION_CONFIRMATION",
        templateData: [user.firstName, "Password Reset", resetUrl],
      });
    } catch (emailError) {
      console.warn("Password reset email failed (non-fatal):", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
