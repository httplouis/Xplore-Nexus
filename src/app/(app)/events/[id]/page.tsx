"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Tag,
  Video, Pencil, Trash2, Share2, Loader2, Ticket,
  Copy, Check, Lock, ShieldCheck, AlertCircle,
} from "lucide-react";
import type { Event, Registration } from "@/types";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";
import {
  findRegistration,
  createRegistration,
  readRegistrations,
  writeRegistrations,
} from "@/lib/registrations";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EVENTS_KEY = "xplore_events";

function getEvent(id: string): Event | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) {
      const arr: Event[] = JSON.parse(raw);
      return arr.find((e) => e.id === id) ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

function fmtDate(iso: string) {
  if (!iso) return "Date TBD";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}
function fmtPHP(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

// ─── TicketCard ────────────────────────────────────────────────────────────────
function TicketCard({ reg }: { reg: Registration }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(reg.ticketCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border-2 border-dashed border-[#8B1A1A]/30 rounded-2xl bg-gradient-to-br from-red-50 to-white p-5 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Your Ticket — Confirmed</span>
      </div>

      <div className="text-center py-3">
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Ticket Code</p>
        <p className="font-mono text-3xl font-black text-[#8B1A1A] tracking-widest">{reg.ticketCode}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={copyCode}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            copied ? "bg-green-600 text-white" : "bg-[#8B1A1A] text-white hover:bg-[#7B1414]"
          }`}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
        <Link
          href={`/join/${reg.eventId}`}
          className="flex items-center justify-center gap-2 px-4 rounded-xl border border-[#8B1A1A]/30 text-[#8B1A1A] text-xs font-bold hover:bg-red-50 transition-all">
          <Video className="w-3.5 h-3.5" />
          Join
        </Link>
      </div>

      {reg.paymentRef && (
        <p className="text-[10px] text-gray-400 text-center">Payment Ref: {reg.paymentRef}</p>
      )}
      <p className="text-[10px] text-gray-400 text-center">
        Registered: {new Date(reg.registeredAt).toLocaleDateString("en-PH")}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { user, canManage, isAdmin } = useRole();
  const router = useRouter();

  const [event,       setEvent]       = useState<Event | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(false);
  const [registering, setRegistering] = useState(false);
  const [myReg,       setMyReg]       = useState<Registration | null>(null);
  const [codeCopied,  setCodeCopied]  = useState(false);

  // Load event + my registration
  useEffect(() => {
    const e = getEvent(params.id);
    setEvent(e);
    if (e && user) {
      setMyReg(findRegistration(e.id, user.id));
    }
    setLoading(false);
  }, [params.id, user]);

  const isFull   = Boolean(event && event.registrationCount >= event.maxParticipants);
  const canEdit  = Boolean(isAdmin || (canManage && event?.organizerId === user?.id));
  const seatsLeft = event ? event.maxParticipants - event.registrationCount : 0;
  const seatsPct  = event ? Math.min(100, Math.round((event.registrationCount / event.maxParticipants) * 100)) : 0;

  // ── Free registration ──────────────────────────────────────────────────────
  async function handleFreeRegister() {
    if (!event || !user || myReg) return;
    setRegistering(true);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:    user.id,
          userName:  `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          eventName: event.name,
          isPaid:    false,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const reg: Registration = json.data;
        // Persist
        const existing = readRegistrations();
        writeRegistrations([...existing, reg]);
        setMyReg(reg);
        // Bump count
        const raw  = localStorage.getItem(EVENTS_KEY) ?? "[]";
        const arr  = JSON.parse(raw) as Event[];
        const next = arr.map((e) =>
          e.id === event.id
            ? { ...e, registrationCount: e.registrationCount + 1 }
            : e
        );
        localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
        setEvent((v) => v ? { ...v, registrationCount: v.registrationCount + 1 } : v);
        showToast("Registered! Check your ticket below.", "success");
      } else {
        showToast(json.error ?? "Registration failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setRegistering(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!event) return;
    setDeleting(true);
    try {
      await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      const raw = localStorage.getItem(EVENTS_KEY) ?? "[]";
      const arr = (JSON.parse(raw) as Event[]).filter((e) => e.id !== event.id);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(arr));
      showToast("Event deleted.", "success");
      router.push("/events");
    } catch {
      showToast("Failed to delete event.", "error");
    } finally {
      setDeleting(false);
    }
  }

  function copyJoinCode() {
    if (!event) return;
    navigator.clipboard.writeText(event.joinCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  // ── Loading / Not found ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-600 font-semibold">Event not found</p>
        <Link href="/events"
          className="flex items-center gap-1.5 text-sm font-medium text-[#8B1A1A] hover:text-[#7B1414] transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Events
        </Link>
      </div>
    );
  }

  const typeBg   = event.type === "Online" ? "bg-emerald-100 text-emerald-700" :
                   event.type === "Onsite" ? "bg-amber-100  text-amber-700"   :
                                             "bg-purple-100 text-purple-700";
  const statusBg = event.status === "Upcoming"  ? "bg-green-100 text-green-700"  :
                   event.status === "Ongoing"    ? "bg-red-100   text-red-600"    :
                                                   "bg-gray-100  text-gray-600";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/events" className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors">
          <ArrowLeft className="w-4 h-4" />Events
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{event.name}</span>
      </div>

      {/* Hero card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className={`h-1.5 ${
          event.status === "Ongoing"  ? "bg-gradient-to-r from-red-400 to-orange-400" :
          event.status === "Upcoming" ? "bg-gradient-to-r from-[#8B1A1A] to-red-400"  :
          "bg-gray-200"
        }`} />

        <div className="p-6 sm:p-8 space-y-5">
          {/* Status / type / ticket badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBg}`}>
              {event.status === "Ongoing" && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
              {event.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${typeBg}`}>
              {event.type === "Online" && <Video className="w-3 h-3 mr-1" />}
              {event.type}
            </span>
            {/* Ticket price badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              event.isPaid ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              <Ticket className="w-3 h-3" />
              {event.isPaid ? fmtPHP(event.ticketPrice) : "Free"}
            </span>
            {canEdit && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-[#8B1A1A] border border-red-100">
                Owner
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-display font-bold text-gray-900 leading-tight">{event.name}</h1>

          {event.description && (
            <p className="text-gray-500 text-sm leading-relaxed">{event.description}</p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: "Date",    value: fmtDate(event.date) },
              { icon: Clock,    label: "Time",    value: fmtTime(event.date) || "TBD" },
              { icon: Users,    label: "Seats",   value: `${event.registrationCount} / ${event.maxParticipants}` },
              { icon: MapPin,   label: event.type === "Online" ? "Link" : "Venue", value: event.location || "TBD" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Seats capacity bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-500">
                {isFull ? "🎟️ Sold Out" : `${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} remaining`}
              </span>
              <span className="text-xs font-bold text-gray-700">{seatsPct}% filled</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  seatsPct >= 90 ? "bg-red-500" : seatsPct >= 70 ? "bg-amber-500" : "bg-[#8B1A1A]"
                }`}
                style={{ width: `${seatsPct}%` }}
              />
            </div>
          </div>

          {/* Organizer + Join Code row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xs font-bold">
                {event.organizerName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Organized by</p>
                <p className="text-sm font-semibold text-gray-800">{event.organizerName}</p>
              </div>
            </div>

            {/* Join Code — only visible to Admin/Organizer */}
            {canManage && (
              <button onClick={copyJoinCode}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  codeCopied
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-100 text-[#8B1A1A] hover:bg-red-100"
                }`}>
                <Lock className="w-3.5 h-3.5" />
                {codeCopied ? "Copied!" : event.joinCode}
                {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              {event.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-red-50 text-[#8B1A1A] text-xs font-semibold rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── My Ticket (if registered) ─────────────────────────────────────── */}
      {myReg && <TicketCard reg={myReg} />}

      {/* ── Sold out notice ─────────────────────────────────────────────────── */}
      {isFull && !myReg && !canEdit && (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-700">This event is fully booked</p>
            <p className="text-xs text-gray-400 mt-0.5">All {event.maxParticipants} seats have been taken. Check back for cancellations.</p>
          </div>
        </div>
      )}

      {/* ── Action bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Participant actions — not yet registered, not full */}
        {!canManage && !myReg && !isFull && event.status === "Upcoming" && (
          event.isPaid ? (
            <Link
              href={`/events/${event.id}/checkout`}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm shadow-[#8B1A1A]/25">
              <Ticket className="w-4 h-4" />
              Buy Ticket — {fmtPHP(event.ticketPrice)}
            </Link>
          ) : (
            <button onClick={handleFreeRegister} disabled={registering}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm">
              {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
              {registering ? "Registering…" : "Register Free"}
            </button>
          )
        )}

        {/* Online join link */}
        {event.type === "Online" && event.location && (
          <a href={event.location} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            <Video className="w-4 h-4" />Join Online
          </a>
        )}

        {/* Share */}
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); showToast("Link copied!", "success"); }}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
          <Share2 className="w-4 h-4" />Share
        </button>

        {/* Admin / organizer: manage */}
        {canEdit && (
          <>
            <button onClick={() => showToast("Edit event — coming soon!", "info")}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
              <Pencil className="w-4 h-4" />Edit
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-600">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </>
        )}
      </div>

      {/* ── Registrations list (organizer/admin only) ─────────────────────── */}
      {canManage && (
        <RegistrationsList eventId={event.id} />
      )}
    </div>
  );
}

// ─── Registrations list component ─────────────────────────────────────────────
function RegistrationsList({ eventId }: { eventId: string }) {
  const [regs, setRegs] = useState<Registration[]>([]);

  useEffect(() => {
    const { getEventRegistrations } = require("@/lib/registrations");
    setRegs(getEventRegistrations(eventId));
  }, [eventId]);

  if (regs.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h2 className="font-display font-bold text-gray-900 text-sm">Registrations ({regs.length})</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {regs.map((r) => (
          <div key={r.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">{r.userName}</p>
              <p className="text-xs text-gray-400">{r.userEmail}</p>
            </div>
            <div className="flex items-center gap-3">
              <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{r.ticketCode}</code>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                r.status === "Confirmed" ? "bg-green-100 text-green-700" :
                r.status === "Pending"   ? "bg-amber-100 text-amber-700" :
                                           "bg-gray-100 text-gray-500"
              }`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
