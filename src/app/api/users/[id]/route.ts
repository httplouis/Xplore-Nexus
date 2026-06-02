import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapUserToAuthUser } from "@/lib/db-mappers";
import { UserRole, UserStatus } from "@prisma/client";

type Params = { params: { id: string } };

function ok<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

// GET /api/users/[id]
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return err("User not found", 404);
    return ok(mapUserToAuthUser(user));
  } catch (error: any) {
    return err("Internal server error: " + error.message, 500);
  }
}

// PATCH /api/users/[id]
export async function PATCH(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const updateData: any = {};

    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.bio !== undefined) updateData.bio = body.bio;

    if (body.role !== undefined) {
      const roleUpper = String(body.role).toUpperCase();
      if (["ADMIN", "ORGANIZER", "INSTRUCTOR", "PARTICIPANT"].includes(roleUpper)) {
        updateData.role = roleUpper as UserRole;
      }
    }

    if (body.status !== undefined) {
      const statusUpper = String(body.status).toUpperCase();
      if (statusUpper === "ACTIVE") updateData.status = "ACTIVE" as UserStatus;
      else if (statusUpper === "INACTIVE") updateData.status = "INACTIVE" as UserStatus;
      else if (statusUpper === "SUSPENDED") updateData.status = "SUSPENDED" as UserStatus;
    }

    // Recalculate avatarInitials if name changed
    if (body.firstName || body.lastName) {
      const existing = await prisma.user.findUnique({ where: { id: params.id } });
      if (existing) {
        const fn = body.firstName ?? existing.firstName;
        const ln = body.lastName ?? existing.lastName;
        updateData.avatarInitials = `${fn[0] ?? ""}${ln[0] ?? ""}`.toUpperCase();
      }
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    return ok(mapUserToAuthUser(updated), "User updated");
  } catch (error: any) {
    console.error("PATCH /api/users/[id] error:", error);
    if (error.code === "P2025") return err("User not found", 404);
    return err("Internal server error: " + error.message, 500);
  }
}

// DELETE /api/users/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return ok({ id: params.id }, "User deleted");
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    if (error.code === "P2025") return err("User not found", 404);
    return err("Internal server error: " + error.message, 500);
  }
}
