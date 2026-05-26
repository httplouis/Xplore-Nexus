/**
 * lib/zoom.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Zoom Server-to-Server OAuth helper.
 *
 * Prerequisites (marketplace.zoom.us):
 *  1. Create a "Server-to-Server OAuth" app.
 *  2. Grant scope: meeting:write:admin  (plus meeting:read:admin if you need GET)
 *  3. Copy Account ID, Client ID, Client Secret into .env.local:
 *       ZOOM_ACCOUNT_ID=…
 *       ZOOM_CLIENT_ID=…
 *       ZOOM_CLIENT_SECRET=…
 */

const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE  = "https://api.zoom.us/v2";

// ─── Token cache (in-memory, server-side only) ────────────────────────────────
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

/**
 * Returns a valid Zoom access token, refreshing it automatically when expired.
 * Tokens are cached for the duration of their lifetime (typically 1 hour).
 */
export async function getZoomAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 60 s safety buffer)
  if (_cachedToken && now < _tokenExpiresAt - 60_000) {
    return _cachedToken;
  }

  const accountId     = process.env.ZOOM_ACCOUNT_ID;
  const clientId      = process.env.ZOOM_CLIENT_ID;
  const clientSecret  = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error(
      "Missing Zoom credentials. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, " +
      "and ZOOM_CLIENT_SECRET in .env.local."
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(
    `${ZOOM_TOKEN_URL}?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Zoom token request failed (${res.status}): ${body}`);
  }

  const json = await res.json() as { access_token: string; expires_in: number };
  _cachedToken    = json.access_token;
  _tokenExpiresAt = now + json.expires_in * 1_000;

  return _cachedToken;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ZoomMeetingSettings {
  host_video?: boolean;
  participant_video?: boolean;
  join_before_host?: boolean;
  mute_upon_entry?: boolean;
  waiting_room?: boolean;
  meeting_authentication?: boolean;
  auto_recording?: "none" | "local" | "cloud";
}

export interface CreateZoomMeetingOptions {
  /** Meeting topic / title */
  topic: string;
  /** ISO-8601 start time (e.g. "2026-04-20T09:00:00Z") */
  start_time: string;
  /** Duration in minutes */
  duration: number;
  /** Timezone string (default: Asia/Manila) */
  timezone?: string;
  /** Optional agenda */
  agenda?: string;
  settings?: ZoomMeetingSettings;
}

export interface ZoomMeeting {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  agenda: string;
  join_url: string;
  start_url: string;
  password: string;
  settings: ZoomMeetingSettings;
}

// ─── API Wrappers ─────────────────────────────────────────────────────────────

/**
 * Creates a Zoom meeting for the authenticated host (uses "me" as userId).
 * Requires scope: meeting:write:admin
 */
export async function createZoomMeeting(
  options: CreateZoomMeetingOptions
): Promise<ZoomMeeting> {
  const token = await getZoomAccessToken();

  const body = {
    topic:      options.topic,
    type:       2, // Scheduled meeting
    start_time: options.start_time,
    duration:   options.duration,
    timezone:   options.timezone ?? "Asia/Manila",
    agenda:     options.agenda ?? "",
    settings: {
      host_video:       true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry:  true,
      waiting_room:     true,
      auto_recording:   "none",
      ...options.settings,
    },
  };

  const res = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`createZoomMeeting failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<ZoomMeeting>;
}

/**
 * Retrieves details for an existing Zoom meeting by its numeric ID.
 * Requires scope: meeting:read:admin
 */
export async function getZoomMeeting(meetingId: number | string): Promise<ZoomMeeting> {
  const token = await getZoomAccessToken();

  const res = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`getZoomMeeting failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<ZoomMeeting>;
}

/**
 * Deletes a Zoom meeting by its numeric ID.
 * Requires scope: meeting:write:admin
 */
export async function deleteZoomMeeting(meetingId: number | string): Promise<void> {
  const token = await getZoomAccessToken();

  const res = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`deleteZoomMeeting failed (${res.status}): ${err}`);
  }
}
