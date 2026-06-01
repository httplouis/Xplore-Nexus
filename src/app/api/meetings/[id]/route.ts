import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError } from "@/types";
import { prisma } from "@/lib/prisma";
import { mapMeetingToClient } from "@/lib/db-mappers";
import { MeetingStatus as DbMeetingStatus } from "@prisma/client";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

type Params = { params: { id: string } };

// GET /api/meetings/[id]
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = params;
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { host: true },
    });
    if (!meeting) return err("Meeting not found", 404);
    return ok(mapMeetingToClient(meeting));
  } catch (error: any) {
    console.error("GET meeting error:", error);
    return err("Internal server error: " + error.message, 500);
  }
}

// PATCH /api/meetings/[id]
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.duration !== undefined) updateData.duration = parseInt(body.duration);
    if (body.maxParticipants !== undefined) updateData.maxParticipants = body.maxParticipants;
    if (body.meetingUrl !== undefined) updateData.meetingUrl = body.meetingUrl;

    if (body.status !== undefined) {
      const statusUpper = body.status.toUpperCase();
      if (statusUpper === "LIVE" || statusUpper === "UPCOMING" || statusUpper === "COMPLETED" || statusUpper === "CANCELLED") {
        updateData.status = statusUpper as DbMeetingStatus;
      }
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: updateData,
      include: { host: true },
    });

    return ok(mapMeetingToClient(updated), "Meeting updated");
  } catch (error: any) {
    console.error("PATCH meeting error:", error);
    if (error.code === 'P2025') {
      return err("Meeting not found", 404);
    }
    return err("Internal server error: " + error.message, 500);
  }
}

// DELETE /api/meetings/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = params;
    await prisma.meeting.delete({ where: { id } });
    return ok({ id }, "Meeting deleted");
  } catch (error: any) {
    console.error("DELETE meeting error:", error);
    if (error.code === 'P2025') {
      return err("Meeting not found", 404);
    }
    return err("Internal server error: " + error.message, 500);
  }
}
