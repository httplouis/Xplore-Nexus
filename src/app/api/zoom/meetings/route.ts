/**
 * POST /api/zoom/meetings
 * ──────────────────────────────────────────────────────────────────────────────
 * Creates a scheduled Zoom meeting via the Zoom REST API and returns the full
 * meeting object including join_url and start_url.
 *
 * Request body:
 *   {
 *     topic:      string        // Meeting title (required)
 *     start_time: string        // ISO-8601 datetime (required)
 *     duration:   number        // Minutes (required)
 *     timezone?:  string        // Default: "Asia/Manila"
 *     agenda?:    string
 *     settings?:  ZoomMeetingSettings
 *   }
 *
 * GET /api/zoom/meetings/[id]   → retrieve a single meeting (call getZoomMeeting)
 * DELETE /api/zoom/meetings/[id] → cancel a meeting (call deleteZoomMeeting)
 */

import { NextResponse } from "next/server";
import { createZoomMeeting } from "@/lib/zoom";
import type { CreateZoomMeetingOptions } from "@/lib/zoom";

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  let body: Partial<CreateZoomMeetingOptions>;

  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  if (!body.topic)       return err("'topic' is required");
  if (!body.start_time)  return err("'start_time' is required (ISO-8601)");
  if (!body.duration)    return err("'duration' is required (minutes)");

  try {
    const meeting = await createZoomMeeting({
      topic:      body.topic,
      start_time: body.start_time,
      duration:   body.duration,
      timezone:   body.timezone,
      agenda:     body.agenda,
      settings:   body.settings,
    });

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[zoom/meetings POST] Error:", message);

    // Distinguish between credential errors and Zoom API errors
    if (message.includes("Missing Zoom credentials")) {
      return err("Zoom integration not configured. Check server environment variables.", 503);
    }
    return err(`Zoom API error: ${message}`, 502);
  }
}
