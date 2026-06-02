import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapUserToAuthUser } from "@/lib/db-mappers";
import { UserRole, UserStatus } from "@prisma/client";
import type { PaginatedResponse, AuthUser } from "@/types";
import bcrypt from "bcryptjs";

function ok<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

// GET /api/users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() ?? "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

    let dbRole: UserRole | undefined;
    if (role) {
      const norm = role.toUpperCase();
      if (norm === "ADMIN" || norm === "ORGANIZER" || norm === "INSTRUCTOR" || norm === "PARTICIPANT") {
        dbRole = norm as UserRole;
      }
    }

    let dbStatus: UserStatus | undefined;
    if (status) {
      const norm = status.toUpperCase();
      if (norm === "ACTIVE" || norm === "INACTIVE" || norm === "SUSPENDED") {
        dbStatus = norm as UserStatus;
      }
    }

    const dbUsers = await prisma.user.findMany({
      where: {
        AND: [
          dbRole ? { role: dbRole } : {},
          dbStatus ? { status: dbStatus } : {},
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let filtered = dbUsers;
    if (search) {
      filtered = dbUsers.filter((u) => {
        const nameMatch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(search);
        const emailMatch = u.email.toLowerCase().includes(search);
        const deptMatch = u.department ? u.department.toLowerCase().includes(search) : false;
        return nameMatch || emailMatch || deptMatch;
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(total / pageSize);

    const items = paginated.map(mapUserToAuthUser);

    const payload: PaginatedResponse<AuthUser> = {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
    return ok(payload);
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return err("Internal server error: " + error.message, 500);
  }
}

// POST /api/users — invite/create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, department, role, password } = body;

    if (!email || !firstName || !lastName) {
      return err("email, firstName, and lastName are required", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return err("A user with this email already exists", 409);

    let dbRole: UserRole = "PARTICIPANT";
    if (role) {
      const r = String(role).toUpperCase();
      if (r === "ADMIN") dbRole = "ADMIN";
      else if (r === "ORGANIZER") dbRole = "ORGANIZER";
      else if (r === "INSTRUCTOR") dbRole = "INSTRUCTOR";
    }

    const tempPassword = password || "Welcome@123";
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const avatarInitials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        department: department || null,
        role: dbRole,
        status: "ACTIVE",
        avatarInitials,
        password: hashedPassword,
        lastActive: new Date(),
      },
    });

    return ok(mapUserToAuthUser(newUser), "User invited successfully");
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return err("Internal server error: " + error.message, 500);
  }
}
