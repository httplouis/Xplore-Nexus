import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Demo account fallback
const DEMO_ACCOUNTS = [
  {
    id: "u-001",
    firstName: "Jose",
    lastName: "Dela Cruz",
    email: "jose.dc@xplore.io",
    password: "hashed_password_123",
    role: "ADMIN",
    status: "ACTIVE",
    department: "Information Technology",
    avatarInitials: "JDC",
    bio: "Platform administrator for Xplore Nexus.",
    phone: "+63 912 345 6789",
  },
  {
    id: "u-002",
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@xplore.io",
    password: "hashed_password_123",
    role: "ORGANIZER",
    department: "Events & Communications",
    avatarInitials: "MS",
  },
  {
    id: "u-004",
    firstName: "Anna",
    lastName: "Cruz",
    email: "anna.cruz@xplore.io",
    password: "hashed_password_123",
    role: "INSTRUCTOR",
    department: "Learning & Development",
    avatarInitials: "AC",
  },
  {
    id: "u-007",
    firstName: "Carlos",
    lastName: "Bautista",
    email: "carlos.bautista@xplore.io",
    password: "hashed_password_123",
    role: "PARTICIPANT",
    department: "Finance",
    avatarInitials: "CB",
  },
];

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

  // Try localStorage first
  try {
    const users = JSON.parse(localStorage.getItem("xplore_users") || "[]");
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (user && user.status === "ACTIVE") {
      if (password === user.password || password.length >= 4) {
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || "dev-secret",
          { expiresIn: "7d" }
        );

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
          success: true,
          data: { user: userWithoutPassword, token },
          message: `Logged in as ${user.firstName} (${user.role})`,
        });
      }
    }
  } catch (storageError) {
    console.log("localStorage not available, using demo fallback");
  }

  // Fallback to demo accounts
  const demoUser = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );

  if (!demoUser) {
    return NextResponse.json(
      { success: false, error: "No account found with that email. Use one of the demo accounts." },
      { status: 401 }
    );
  }

  if (!password || password.length < 4) {
    return NextResponse.json(
      { success: false, error: "Password too short." },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    { id: demoUser.id, email: demoUser.email, role: demoUser.role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );

  return NextResponse.json({
    success: true,
    data: { user: demoUser, token },
    message: `Logged in as ${demoUser.firstName} (${demoUser.role})`,
  });
}
