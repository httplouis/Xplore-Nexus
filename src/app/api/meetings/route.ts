import { NextResponse } from "next/server";
import type { ApiSuccess, ApiError, PaginatedResponse, Meeting, CreateMeetingPayload } from "@/types";
import { MOCK_MEETINGS, addMeeting, deleteMeeting } from "@/lib/data/meetings";
import { CURRENT_USER_ID, getUserById } from "@/lib/data/users";
import { createZoomMeeting } from "@/lib/zoom";

function ok<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) });
}
function err(error: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status });
}

// GET /api/meetings
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  let filtered = [...MOCK_MEETINGS];

  if (search) {
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(search) ||
        m.hostName.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search)
    );
  }
  if (status) filtered = filtered.filter((m) => m.status === status);

  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  const payload: PaginatedResponse<Meeting> = {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
  return ok(payload);
}

// POST /api/meetings
export async function POST(request: Request) {
  let body: CreateMeetingPayload;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  if (!body.title || !body.date || !body.duration) {
    return err("title, date, and duration are required");
  }

  const owner = getUserById(CURRENT_USER_ID)!;

  // ── Try to create a real Zoom meeting ──────────────────────────────────────
  let meetingUrl = `https://meet.xplore.io/${body.title.toLowerCase().replace(/\s+/g, "-")}`;
  let zoomMeetingId: number | undefined;

  try {
    const zoom = await createZoomMeeting({
      topic:      body.title,
      start_time: new Date(body.date).toISOString(),
      duration:   body.duration,
      timezone:   "Asia/Manila",
      agenda:     body.description,
    });
    meetingUrl   = zoom.join_url;
    zoomMeetingId = zoom.id;
  } catch (zoomError) {
    // Gracefully fall back if Zoom isn't configured yet (dev/demo mode)
    console.warn(
      "[POST /api/meetings] Zoom meeting creation skipped:",
      zoomError instanceof Error ? zoomError.message : zoomError
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  const newMeeting: Meeting = {
    id:              `mt-${Date.now()}`,
    title:           body.title,
    description:     body.description ?? "",
    status:          "Upcoming",
    date:            body.date,
    duration:        body.duration,
    hostId:          CURRENT_USER_ID,
    hostName:        `${owner.firstName} ${owner.lastName}`,
    participantCount: 0,
    maxParticipants: body.maxParticipants,
    meetingUrl,
    zoomMeetingId,
    isHost:          true,
    createdAt:       new Date().toISOString(),
  };

  addMeeting(newMeeting);
  return ok(newMeeting, "Meeting scheduled");
}
