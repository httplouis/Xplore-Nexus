"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, ArrowLeft, Loader2, CheckCircle2, XCircle, Video, Lock, MapPin, Calendar, Clock
} from "lucide-react";
import type { Event } from "@/types";
import { useRole } from "@/lib/context/RoleContext";

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

export default function JoinPage({ params }: { params: { code: string } }) {
  const { user } = useRole();
  const code = decodeURIComponent(params.code).toUpperCase();

  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      setLoadingEvent(true);
      try {
        // Try to fetch event by joinCode first
        let res = await fetch(`/api/events?joinCode=${code}`);
        let json = await res.json();
        
        if (!json.success || !json.data) {
          // Fall back to looking up by event ID
          res = await fetch(`/api/events/${code}`);
          json = await res.json();
        }

        if (json.success && json.data) {
          setEvent(json.data);
        }
      } catch (error) {
        console.error("Error loading event for join:", error);
      } finally {
        setLoadingEvent(false);
      }
    }
    loadEvent();
  }, [code]);

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
          <div className="flex flex-col gap-2 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {fmtDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {fmtTime(event.date)}
            </span>
            <span className={`inline-block w-fit px-2 py-0.5 rounded-full text-[10px] font-bold ${
              event.type === "Onsite" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
            }`}>
              {event.type} Event
            </span>
          </div>
        </div>
      </div>

      {/* Direct Room Access / Venue Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
        <div className="p-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Access Granted</p>
            <h2 className="font-display font-bold text-lg text-gray-900 mt-1">
              Welcome to the Session!
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {user ? `Logged in as ${user.firstName} ${user.lastName}` : "Joining as Guest (No registration required)"}
            </p>
          </div>

          {/* Join button (for online events) */}
          {event.type !== "Onsite" && event.location && (
            <a href={event.location} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-md shadow-[#8B1A1A]/25">
              <Video className="w-4.5 h-4.5" />
              Enter Event Room
            </a>
          )}

          {/* Onsite Venue details */}
          {event.type === "Onsite" && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-green-700 font-bold">
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Admission Free & Open</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                This event is currently set to onsite attendance. Please present your invite at the entrance venue.
              </p>
              <div className="flex items-start gap-2 pt-2 border-t border-gray-200/60">
                <MapPin className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-700">Venue / Location</p>
                  <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>
                </div>
              </div>
            </div>
          )}

          <Link href={`/events/${event.id}`}
            className="block text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← View Event Details Page
          </Link>
        </div>
      </div>
    </div>
  );
}
