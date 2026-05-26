"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket, ShieldCheck, ArrowLeft, Loader2,
  CheckCircle2, XCircle, Video, Lock,
} from "lucide-react";
import type { Event, Registration } from "@/types";
import { useRole } from "@/lib/context/RoleContext";
import { validateTicket, findRegistration } from "@/lib/registrations";

const EVENTS_KEY = "xplore_events";

function getEventByJoinCodeOrId(codeOrId: string): Event | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) {
      const arr: Event[] = JSON.parse(raw);
      return (
        arr.find((e) => e.joinCode === codeOrId.toUpperCase()) ??
        arr.find((e) => e.id === codeOrId) ??
        null
      );
    }
  } catch { /* ignore */ }
  return null;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString("en-PH", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

type ValidateState = "idle" | "loading" | "success" | "failed";

export default function JoinPage({ params }: { params: { code: string } }) {
  const { user } = useRole();
  const code = decodeURIComponent(params.code).toUpperCase();

  const [event,         setEvent]         = useState<Event | null>(null);
  const [loadingEvent,  setLoadingEvent]   = useState(true);
  const [ticketInput,   setTicketInput]    = useState("");
  const [validateState, setValidateState]  = useState<ValidateState>("idle");
  const [validatedReg,  setValidatedReg]   = useState<Registration | null>(null);

  useEffect(() => {
    const e = getEventByJoinCodeOrId(code);
    setEvent(e);
    // Auto-fill ticket code if user already registered
    if (e && user) {
      const reg = findRegistration(e.id, user.id);
      if (reg) setTicketInput(reg.ticketCode);
    }
    setLoadingEvent(false);
  }, [code, user]);

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !ticketInput.trim()) return;
    setValidateState("loading");
    await new Promise((r) => setTimeout(r, 800)); // simulate check
    const reg = validateTicket(event.joinCode, ticketInput, event.id);
    if (reg) {
      setValidatedReg(reg);
      setValidateState("success");
    } else {
      setValidateState("failed");
    }
  }

  if (loadingEvent) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-sm mx-auto text-center py-24 space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
          <XCircle className="w-7 h-7 text-gray-400" />
        </div>
        <h1 className="font-display font-bold text-gray-800">Invalid Join Code</h1>
        <p className="text-gray-400 text-sm">No event found for code <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{code}</code></p>
        <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-[#8B1A1A] font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" />Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">

      {/* Back */}
      <Link href={`/events/${event.id}`}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B1A1A] transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to Event
      </Link>

      {/* Event banner */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#8B1A1A] to-red-400" />
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#8B1A1A]" />
            <code className="text-xs font-mono font-bold text-[#8B1A1A] bg-red-50 px-2.5 py-0.5 rounded-full tracking-wider">
              {event.joinCode}
            </code>
          </div>
          <h1 className="font-display font-bold text-xl text-gray-900">{event.name}</h1>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{fmtDate(event.date)}</span>
            <span>·</span>
            <span>{fmtTime(event.date)}</span>
            <span>·</span>
            <span className={event.isPaid ? "text-amber-600 font-semibold" : "text-green-600 font-semibold"}>
              {event.isPaid ? `₱${event.ticketPrice}` : "Free"}
            </span>
          </div>
        </div>
      </div>

      {/* Validation form */}
      {validateState !== "success" && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-base">Enter Your Ticket Code</h2>
            <p className="text-xs text-gray-400 mt-0.5">Enter the <strong>TKT-XXXXXX</strong> code from your registration confirmation.</p>
          </div>

          <form onSubmit={handleValidate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ticket Code</label>
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => {
                  setTicketInput(e.target.value.toUpperCase());
                  setValidateState("idle");
                }}
                placeholder="TKT-XXXXXX"
                maxLength={10}
                className="input-field font-mono text-center text-lg tracking-[0.2em] uppercase font-bold"
                autoFocus
              />
            </div>

            {validateState === "failed" && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-700 font-semibold">
                  Invalid or unrecognized ticket code. Please check and try again.
                </p>
              </div>
            )}

            <button type="submit" disabled={validateState === "loading" || !ticketInput.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-[#8B1A1A]/20">
              {validateState === "loading"
                ? <><Loader2 className="w-4 h-4 animate-spin" />Validating…</>
                : <><Ticket className="w-4 h-4" />Validate Ticket</>
              }
            </button>
          </form>

          {!user && (
            <p className="text-center text-xs text-gray-400">
              <Link href="/login" className="font-semibold text-[#8B1A1A] hover:underline">Sign in</Link>
              {" "}to auto-fill your ticket code.
            </p>
          )}
        </div>
      )}

      {/* ── Access Granted ─────────────────────────────────────────────────── */}
      {validateState === "success" && validatedReg && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-bold uppercase tracking-wide">Access Granted</p>
              <h2 className="font-display font-bold text-xl text-gray-900 mt-1">Welcome, {validatedReg.userName}!</h2>
              <p className="text-xs text-gray-400 mt-1">Your ticket <code className="font-mono">{validatedReg.ticketCode}</code> is valid for this event.</p>
            </div>

            {/* Join button (for online events) */}
            {event.type !== "Onsite" && event.location && (
              <a href={event.location} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-[#8B1A1A]/25">
                <Video className="w-4 h-4" />
                Enter Event Room
              </a>
            )}

            {event.type === "Onsite" && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <ShieldCheck className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <p className="font-semibold">Show this screen to the event staff.</p>
                <p className="text-xs text-gray-400 mt-0.5">Venue: {event.location}</p>
              </div>
            )}

            <Link href={`/events/${event.id}`}
              className="block text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to event details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
