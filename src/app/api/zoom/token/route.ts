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
  // If Zoom is not configured (we use Jitsi), return a non-error response
  // so the build/static generation does not attempt an external request.
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    console.info("[zoom/token] Zoom credentials not configured; endpoint disabled.");
    return NextResponse.json({ success: false, error: "Zoom not configured" }, { status: 501 });
  }

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
