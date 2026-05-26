import { NextResponse } from "next/server";

// POST /api/auth/register
// Register a new user - stores in localStorage
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
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    try {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("xplore_users") || "[]");
      const existingUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Create new user
      const newUser = {
        id: `u-${Date.now()}`,
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        department: department || "General",
        avatarInitials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
        role: "PARTICIPANT",
        status: "ACTIVE",
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("xplore_users", JSON.stringify(users));

      // Create welcome notification
      const notifications = JSON.parse(
        localStorage.getItem("xplore_notifications") || "[]"
      );
      notifications.push({
        id: `notif-${Date.now()}`,
        userId: newUser.id,
        title: "Welcome to Xplore Nexus!",
        message: "Your account has been successfully created. Start exploring!",
        category: "SYSTEM",
        priority: "high",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("xplore_notifications", JSON.stringify(notifications));

      const { password: _, ...userWithoutPassword } = newUser;

      return NextResponse.json({
        success: true,
        data: {
          user: userWithoutPassword,
          message: "Account created successfully",
        },
      });
    } catch (storageError) {
      console.error("localStorage error:", storageError);
      throw storageError;
    }
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
