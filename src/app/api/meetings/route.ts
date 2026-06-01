import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapMeetingToClient } from "@/lib/db-mappers";
import { MeetingStatus as DbMeetingStatus } from "@prisma/client";
import type { PaginatedResponse, Meeting } from "@/types";
import { createZoomMeeting } from "@/lib/zoom";

// GET /api/meetings — list with optional search, status filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() ?? "";
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

    let dbStatus: DbMeetingStatus | undefined;
    if (status) {
      const norm = status.toUpperCase();
      if (norm === "LIVE" || norm === "UPCOMING" || norm === "COMPLETED" || norm === "CANCELLED") {
        dbStatus = norm as DbMeetingStatus;
      }
    }

    const dbMeetings = await prisma.meeting.findMany({
      where: {
        AND: [
          dbStatus ? { status: dbStatus } : {},
        ],
      },
      include: {
        host: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    let filtered = dbMeetings;
    if (search) {
      filtered = dbMeetings.filter((m) => {
        const titleMatch = m.title.toLowerCase().includes(search);
        const descMatch = m.description.toLowerCase().includes(search);
        const hostMatch = m.host 
          ? `${m.host.firstName} ${m.host.lastName}`.toLowerCase().includes(search)
          : false;
        return titleMatch || descMatch || hostMatch;
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(total / pageSize);

    // Map to client schema
    const items = paginated.map((m) => mapMeetingToClient(m));

    const payload: PaginatedResponse<Meeting> = { items, total, page, pageSize, totalPages };
    return NextResponse.json({ success: true, data: payload });
  } catch (error: any) {
    console.error("GET /api/meetings error:", error);
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}

// POST /api/meetings
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.date || !body.duration) {
      return NextResponse.json({ success: false, error: "title, date, and duration are required" }, { status: 400 });
    }

    const hostId = "u-001"; // Default / Jose Dela Cruz

    // Try Zoom creation
    let meetingUrl = `https://meet.jit.si/xplore-${body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    let zoomMeetingId: string | undefined;
    let provider = "jitsi";

    try {
      const zoom = await createZoomMeeting({
        topic:      body.title,
        start_time: new Date(body.date).toISOString(),
        duration:   body.duration,
        timezone:   "Asia/Manila",
        agenda:     body.description,
      });
      meetingUrl    = zoom.join_url;
      zoomMeetingId = String(zoom.id);
      provider      = "zoom";
    } catch (zoomError) {
      console.warn("[POST /api/meetings] Zoom meeting creation skipped:", zoomError);
    }

    const dbMeeting = await prisma.meeting.create({
      data: {
        title: body.title,
        description: body.description ?? "",
        status: DbMeetingStatus.UPCOMING,
        date: new Date(body.date),
        duration: parseInt(body.duration),
        hostId,
        maxParticipants: body.maxParticipants ?? 100,
        meetingUrl,
        meetingProvider: provider,
        zoomMeetingId,
      },
      include: {
        host: true,
      },
    });

    const clientMeeting = mapMeetingToClient(dbMeeting, hostId);
    return NextResponse.json({ success: true, data: clientMeeting, message: "Meeting scheduled" });
  } catch (error: any) {
    console.error("POST /api/meetings error:", error);
    return NextResponse.json({ success: false, error: "Internal server error: " + error.message }, { status: 500 });
  }
}
