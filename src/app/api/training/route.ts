import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError, PaginatedResponse, Training, CreateTrainingPayload } from "@/types";
import { MOCK_TRAININGS, addTraining } from "@/lib/data/training";
import { CURRENT_USER_ID, getUserById } from "@/lib/data/users";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

// GET /api/training
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  let filtered = [...MOCK_TRAININGS];

  if (search) {
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(search) ||
        t.instructorName.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  }
  if (category) filtered = filtered.filter((t) => t.category === category);
  if (status) filtered = filtered.filter((t) => t.status === status);

  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  const payload: PaginatedResponse<Training> = {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
  return ok(payload);
}

// POST /api/training
export async function POST(request: Request) {
  let body: CreateTrainingPayload;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  if (!body.title || !body.category) {
    return err("title and category are required");
  }

  const instructor = getUserById(CURRENT_USER_ID)!;
  const newTraining: Training = {
    id: `tr-${Date.now()}`,
    title: body.title,
    description: body.description ?? "",
    category: body.category,
    status: "Not Started",
    instructorId: CURRENT_USER_ID,
    instructorName: `${instructor.firstName} ${instructor.lastName}`,
    isInstructor: true,
    totalHours: body.totalHours ?? 1,
    moduleCount: body.moduleCount ?? 1,
    enrollmentCount: 0,
    progress: 0,
    completed: false,
    progressColor: "#8B1A1A",
    tags: body.tags ?? [],
    createdAt: new Date().toISOString(),
  };

  addTraining(newTraining);
  return ok(newTraining, "Training program created");
}
