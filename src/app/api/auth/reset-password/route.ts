import { NextResponse } from "next/server";
import crypto from "crypto";

// POST /api/auth/reset-password
// Reset password with token
export async function POST(request: Request) {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash the token to find it
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Get reset tokens from localStorage
    const resetTokens = JSON.parse(
      localStorage.getItem("xplore_reset_tokens") || "[]"
    );

    // Find and validate token
    const resetTokenIndex = resetTokens.findIndex(
      (rt: any) => rt.tokenHash === tokenHash && new Date(rt.expiresAt) > new Date()
    );

    if (resetTokenIndex === -1) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const resetToken = resetTokens[resetTokenIndex];

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("xplore_users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === resetToken.userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update password
    users[userIndex].password = password; // In production: hash with bcrypt
    localStorage.setItem("xplore_users", JSON.stringify(users));

    // Remove used token
    resetTokens.splice(resetTokenIndex, 1);
    localStorage.setItem("xplore_reset_tokens", JSON.stringify(resetTokens));

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
