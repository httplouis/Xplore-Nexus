/**
 * GET /api/zoom/token
 * ──────────────────────────────────────────────────────────────────────────────
 * Returns a valid Zoom access token for client-side SDKs (e.g. @zoom/videosdk).
 *
 * ⚠️  Only expose this endpoint to authenticated users.
 *     Add session/auth checks before the token is returned in production.
 */

import { NextResponse } from "next/server";
import { getZoomAccessToken } from "@/lib/zoom";

export async function GET() {
  try {
    const token = await getZoomAccessToken();
    return NextResponse.json({ success: true, token });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[zoom/token] Error fetching Zoom token:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
