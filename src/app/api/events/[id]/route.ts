import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError, Event } from "@/types";
import { getEventById, updateEvent, deleteEvent } from "@/lib/data/events";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

type Params = { params: { id: string } };

// GET /api/events/[id]
export async function GET(_req: Request, { params }: Params) {
  const event = getEventById(params.id);
  if (!event) return err("Event not found", 404);
  return ok(event);
}

// PATCH /api/events/[id]
export async function PATCH(request: Request, { params }: Params) {
  let body: Partial<Event>;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }
  const updated = updateEvent(params.id, body);
  if (!updated) return err("Event not found", 404);
  return ok(updated, "Event updated");
}

// DELETE /api/events/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const deleted = deleteEvent(params.id);
  if (!deleted) return err("Event not found", 404);
  return ok({ id: params.id }, "Event deleted");
}
