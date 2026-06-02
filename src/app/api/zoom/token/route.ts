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
  // Default to disabled unless the project explicitly opts-in.
  // This avoids build-time calls to Zoom when the project uses Jitsi.
  const useZoom = process.env.USE_ZOOM === "1";
  if (!useZoom) {
    console.info("[zoom/token] Zoom integration disabled (USE_ZOOM != 1).");
    return NextResponse.json({ success: false, error: "Zoom disabled" }, { status: 501 });
  }

  // If USE_ZOOM=1, require credentials to be present.
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
