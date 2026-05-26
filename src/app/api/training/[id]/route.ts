import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError, Training } from "@/types";
import { getTrainingById, updateTraining, deleteTraining } from "@/lib/data/training";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const training = getTrainingById(params.id);
  if (!training) return err("Training not found", 404);
  return ok(training);
}

export async function PATCH(request: Request, { params }: Params) {
  let body: Partial<Training>;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }
  const updated = updateTraining(params.id, body);
  if (!updated) return err("Training not found", 404);
  return ok(updated, "Training updated");
}

export async function DELETE(_req: Request, { params }: Params) {
  const deleted = deleteTraining(params.id);
  if (!deleted) return err("Training not found", 404);
  return ok({ id: params.id }, "Training deleted");
}
