import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

// POST /api/auth/forgot-password
// Generate password reset token
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    // Find user from localStorage
    const users = JSON.parse(localStorage.getItem("xplore_users") || "[]");
    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      // For security, don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: "If an account exists, password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Store reset tokens in localStorage
    const resetTokens = JSON.parse(
      localStorage.getItem("xplore_reset_tokens") || "[]"
    );
    resetTokens.push({
      id: `rt-${Date.now()}`,
      userId: user.id,
      tokenHash: resetTokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    localStorage.setItem("xplore_reset_tokens", JSON.stringify(resetTokens));

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send email
    try {
      await sendEmail({
        to: user.email,
        templateType: "REGISTRATION_CONFIRMATION",
        templateData: [user.firstName, "Password Reset", resetToken],
      });
    } catch (emailError) {
      console.warn("Password reset email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
