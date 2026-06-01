import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mapUserToAuthUser } from "@/lib/db-mappers";

// POST /api/auth/login
export async function POST(request: Request) {
  let body: { email: string; password: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    // Find user in DB
    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (dbUser.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "This account has been suspended or is inactive." },
        { status: 403 }
      );
    }

    // Verify password via bcrypt
    let passwordMatches = false;
    if (dbUser.password) {
      passwordMatches = await bcrypt.compare(password, dbUser.password);
      // Fallback for mock direct match (in case any legacy data remains)
      if (!passwordMatches && password === dbUser.password) {
        passwordMatches = true;
      }
    }

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.email, role: dbUser.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    const clientUser = mapUserToAuthUser(dbUser);

    // Update last active timestamp in background
    prisma.user.update({
      where: { id: dbUser.id },
      data: { lastActive: new Date() },
    }).catch(err => console.error("Failed to update lastActive", err));

    return NextResponse.json({
      success: true,
      data: { user: clientUser, token },
      message: `Logged in as ${clientUser.firstName} (${clientUser.role})`,
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
