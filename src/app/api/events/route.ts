import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapEventToClient } from "@/lib/db-mappers";
import { EventStatus as DbEventStatus, EventType as DbEventType } from "@prisma/client";
import type { ApiSuccess, ApiError, PaginatedResponse, Event } from "@/types";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}

function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

// GET /api/events — list with optional search, status, type filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search   = searchParams.get("search")?.toLowerCase() ?? "";
    const status   = searchParams.get("status");
    const type     = searchParams.get("type");
    const joinCode = searchParams.get("joinCode");
    const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

    if (joinCode) {
      const event = await prisma.event.findUnique({
        where: { joinCode: joinCode.toUpperCase().trim() },
        include: { organizer: true },
      });
      if (!event) return err("Event not found", 404);
      return ok(mapEventToClient(event));
    }

    let dbStatus: DbEventStatus | undefined;
    if (status) {
      const norm = status.toUpperCase();
      if (norm === "UPCOMING" || norm === "ONGOING" || norm === "COMPLETED" || norm === "CANCELLED") {
        dbStatus = norm as DbEventStatus;
      }
    }

    let dbType: DbEventType | undefined;
    if (type) {
      const norm = type.toUpperCase();
      if (norm === "ONLINE" || norm === "ONSITE" || norm === "HYBRID") {
        dbType = norm as DbEventType;
      }
    }

    // Get all matching from DB first
    const dbEvents = await prisma.event.findMany({
      where: {
        AND: [
          dbStatus ? { status: dbStatus } : {},
          dbType ? { type: dbType } : {},
        ],
      },
      include: {
        organizer: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // In-memory filter for search terms (name, description, tags, organizer)
    let filtered = dbEvents;
    if (search) {
      filtered = dbEvents.filter((e) => {
        const nameMatch = e.name.toLowerCase().includes(search);
        const descMatch = e.description.toLowerCase().includes(search);
        const organizerMatch = e.organizer 
          ? `${e.organizer.firstName} ${e.organizer.lastName}`.toLowerCase().includes(search)
          : false;
        const tagsMatch = e.tags.some((t) => t.toLowerCase().includes(search));
        return nameMatch || descMatch || organizerMatch || tagsMatch;
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(total / pageSize);

    // Map to client schema
    const items = paginated.map((e) => mapEventToClient(e));

    const payload: PaginatedResponse<Event> = { items, total, page, pageSize, totalPages };
    return ok(payload);
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return err("Internal server error: " + error.message, 500);
  }
}

// POST /api/events — create new event
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.date || !body.type) {
      return err("name, date, and type are required");
    }

    // Normalize type and status
    const typeUpper = body.type.toUpperCase();
    const dbType = (typeUpper === "ONLINE" || typeUpper === "ONSITE" || typeUpper === "HYBRID") 
      ? typeUpper as DbEventType 
      : DbEventType.ONLINE;

    const joinCode = body.joinCode ?? `XPL-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;

    // Create the event in database
    const newDbEvent = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description ?? "",
        type: dbType,
        status: DbEventStatus.UPCOMING,
        date: new Date(body.date),
        endDate: body.endDate ? new Date(body.endDate) : new Date(body.date),
        location: body.location ?? "",
        organizerId: body.organizerId ?? "u-001", // fallback to Jose Dela Cruz
        maxParticipants: Math.min(100, body.maxParticipants ?? 50),
        tags: body.tags ?? [],
        isPaid: body.isPaid ?? false,
        ticketPrice: body.isPaid ? (body.ticketPrice ?? 0) : 0,
        joinCode,
      },
      include: {
        organizer: true,
      }
    });

    const clientEvent = mapEventToClient(newDbEvent, newDbEvent.organizerId);
    return ok(clientEvent, "Event created successfully");
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return err("Internal server error: " + error.message, 500);
  }
}

// DELETE /api/events — bulk delete (ids in body)
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.ids)) return err("ids must be an array");

    const deleteResult = await prisma.event.deleteMany({
      where: {
        id: { in: body.ids },
      },
    });

    return ok({ deleted: deleteResult.count });
  } catch (error: any) {
    console.error("DELETE /api/events error:", error);
    return err("Internal server error: " + error.message, 500);
  }
}
