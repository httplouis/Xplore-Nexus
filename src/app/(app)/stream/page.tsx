"use client";

import { useState, useRef, useEffect } from "react";
import {
  Users, MessageSquare, Hand, Share2,
  Maximize2, Send, Clock, Wifi, Mic, MicOff,
  Video, VideoOff, ScreenShare, Settings,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/lib/context/RoleContext";

// ─── Mock initial chat ────────────────────────────────────────────────────────
const INITIAL_CHAT = [
  { id: 1, user: "Maria S.",  avatar: "MS",  color: "from-pink-500 to-rose-700",       msg: "This session is incredibly insightful! 👏", time: "10:02 AM" },
  { id: 2, user: "Carlos B.", avatar: "CB",  color: "from-blue-500 to-blue-700",       msg: "Can you explain the Q3 strategy again?",   time: "10:04 AM" },
  { id: 3, user: "Anna C.",   avatar: "AC",  color: "from-amber-500 to-orange-700",    msg: "Love the data visualizations 🔥",           time: "10:05 AM" },
  { id: 4, user: "John R.",   avatar: "JR",  color: "from-emerald-500 to-teal-700",    msg: "When will the slides be shared?",          time: "10:06 AM" },
  { id: 5, user: "Jose DC.",  avatar: "JDC", color: "from-[#B22234] to-[#7A0010]",    msg: "Welcome everyone! Let's get started 🚀",   time: "10:00 AM" },
  { id: 6, user: "Maria S.",  avatar: "MS",  color: "from-pink-500 to-rose-700",       msg: "The quarterly breakdown is super clear 💡", time: "10:08 AM" },
];

// Delayed incoming messages to simulate live chat activity
const DELAYED_MSGS = [
  { user: "Robert T.", avatar: "RT", color: "from-violet-500 to-purple-700", msg: "Excellent KPI breakdown! 📊" },
  { user: "Anna C.",   avatar: "AC", color: "from-amber-500 to-orange-700",  msg: "Can we get a recording of this?" },
  { user: "Carlos B.", avatar: "CB", color: "from-blue-500 to-blue-700",     msg: "The new framework makes total sense 👍" },
  { user: "John R.",   avatar: "JR", color: "from-emerald-500 to-teal-700",  msg: "Great insights on team productivity!" },
];

// Participant tiles for video grid
const PARTICIPANTS = [
  { name: "Maria Santos",    initials: "MS",  color: "from-pink-500 to-rose-700"      },
  { name: "Jose Dela Cruz",  initials: "JDC", color: "from-[#B22234] to-[#7A0010]"   },
  { name: "Anna Cruz",       initials: "AC",  color: "from-amber-500 to-orange-700"   },
  { name: "Carlos Bautista", initials: "CB",  color: "from-blue-500 to-blue-700"      },
  { name: "John Reyes",      initials: "JR",  color: "from-emerald-500 to-teal-700"   },
  { name: "Robert Tan",      initials: "RT",  color: "from-violet-500 to-purple-700"  },
];

const REACTIONS = ["👏", "🔥", "💡", "❤️", "🙌"];

export default function StreamPage() {
  const { user } = useRole();
  const [chat, setChat]           = useState(INITIAL_CHAT);
  const [newMsg, setNewMsg]       = useState("");
  const [muted, setMuted]         = useState(false);
  const [camOff, setCamOff]       = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [reaction, setReaction]   = useState<string | null>(null);
  const [viewers, setViewers]     = useState(28);
  const [elapsed, setElapsed]     = useState(2730); // start at 45:30 (looks ongoing)
  const [speakIdx, setSpeakIdx]   = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Viewer count drift
  useEffect(() => {
    const t = setInterval(() => setViewers((v) => Math.max(24, v + Math.floor(Math.random() * 3 - 1))), 7000);
    return () => clearInterval(t);
  }, []);

  // Speaking indicator rotates
  useEffect(() => {
    const t = setInterval(() => setSpeakIdx((s) => (s + 1) % PARTICIPANTS.length), 4500);
    return () => clearInterval(t);
  }, []);

  // Delayed incoming msgs
  useEffect(() => {
    let idx = 0;
    const t = setInterval(() => {
      if (idx < DELAYED_MSGS.length) {
        const m = DELAYED_MSGS[idx++];
        const now = new Date().toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
        setChat((prev) => [...prev, { id: Date.now(), ...m, time: now }]);
      }
    }, 12000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function sendMsg(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "YO";
    const name     = user ? `${user.firstName} ${user.lastName[0]}.` : "You";
    const now      = new Date().toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
    setChat((prev) => [...prev, {
      id: Date.now(), user: name, avatar: initials,
      color: "from-[#B22234] to-[#7A0010]", msg: newMsg.trim(), time: now,
    }]);
    setNewMsg("");
  }

  function sendReaction(emoji: string) {
    setReaction(emoji);
    setTimeout(() => setReaction(null), 1400);
  }

  function fmt(s: number) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }

  const myInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : "JDC";

  return (
    <div className="animate-fade-in -m-6 flex flex-col" style={{ height: "calc(100vh - 56px)" }}>

      {/* ── Top header bar ── */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm shadow-red-400/40">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          <div>
            <h1 className="text-base font-display font-bold text-gray-900 leading-tight">
              Leadership Training Workshop
            </h1>
            <p className="text-[11px] text-gray-400">Hosted by Maria Santos · Xplore Nexus Live</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-bold">{viewers}</span> watching
          </span>
          <span className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
            <Clock className="w-3.5 h-3.5" />
            {fmt(elapsed)}
          </span>
          <Link href="/meetings" className="text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300">
            ← Meetings
          </Link>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Dark video stage ── */}
        <div className="flex-1 bg-gray-950 flex flex-col relative overflow-hidden">

          {/* Floating reaction */}
          {reaction && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <span className="text-8xl animate-fade-in-up drop-shadow-2xl select-none">{reaction}</span>
            </div>
          )}

          {/* Video area */}
          <div className="flex-1 flex items-stretch gap-3 p-4 overflow-hidden">

            {/* Main presenter tile (simulated slide share) */}
            <div
              className="relative rounded-2xl overflow-hidden border-2 border-rose-500/50 shadow-2xl shadow-rose-500/10 flex-shrink-0"
              style={{ flex: "1 1 0%", maxWidth: "65%" }}
            >
              {/* Dark slide background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-950 flex flex-col items-center justify-center px-10">
                <div className="w-full max-w-md">
                  <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-3 text-center">
                    Q2 2026 · Leadership Excellence Program
                  </p>
                  <h2 className="text-white font-bold text-xl text-center leading-tight mb-6">
                    Building High-Performance<br />Teams in 2026
                  </h2>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: "Team Productivity",  pct: 82, color: "#B22234" },
                      { label: "Engagement Score",   pct: 91, color: "#16a34a" },
                      { label: "Retention Rate",     pct: 76, color: "#d97706" },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>{bar.label}</span>
                          <span className="text-white font-bold">{bar.pct}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${bar.pct}%`, backgroundColor: bar.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-gray-500 text-center">
                    Source: Xplore Philippines HR Analytics · April 2026
                  </p>
                </div>
              </div>

              {/* Speaker label */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-white text-[11px] font-semibold">Maria Santos</span>
                <span className="text-gray-400 text-[9px]">· Presenter</span>
              </div>

              {/* Screen share badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-500/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <ScreenShare className="w-3 h-3 text-white" />
                <span className="text-white text-[9px] font-bold">Screen Share</span>
              </div>
            </div>

            {/* Participant tile grid */}
            <div className="flex flex-col gap-2 flex-1">
              {PARTICIPANTS.map((p, i) => (
                <div
                  key={p.name}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-500 flex-1 ${
                    speakIdx === i
                      ? "border-green-400 shadow-lg shadow-green-400/25 scale-[1.01]"
                      : "border-white/10"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                    <span className="text-white font-bold text-base">{p.initials}</span>
                  </div>
                  {/* Name + speaking dot */}
                  <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                    <span className="text-white text-[8px] font-semibold bg-black/50 px-1.5 py-0.5 rounded truncate max-w-[72%]">
                      {p.name.split(" ")[0]}
                    </span>
                    {speakIdx === i && (
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Controls bar ── */}
          <div className="bg-gray-900/95 border-t border-gray-800 px-5 py-3 flex items-center justify-between gap-3 flex-shrink-0">

            {/* A/V + Hand */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted((m) => !m)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  muted ? "bg-red-600/20 text-red-400 border border-red-600/30" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {muted ? "Unmuted" : "Mute"}
              </button>
              <button
                onClick={() => setCamOff((c) => !c)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  camOff ? "bg-red-600/20 text-red-400 border border-red-600/30" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {camOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                {camOff ? "Start Cam" : "Stop Cam"}
              </button>
              <button
                onClick={() => setHandRaised((h) => !h)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  handRaised ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
                {handRaised ? "✓ Hand Up" : "Raise Hand"}
              </button>
            </div>

            {/* Emoji reactions */}
            <div className="flex items-center gap-1.5 bg-gray-800 rounded-2xl px-3 py-1.5">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Utility buttons */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all">
                <Settings className="w-3.5 h-3.5" /> Settings
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all">
                <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
              </button>
            </div>
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div className="bg-white border-l border-gray-100 flex flex-col flex-shrink-0" style={{ width: "300px" }}>

          {/* Chat header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8B1A1A]" />
              <span className="text-sm font-display font-bold text-gray-900">Live Chat</span>
              <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded-full border border-red-100">
                {chat.length}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
              <Wifi className="w-3 h-3 animate-pulse" /> Live
            </span>
          </div>

          {/* Mini avatars strip */}
          <div className="px-3 py-2.5 border-b border-gray-50 flex items-center gap-1.5">
            {PARTICIPANTS.slice(0, 5).map((p) => (
              <div key={p.name} title={p.name}
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 ring-2 ring-white shadow-sm`}
              >
                {p.initials}
              </div>
            ))}
            <span className="text-[10px] text-gray-400 ml-1">+{viewers - 5} more</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {chat.map((msg) => {
              const isMe = user && msg.avatar === myInitials;
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${msg.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 shadow-sm`}>
                    {msg.avatar}
                  </div>
                  <div className={`flex-1 min-w-0 ${isMe ? "text-right" : ""}`}>
                    <div className={`flex items-baseline gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                      <span className="text-[10px] font-semibold text-gray-700">{msg.user}</span>
                      <span className="text-[9px] text-gray-400">{msg.time}</span>
                    </div>
                    <div className={`inline-block mt-0.5 px-2.5 py-1.5 rounded-xl text-xs leading-relaxed ${
                      isMe ? "bg-[#8B1A1A] text-white" : "bg-gray-100 text-gray-700"
                    }`}>
                      {msg.msg}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Reaction row */}
          <div className="px-3 py-2 border-t border-gray-50 flex items-center gap-2">
            <span className="text-[10px] text-gray-400">React:</span>
            {REACTIONS.map((emoji) => (
              <button key={emoji} onClick={() => sendReaction(emoji)}
                className="text-base hover:scale-125 transition-transform">
                {emoji}
              </button>
            ))}
          </div>

          {/* Message input */}
          <form onSubmit={sendMsg} className="px-3 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Say something…"
                className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]/30
                           text-gray-700 placeholder-gray-400"
              />
              <button type="submit"
                className="p-2.5 bg-[#8B1A1A] hover:bg-[#7B1414] text-white rounded-xl transition-colors shadow-sm shadow-[#8B1A1A]/20">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
