import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError, Meeting } from "@/types";
import { getMeetingById, updateMeeting, deleteMeeting } from "@/lib/data/meetings";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const meeting = getMeetingById(params.id);
  if (!meeting) return err("Meeting not found", 404);
  return ok(meeting);
}

export async function PATCH(request: Request, { params }: Params) {
  let body: Partial<Meeting>;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }
  const updated = updateMeeting(params.id, body);
  if (!updated) return err("Meeting not found", 404);
  return ok(updated, "Meeting updated");
}

export async function DELETE(_req: Request, { params }: Params) {
  const deleted = deleteMeeting(params.id);
  if (!deleted) return err("Meeting not found", 404);
  return ok({ id: params.id }, "Meeting deleted");
}
