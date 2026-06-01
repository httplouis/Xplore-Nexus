import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mapUserToAuthUser } from "@/lib/db-mappers";
import { UserRole, UserStatus, NotificationCategory } from "@prisma/client";

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      department,
    } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists in DB
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

    // Create new user in DB
    const dbUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        department: department || "General",
        avatarInitials: initials,
        role: UserRole.PARTICIPANT,
        status: UserStatus.ACTIVE,
      },
    });

    // Create welcome notification in DB
    await prisma.notification.create({
      data: {
        userId: dbUser.id,
        title: "Welcome to Xplore Nexus!",
        message: "Your account has been successfully created. Start exploring!",
        category: NotificationCategory.SYSTEM,
        priority: "high",
        isRead: false,
      },
    });

    const clientUser = mapUserToAuthUser(dbUser);

    return NextResponse.json({
      success: true,
      data: {
        user: clientUser,
        message: "Account created successfully",
      },
    });
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
