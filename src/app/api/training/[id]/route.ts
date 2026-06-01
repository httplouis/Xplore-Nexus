import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapTrainingToClient } from "@/lib/db-mappers";
import { TrainingCategory as DbTrainingCategory } from "@prisma/client";

type Params = { params: { id: string } };

// GET /api/training/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "u-001";

    const dbTraining = await prisma.training.findUnique({
      where: { id },
      include: {
        instructor: true,
        enrollments: true,
      },
    });

    if (!dbTraining) {
      return NextResponse.json({ success: false, error: "Training not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: mapTrainingToClient(dbTraining, userId) });
  } catch (error: any) {
    console.error("GET training single error:", error);
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}

// PATCH /api/training/[id]
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "u-001";

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.hours !== undefined) updateData.hours = Number(body.hours);
    if (body.modules !== undefined) updateData.modules = Number(body.modules);

    if (body.category !== undefined) {
      const categoryUpper = body.category.toUpperCase();
      if (
        categoryUpper === "MARKETING" ||
        categoryUpper === "MANAGEMENT" ||
        categoryUpper === "ANALYTICS" ||
        categoryUpper === "LEADERSHIP" ||
        categoryUpper === "TECHNOLOGY" ||
        categoryUpper === "FINANCE" ||
        categoryUpper === "HR" ||
        categoryUpper === "COMMUNICATION"
      ) {
        updateData.category = categoryUpper as DbTrainingCategory;
      }
    }

    const updated = await prisma.training.update({
      where: { id },
      data: updateData,
      include: {
        instructor: true,
        enrollments: true,
      },
    });

    return NextResponse.json({ success: true, data: mapTrainingToClient(updated, userId), message: "Training updated" });
  } catch (error: any) {
    console.error("PATCH training single error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Training not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}

// DELETE /api/training/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    await prisma.training.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { id }, message: "Training deleted" });
  } catch (error: any) {
    console.error("DELETE training single error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Training not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}
