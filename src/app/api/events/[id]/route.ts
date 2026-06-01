import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError } from "@/types";
import { prisma } from "@/lib/prisma";
import { mapEventToClient } from "@/lib/db-mappers";
import { EventStatus as DbEventStatus, EventType as DbEventType } from "@prisma/client";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

type Params = { params: { id: string } };

// GET /api/events/[id]
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { organizer: true },
    });
    if (!event) return err("Event not found", 404);
    return ok(mapEventToClient(event));
  } catch (error: any) {
    console.error("GET event error:", error);
    return err("Internal server error: " + error.message, 500);
  }
}

// PATCH /api/events/[id]
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Build update payload
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.maxParticipants !== undefined) updateData.maxParticipants = Math.min(100, body.maxParticipants);
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.isPaid !== undefined) updateData.isPaid = body.isPaid;
    if (body.ticketPrice !== undefined) updateData.ticketPrice = body.isPaid ? body.ticketPrice : 0;
    
    if (body.type !== undefined) {
      const typeUpper = body.type.toUpperCase();
      if (typeUpper === "ONLINE" || typeUpper === "ONSITE" || typeUpper === "HYBRID") {
        updateData.type = typeUpper as DbEventType;
      }
    }
    
    if (body.status !== undefined) {
      const statusUpper = body.status.toUpperCase();
      if (statusUpper === "UPCOMING" || statusUpper === "ONGOING" || statusUpper === "COMPLETED" || statusUpper === "CANCELLED") {
        updateData.status = statusUpper as DbEventStatus;
      }
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { organizer: true },
    });

    return ok(mapEventToClient(updated), "Event updated");
  } catch (error: any) {
    console.error("PATCH event error:", error);
    if (error.code === 'P2025') {
      return err("Event not found", 404);
    }
    return err("Internal server error: " + error.message, 500);
  }
}

// DELETE /api/events/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = params;
    await prisma.event.delete({ where: { id } });
    return ok({ id }, "Event deleted");
  } catch (error: any) {
    console.error("DELETE event error:", error);
    if (error.code === 'P2025') {
      return err("Event not found", 404);
    }
    return err("Internal server error: " + error.message, 500);
  }
}
