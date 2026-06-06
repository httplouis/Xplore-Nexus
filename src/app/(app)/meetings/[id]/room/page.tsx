"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/lib/context/RoleContext";
import { useMeeting } from "@/lib/context/MeetingContext";
import {
  Copy, Check, Users, Clock, ArrowLeft,
  PhoneOff, Shield, Info, ExternalLink, Loader2,
  Minimize2, Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Meeting } from "@/types";

// ─── Build Jitsi room name from meeting id ───────────────────────────────────
function buildRoom(id: string, title: string) {
  const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `xplore-nexus-${safe}-${id}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MeetingRoomPage({ params }: { params: { id: string } }) {
  const { user } = useRole();
  const router = useRouter();
  const { activeMeeting, startMeeting, endMeeting, isMinimized, toggleMinimize } = useMeeting();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // ── Load meeting data ──────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchMeeting() {
      try {
        const res = await fetch(`/api/meetings/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setMeeting(json.data);
          setLoading(false);
        } else {
          router.push("/meetings");
        }
      } catch (error) {
        console.error("Failed to load meeting:", error);
        router.push("/meetings");
      }
    }
    fetchMeeting();
  }, [params.id, router]);

  // ── Start meeting when data loaded ────────────────────────────────────────
  useEffect(() => {
    if (!meeting || !user) {
      console.log("Not starting meeting - missing data:", { meeting: !!meeting, user: !!user });
      return;
    }
    
    if (activeMeeting?.id === meeting.id) {
      console.log("Meeting already active:", meeting.id);
      // If meeting is already active and we're on this page, go back to meetings list
      router.push("/meetings");
      return;
    }
    
    console.log("Starting meeting:", meeting.title, "for user:", user.firstName);
    const displayName = `${user.firstName} ${user.lastName}`;
    startMeeting(meeting, displayName);
    
    // After starting meeting, navigate back to meetings list so user can navigate freely
    setTimeout(() => {
      router.push("/meetings");
    }, 1000);
  }, [meeting, user, activeMeeting, startMeeting, router]);

  const copyLink = () => {
    if (!meeting) return;
    const url = `${window.location.origin}/meetings/${meeting.id}/room`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    endMeeting();
    router.push("/meetings");
  };

  const isHost = Boolean(
    meeting?.hostId === user?.id || user?.role === "Admin" || user?.role === "Organizer"
  );

  const jitsiDirectUrl = meeting
    ? `https://meet.jit.si/${buildRoom(meeting.id, meeting.title)}`
    : "";

  if (loading || !meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Meeting Info */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
                {meeting.title}
              </h1>
              <p className="text-gray-600 text-sm">
                {isHost ? "You are hosting this meeting" : `Hosted by ${meeting.hostName}`}
              </p>
            </div>
            
            {isHost && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" />
                Host
              </div>
            )}
          </div>

          {/* Meeting Details */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Participants</p>
                <p className="text-sm font-semibold text-gray-900">
                  {meeting.participantCount} / {meeting.maxParticipants}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-semibold text-gray-900">{meeting.duration} min</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-semibold text-green-600">Active</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                copied
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link Copied!" : "Copy Invite Link"}
            </button>

            <button
              onClick={toggleMinimize}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              {isMinimized ? "Expand Meeting" : "Minimize Meeting"}
            </button>

            {isHost && (
              <a
                href={jitsiDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </a>
            )}

            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all ml-auto"
            >
              <PhoneOff className="w-4 h-4" />
              Leave Meeting
            </button>
          </div>

          {/* Info Message */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-semibold mb-1">
                  Meeting is active
                </p>
                <p className="text-xs text-blue-700">
                  The video call is running in the {isMinimized ? "bottom-right corner" : "main view"}. 
                  You can navigate to other pages and the meeting will stay connected. 
                  Click &quot;Leave Meeting&quot; to end the call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
