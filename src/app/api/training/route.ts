import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapTrainingToClient } from "@/lib/db-mappers";
import { TrainingCategory as DbTrainingCategory } from "@prisma/client";
import type { PaginatedResponse, Training } from "@/types";

// GET /api/training — list with optional search, category, status filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() ?? "";
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId") || "u-001";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

    let dbCategory: DbTrainingCategory | undefined;
    if (category) {
      const norm = category.toUpperCase();
      if (
        norm === "MARKETING" ||
        norm === "MANAGEMENT" ||
        norm === "ANALYTICS" ||
        norm === "LEADERSHIP" ||
        norm === "TECHNOLOGY" ||
        norm === "FINANCE" ||
        norm === "HR" ||
        norm === "COMMUNICATION"
      ) {
        dbCategory = norm as DbTrainingCategory;
      }
    }

    // Query trainings with instructor and enrollments
    const dbTrainings = await prisma.training.findMany({
      where: dbCategory ? { category: dbCategory } : {},
      include: {
        instructor: true,
        enrollments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // In-memory filter for status and search terms
    let filtered = dbTrainings.map((t) => mapTrainingToClient(t, userId));

    if (status) {
      filtered = filtered.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.instructorName.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(total / pageSize);

    const payload: PaginatedResponse<Training> = {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error: any) {
    console.error("GET /api/training error:", error);
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}

// POST /api/training — create new training
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.category) {
      return NextResponse.json({ success: false, error: "title and category are required" }, { status: 400 });
    }

    const categoryUpper = body.category.toUpperCase();
    const dbCategory = (
      categoryUpper === "MARKETING" ||
      categoryUpper === "MANAGEMENT" ||
      categoryUpper === "ANALYTICS" ||
      categoryUpper === "LEADERSHIP" ||
      categoryUpper === "TECHNOLOGY" ||
      categoryUpper === "FINANCE" ||
      categoryUpper === "HR" ||
      categoryUpper === "COMMUNICATION"
    ) ? categoryUpper as DbTrainingCategory : DbTrainingCategory.TECHNOLOGY;

    const instructorId = "u-004"; // Default Anna Cruz / instructor

    const dbTraining = await prisma.training.create({
      data: {
        title: body.title,
        description: body.description ?? "",
        category: dbCategory,
        hours: body.hours ?? 4,
        modules: body.modules ?? 8,
        instructorId,
      },
      include: {
        instructor: true,
        enrollments: true,
      },
    });

    const clientTraining = mapTrainingToClient(dbTraining, instructorId);
    return NextResponse.json({ success: true, data: clientTraining, message: "Training program created" });
  } catch (error: any) {
    console.error("POST /api/training error:", error);
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}
