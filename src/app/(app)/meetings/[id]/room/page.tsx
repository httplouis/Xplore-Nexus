"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRole } from "@/lib/context/RoleContext";
import {
  Copy, Check, Users, Clock, ArrowLeft,
  Video, VideoOff, PhoneOff, Shield, Info, ExternalLink, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Meeting } from "@/types";

// ─── Extend window to include Jitsi API ──────────────────────────────────────
declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: Record<string, unknown>) => JitsiAPI;
  }
}

interface JitsiAPI {
  dispose: () => void;
  on: (event: string, handler: () => void) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  isAudioMuted: () => Promise<boolean>;
  isVideoMuted: () => Promise<boolean>;
}

// ─── Load Jitsi script once ──────────────────────────────────────────────────
function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) { resolve(); return; }
    const s = document.createElement("script");
    s.src  = "https://meet.jit.si/external_api.js";
    s.async = true;
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Jitsi API"));
    document.head.appendChild(s);
  });
}

// ─── Build Jitsi room name from meeting id ───────────────────────────────────
function buildRoom(id: string, title: string) {
  const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `xplore-nexus-${safe}-${id}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MeetingRoomPage({ params }: { params: { id: string } }) {
  const { user } = useRole();
  const router   = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef       = useRef<JitsiAPI | null>(null);

  const [meeting,  setMeeting]  = useState<Meeting | null>(null);
  const [status,   setStatus]   = useState<"loading" | "ready" | "joined" | "left">("loading");
  const [copied,   setCopied]   = useState(false);
  const [elapsed,  setElapsed]  = useState(0);

  // ── Look up meeting ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchMeetingDetails() {
      if (!params.id) return;
      try {
        const res = await fetch(`/api/meetings/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setMeeting(json.data);
        } else {
          setStatus("left");
        }
      } catch (error) {
        console.error("Failed to load meeting details:", error);
        setStatus("left");
      }
    }
    fetchMeetingDetails();
  }, [params.id]);

  // ── Elapsed timer (starts when joined) ────────────────────────────────────
  useEffect(() => {
    if (status !== "joined") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // ── Init Jitsi iFrame API ──────────────────────────────────────────────────
  useEffect(() => {
    if (!meeting || !user) return;
    if (status !== "loading") return;

    const roomName = buildRoom(meeting.id, meeting.title);
    const displayName = `${user.firstName} ${user.lastName}`;
    const isHost = meeting.hostId === user.id || user.role === "Admin" || user.role === "Organizer";

    let mounted = true;

    loadJitsiScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.JitsiMeetExternalAPI) return;

        const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName,
          width:  "100%",
          height: "100%",
          parentNode: containerRef.current,

          configOverwrite: {
            prejoinPageEnabled:        false,
            startWithAudioMuted:       true,
            startWithVideoMuted:       false,
            disableModeratorIndicator: false,
            enableLobbyChat:           true,
            // Lobby (waiting room) — only the host can admit guests
            lobby: { enabled: true },
            toolbarButtons: [
              "microphone", "camera", "desktop", "chat",
              "raisehand",  "tileview", "fullscreen", "hangup",
            ],
          },

          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK:    false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE:  true,
          },

          userInfo: {
            displayName,
            email: user.email,
            moderator: isHost,
          },
        });

        apiRef.current = api;
        setStatus("ready");

        api.on("videoConferenceJoined", () => setStatus("joined"));
        api.on("videoConferenceLeft",   () => setStatus("left"));
        api.on("readyToClose",          () => router.push("/meetings"));
      })
      .catch(() => {
        if (meeting) {
          const room = buildRoom(meeting.id, meeting.title);
          window.open(`https://meet.jit.si/${room}`, "_blank");
          router.push("/meetings");
        }
      });

    return () => {
      mounted = false;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting, user]);

  // ── Copy invite link (secure app URL — forces login) ──────────────────────
  const copyLink = useCallback(() => {
    if (!meeting) return;
    // Share the in-app URL so recipients must log in to Xplore Nexus first
    const url = `${window.location.origin}/meetings/${meeting.id}/room`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [meeting]);

  // ── Hangup ─────────────────────────────────────────────────────────────────
  function hangup() {
    if (apiRef.current) {
      apiRef.current.executeCommand("hangup");
    } else {
      router.push("/meetings");
    }
  }

  function fmtElapsed(s: number) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const p = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
  }

  const isHost = Boolean(
    meeting?.hostId === user?.id || user?.role === "Admin" || user?.role === "Organizer"
  );

  // Secure in-app URL (shared via copyLink) — only host gets the direct Jitsi fallback
  const secureInviteUrl = meeting
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/meetings/${meeting.id}/room`
    : "";
  // Direct Jitsi URL — exposed only to the host as a fallback tab
  const jitsiDirectUrl = meeting
    ? `https://meet.jit.si/${buildRoom(meeting.id, meeting.title)}`
    : "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in -m-6 flex flex-col bg-gray-950" style={{ height: "calc(100vh - 56px)" }}>

      {/* ── Top info bar ──────────────────────────────────────────────── */}
      <div className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/meetings"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-medium transition-colors mr-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Meetings
          </Link>
          <div className="w-px h-4 bg-gray-700" />
          <div>
            <p className="text-white font-display font-bold text-sm leading-tight">
              {meeting?.title ?? "Meeting Room"}
            </p>
            <p className="text-gray-400 text-[11px]">
              {isHost ? "You are the host" : `Hosted by ${meeting?.hostName ?? "—"}`}
            </p>
          </div>
          {/* Live pill */}
          {status === "joined" && (
            <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              LIVE · {fmtElapsed(elapsed)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Host badge */}
          {isHost && (
            <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-full">
              <Shield className="w-3 h-3" />
              Host / Moderator
            </div>
          )}

          {/* Participant count */}
          {meeting && (
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Users className="w-3.5 h-3.5" />
              {meeting.participantCount}
              {meeting.maxParticipants ? ` / ${meeting.maxParticipants}` : ""} participants
            </div>
          )}

          {/* Duration */}
          {meeting && (
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Clock className="w-3.5 h-3.5" />
              {meeting.duration} min
            </div>
          )}

          {/* Copy invite link */}
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Link Copied!" : "Copy Invite Link"}
          </button>

          {/* Open in new tab — only for host (hides raw Jitsi URL from guests) */}
          {isHost && (
            <a
              href={jitsiDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Tab
            </a>
          )}

          {/* Hang up */}
          <button
            onClick={hangup}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            Leave
          </button>
        </div>
      </div>

      {/* ── Host info notice ──────────────────────────────────────────── */}
      {isHost && status !== "joined" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-xs">
            <span className="font-bold">You are the host.</span>{" "}
            Joining as <span className="font-bold">{user?.firstName} {user?.lastName}</span>.
            {" "}You&apos;ll enter the room directly as moderator since you are the first to open this room.
            {" "}Share the invite link above for participants to join.
          </p>
        </div>
      )}

      {/* ── Participant notice ──────────────────────────────────────── */}
      {!isHost && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-xs">
            Joining as <span className="font-bold">{user?.firstName} {user?.lastName}</span>.
            {" "}The host will admit you once they start the session.
          </p>
        </div>
      )}

      {/* ── Loading overlay ───────────────────────────────────────────── */}
      {status === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          <p className="text-gray-400 text-sm">Loading meeting room…</p>
        </div>
      )}

      {/* ── Left Room ─────────────────────────────────────────────────── */}
      {status === "left" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center">
            <PhoneOff className="w-7 h-7 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">You left the meeting</p>
            <p className="text-gray-400 text-sm mt-1">{meeting?.title}</p>
          </div>
          <Link
            href="/meetings"
            className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Meetings
          </Link>
        </div>
      )}

      {/* ── Jitsi container ───────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden ${status === "loading" || status === "left" ? "hidden" : "block"}`}
      />
    </div>
  );
}
