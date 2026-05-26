import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError, PaginatedResponse, Event, CreateEventPayload, EventStatus } from "@/types";
import { MOCK_EVENTS, addEvent } from "@/lib/data/events";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}

function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

// GET /api/events — list with optional search, status, type filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search   = searchParams.get("search")?.toLowerCase() ?? "";
  const status   = searchParams.get("status") as EventStatus | null;
  const type     = searchParams.get("type");
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  let filtered = [...MOCK_EVENTS];

  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(search) ||
        e.organizerName.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.tags.some((t) => t.toLowerCase().includes(search))
    );
  }
  if (status) filtered = filtered.filter((e) => e.status === status);
  if (type)   filtered = filtered.filter((e) => e.type   === type);

  const total      = filtered.length;
  const items      = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(total / pageSize);

  const payload: PaginatedResponse<Event> = { items, total, page, pageSize, totalPages };
  return ok(payload);
}

// POST /api/events — create new event
export async function POST(request: Request) {
  let body: CreateEventPayload & { organizerId?: string; organizerName?: string; joinCode?: string };
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  if (!body.name || !body.date || !body.type) {
    return err("name, date, and type are required");
  }

  const newEvent: Event = {
    id: `ev-${Date.now()}`,
    name:             body.name,
    description:      body.description ?? "",
    type:             body.type,
    status:           "Upcoming",
    date:             body.date,
    endDate:          body.endDate ?? body.date,
    location:         body.location ?? "",
    organizerId:      body.organizerId ?? "u-unknown",
    organizerName:    body.organizerName ?? "Unknown",
    participantCount: 0,
    maxParticipants:  Math.min(100, body.maxParticipants ?? 50),
    isOwner:          true,
    tags:             body.tags ?? [],
    createdAt:        new Date().toISOString(),
    // Ticket fields
    isPaid:            body.isPaid ?? false,
    ticketPrice:       body.isPaid ? (body.ticketPrice ?? 0) : 0,
    joinCode:          body.joinCode ?? `XPL-${Date.now().toString(36).toUpperCase().slice(-4)}-${new Date().getFullYear()}`,
    registrationCount: 0,
  };

  addEvent(newEvent);
  return ok(newEvent, "Event created successfully");
}

// DELETE /api/events — bulk delete (ids in body)
export async function DELETE(request: Request) {
  let body: { ids: string[] };
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }
  if (!Array.isArray(body.ids)) return err("ids must be an array");
  return ok({ deleted: body.ids.length });
}
