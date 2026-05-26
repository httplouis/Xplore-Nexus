"use client";

import { useState } from "react";
import {
  Video, Calendar, Clock, Users, Plus, X,
  VideoIcon, Shield, Mic,
  Radio, CheckCircle2, Timer, ChevronRight, Loader2,
} from "lucide-react";
import Link from "next/link";
import type { Meeting, CreateMeetingPayload, MeetingStatus } from "@/types";
import { showToast } from "@/components/ui/Toast";
import { useRole } from "@/lib/context/RoleContext";


// ─── Jitsi room name ──────────────────────────────────────────────────────────
function toJitsiRoom(meeting: Meeting): string {
  const safe = meeting.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `xplore-nexus-${safe}-${meeting.id}`;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "mt-001", title: "Leadership Training Workshop",
    description: "Live session covering advanced leadership frameworks and executive decision-making.",
    status: "Live", date: "2026-04-16T06:00:00.000Z", duration: 60,
    hostId: "u-002", hostName: "Maria Santos",
    participantCount: 28, maxParticipants: 50,
    meetingUrl: "https://meet.jit.si/xplore-nexus-leadership-training-workshop-mt-001",
    isHost: false, createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "mt-002", title: "Product Review Meeting",
    description: "Weekly product sync to review feature progress and align on sprint goals.",
    status: "Upcoming", date: "2026-04-17T02:00:00.000Z", duration: 45,
    hostId: "u-003", hostName: "John Reyes",
    participantCount: 12, maxParticipants: 20,
    meetingUrl: "https://meet.jit.si/xplore-nexus-product-review-meeting-mt-002",
    isHost: false, createdAt: "2026-04-10T00:00:00.000Z",
  },
  {
    id: "mt-003", title: "Weekly Team Sync",
    description: "Monday team sync — priorities, blockers, and weekend updates.",
    status: "Upcoming", date: "2026-04-18T07:00:00.000Z", duration: 30,
    hostId: "u-001", hostName: "Jose Dela Cruz",
    participantCount: 8, maxParticipants: 15,
    meetingUrl: "https://meet.jit.si/xplore-nexus-weekly-team-sync-mt-003",
    isHost: true, createdAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "mt-004", title: "Client Presentation",
    description: "Final presentation of Phase 1 deliverables to key stakeholders.",
    status: "Completed", date: "2026-03-29T03:00:00.000Z", duration: 120,
    hostId: "u-005", hostName: "Robert Tan",
    participantCount: 15, isHost: false,
    createdAt: "2026-03-20T00:00:00.000Z",
  },
  {
    id: "mt-005", title: "IT Infrastructure Review",
    description: "Quarterly review of server performance, cloud costs, and security posture.",
    status: "Upcoming", date: "2026-04-22T05:00:00.000Z", duration: 60,
    hostId: "u-001", hostName: "Jose Dela Cruz",
    participantCount: 5, maxParticipants: 10,
    meetingUrl: "https://meet.jit.si/xplore-nexus-it-infrastructure-review-mt-005",
    isHost: true, createdAt: "2026-04-13T00:00:00.000Z",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<MeetingStatus, {
  badge: string; dot: string; cardBorder: string; cardBg: string;
}> = {
  Live: {
    badge: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200",
    dot: "w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse",
    cardBorder: "border-red-200 shadow-red-100",
    cardBg: "bg-gradient-to-b from-red-50/60 to-white",
  },
  Upcoming: {
    badge: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200",
    dot: "w-1.5 h-1.5 rounded-full bg-emerald-500",
    cardBorder: "border-gray-100",
    cardBg: "bg-white",
  },
  Completed: {
    badge: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200",
    dot: "w-1.5 h-1.5 rounded-full bg-gray-400",
    cardBorder: "border-gray-100",
    cardBg: "bg-gray-50/50",
  },
  Cancelled: {
    badge: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200",
    dot: "w-1.5 h-1.5 rounded-full bg-gray-400",
    cardBorder: "border-gray-100",
    cardBg: "bg-gray-50/50",
  },
};


// ─── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({ m }: { m: Meeting }) {
  const { role } = useRole();
  const cfg    = STATUS_CONFIG[m.status];
  const isLive = m.status === "Live";
  const isDone = m.status === "Completed";
  // Host = they created it, or Admin/Organizer role
  const isHost = m.isHost || role === "Admin" || role === "Organizer";

  return (
    <div className={`relative flex flex-col rounded-2xl shadow-sm border transition-all duration-200
                     hover:shadow-md hover:-translate-y-0.5 overflow-hidden
                     ${cfg.cardBg} ${cfg.cardBorder}`}>

      {/* Live accent strip */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 via-red-500 to-orange-400" />
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={`font-display font-bold text-base leading-snug truncate
                            ${isDone ? "text-gray-400" : "text-gray-900"}`}>
              {m.title}
            </h3>
            {m.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {m.description}
              </p>
            )}
          </div>
          <span className={cfg.badge}>
            <span className={cfg.dot} />
            {m.status}
          </span>
        </div>

        {/* Host badge */}
        {isHost && (
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 badge-host">
              <Shield className="w-2.5 h-2.5" />
              Host
            </span>
          </div>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />, text: formatDate(m.date) },
            { icon: <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />, text: formatTime(m.date) },
            { icon: <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />, text: `${m.participantCount}${m.maxParticipants ? ` / ${m.maxParticipants}` : ""}` },
            { icon: <Timer className="w-3.5 h-3.5 text-gray-400 shrink-0" />, text: formatDuration(m.duration) },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
              {item.icon}
              <span className="truncate">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Host row */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8B1A1A] to-red-400
                          flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {m.hostName.charAt(0)}
          </div>
          <span className="text-xs text-gray-500">
            {isHost ? "You are hosting" : <><span className="text-gray-400">Host:</span> <span className="font-medium text-gray-600">{m.hostName}</span></>}
          </span>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-2 mt-auto">

          {/* LIVE meeting */}
          {isLive && (
            <>
              <Link
                href={`/meetings/${m.id}/room`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                           bg-[#8B1A1A] hover:bg-[#7B1414] active:scale-[0.98]
                           text-white text-sm font-bold transition-all shadow-sm shadow-[#8B1A1A]/20"
              >
                <Video className="w-4 h-4" />
                {isHost ? "Start Meeting" : "Join Now"}
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>
              <a
                href="/stream"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                           border border-red-200 bg-red-50 hover:bg-red-100
                           text-red-700 text-xs font-semibold transition-all"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Watch Live Stream
              </a>
            </>
          )}

          {/* UPCOMING meeting */}
          {m.status === "Upcoming" && (
            <Link
              href={`/meetings/${m.id}/room`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                         border border-[#8B1A1A]/30 bg-[#8B1A1A]/5 hover:bg-[#8B1A1A]/10
                         text-[#8B1A1A] text-sm font-bold transition-all active:scale-[0.98]"
            >
              <Video className="w-4 h-4" />
              {isHost ? "Start Meeting" : "Open Room"}
            </Link>
          )}

          {/* COMPLETED */}
          {isDone && (
            <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                            bg-gray-100 text-gray-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────
function ScheduleMeetingModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (m: Meeting) => void;
}) {
  // Pre-fill date: tomorrow 10 AM
  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();
  const [form, setForm] = useState<CreateMeetingPayload>({ title: "", description: "", date: defaultDate, duration: 30 });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof CreateMeetingPayload>(key: K, value: CreateMeetingPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setLoading(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        const newMeeting: Meeting = {
          ...json.data,
          meetingUrl: `https://meet.jit.si/${toJitsiRoom(json.data)}`,
        };
        onCreated(newMeeting);
        showToast("Meeting scheduled! Jitsi room is ready.", "success");
        onClose();
      } else {
        showToast(json.error ?? "Failed to schedule meeting", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center">
              <Video className="w-4 h-4 text-[#8B1A1A]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-gray-900 text-base">Schedule Meeting</h2>
              <p className="text-xs text-gray-400 mt-0.5">A Jitsi room is created automatically</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meeting Title *</label>
            <input required type="text" value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Weekly Team Sync"
              className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={2} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Agenda or meeting objectives…"
              className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date & Time *</label>
              <input required type="datetime-local" value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Duration</label>
              <select value={form.duration} onChange={(e) => set("duration", Number(e.target.value))} className="input-field">
                {[15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Participants</label>
            <input type="number" min={2} max={1000}
              value={form.maxParticipants ?? ""}
              onChange={(e) => set("maxParticipants", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Leave blank for unlimited"
              className="input-field" />
          </div>

          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <VideoIcon className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-800">Powered by Jitsi Meet</p>
              <p className="text-xs text-blue-600 mt-0.5">No downloads needed · Opens in browser with webcam &amp; mic.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60
                         text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#8B1A1A]/25">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              {loading ? "Scheduling…" : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MeetingsPage() {
  const [meetings, setMeetings]         = useState<Meeting[]>(INITIAL_MEETINGS);
  const [showSchedule, setShowSchedule] = useState(false);
  const [filter, setFilter]             = useState<"All" | MeetingStatus>("All");

  const handleCreated = (m: Meeting) => setMeetings((prev) => [m, ...prev]);

  const liveCount      = meetings.filter((m) => m.status === "Live").length;
  const upcomingCount  = meetings.filter((m) => m.status === "Upcoming").length;
  const completedCount = meetings.filter((m) => m.status === "Completed").length;
  const filtered       = filter === "All" ? meetings : meetings.filter((m) => m.status === filter);
  const FILTERS: Array<"All" | MeetingStatus> = ["All", "Live", "Upcoming", "Completed"];


  return (
    <>
      {/* Schedule modal */}
      {showSchedule && (
        <ScheduleMeetingModal onClose={() => setShowSchedule(false)} onCreated={handleCreated} />
      )}

      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Meetings</h1>
            <p className="page-subtitle flex items-center gap-1.5">
              Virtual sessions powered by
              <span className="inline-flex items-center gap-1 font-semibold text-[#8B1A1A]">
                <VideoIcon className="w-3.5 h-3.5" />
                Jitsi Meet
              </span>
              · No downloads required
            </p>
          </div>
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] active:scale-95
                       text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all
                       shadow-md shadow-[#8B1A1A]/25 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Live Now",  count: liveCount,      color: "text-red-600",     bg: "bg-red-50 border-red-100",        dot: "bg-red-500 animate-pulse" },
            { label: "Upcoming",  count: upcomingCount,  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
            { label: "Completed", count: completedCount, color: "text-gray-600",    bg: "bg-gray-50 border-gray-200",       dot: "bg-gray-400" },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${s.bg}`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
              <div>
                <p className={`text-xl font-bold leading-none ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Webcam notice */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50
                        border border-blue-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1 text-blue-500 shrink-0">
            <Mic className="w-4 h-4" />
            <VideoIcon className="w-4 h-4" />
          </div>
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Webcam &amp; microphone enabled.</span>{" "}
            Browser will ask for permission on first join. Rooms open in a new tab — no plugins needed.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                          ${filter === f ? "bg-[#8B1A1A] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {f}
              {f === "Live" && liveCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4
                                 rounded-full bg-white/30 text-[10px] font-bold">{liveCount}</span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} meeting{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Cards / empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold">No {filter.toLowerCase()} meetings</p>
            <p className="text-gray-400 text-sm mt-1">Schedule a meeting to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((m) => (
              <MeetingCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
