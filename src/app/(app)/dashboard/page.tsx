"use client";

import { useState } from "react";
import {
  Calendar, BookOpen, Users, Target,
  TrendingUp, Plus, Video, ArrowRight,
  Clock, UserCheck, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/lib/context/RoleContext";
import { useEvents } from "@/lib/hooks/useEvents";
import { CreateEventModal } from "@/components/app/CreateEventModal";
import type { Event } from "@/types";

// ─── Safe date formatter ─────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return "Date TBD";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

const trainingProgress = [
  { name: "Digital Marketing Fundamentals", progress: 75, color: "#8B1A1A" },
  { name: "Project Management Essentials",  progress: 45, color: "#16a34a" },
  { name: "Data Analytics Bootcamp",         progress: 60, color: "#d97706" },
];

export default function DashboardPage() {
  const { user, role, canManage } = useRole();
  const { events, loading: eventsLoading, addEvent } = useEvents();
  const [showCreate, setShowCreate] = useState(false);

  // Compute KPIs from real events
  const totalEvents     = events.length;
  const upcomingEvents  = events
    .filter((e) => e.status === "Upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const kpiCards = [
    {
      label: "Total Events",
      value: eventsLoading ? "—" : String(totalEvents),
      trend: "+12%",
      icon: Calendar,
    },
    {
      label: "Active Trainings",
      value: "8",
      trend: "+5%",
      icon: BookOpen,
    },
    {
      label: "Attendance Rate",
      value: "87%",
      trend: "+3%",
      icon: Users,
    },
    {
      label: "Engagement Score",
      value: "92",
      trend: "+8%",
      icon: Target,
    },
  ];

  function handleCreated(event: Event) {
    addEvent(event);
  }

  const firstName = user?.firstName ?? "there";

  // Role-specific greeting subtitle
  const subtitle: Record<string, string> = {
    Admin:       "Here's what's happening across the platform today",
    Organizer:   "Manage your events, meetings, and training sessions",
    Instructor:  "Track your training programs and participant progress",
    Participant: "Your upcoming events, meetings, and learning progress",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Create Event Modal */}
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {subtitle[role ?? "Participant"]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Role badge */}
          {role && (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
              role === "Admin"       ? "bg-[#8B1A1A]/10 text-[#8B1A1A]" :
              role === "Organizer"   ? "bg-blue-100 text-blue-700" :
              role === "Instructor"  ? "bg-amber-100 text-amber-700" :
                                       "bg-emerald-100 text-emerald-700"
            }`}>
              {role}
            </span>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-display font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                    <TrendingUp className="w-3 h-3" />
                    {card.trend}
                  </p>
                </div>
                <div className="bg-red-50 p-2.5 rounded-lg">
                  <Icon className="w-5 h-5 text-[#8B1A1A]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions — role-gated */}
      <div className="flex flex-wrap gap-3">
        {canManage && (
          <>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold
                         px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-[#8B1A1A]/25"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
            <Link
              href="/meetings"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold
                         px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
            >
              <Video className="w-4 h-4" />
              Schedule Meeting
            </Link>
            <Link
              href="/training"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold
                         px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {role === "Instructor" ? "Create Training" : "Add Training"}
            </Link>
          </>
        )}

        {/* Participant quick actions */}
        {!canManage && (
          <>
            <Link
              href="/events"
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold
                         px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-[#8B1A1A]/25"
            >
              <Calendar className="w-4 h-4" />
              Browse Events
            </Link>
            <Link
              href="/training"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold
                         px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              My Training
            </Link>
          </>
        )}
      </div>

      {/* Live banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Leadership Training Workshop</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <UserCheck className="w-3.5 h-3.5" />
                28 participants
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Clock className="w-3.5 h-3.5" />
                45 min remaining
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Presenter: Maria Santos</p>
          </div>
        </div>
        <Link
          href="/stream"
          className="flex-shrink-0 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold
                     px-5 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          Join Now
        </Link>
      </div>

      {/* Bottom 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events — from localStorage */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-bold text-gray-900 text-base">Upcoming Events</h2>
            {eventsLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingEvents.length === 0 && !eventsLoading && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No upcoming events
              </div>
            )}
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ev.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {fmtDate(ev.date)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {fmtTime(ev.date)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      {ev.participantCount}
                    </span>
                  </div>
                </div>
                <span className={ev.type === "Online" ? "badge-online" : ev.type === "Onsite" ? "badge-onsite" : "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"}>
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <Link href="/events" className="flex items-center gap-1 text-xs font-semibold text-[#8B1A1A] hover:text-[#7B1414] transition-colors">
              View All Events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Training Progress */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-gray-50">
            <h2 className="font-display font-bold text-gray-900 text-base">Training Progress</h2>
          </div>
          <div className="px-5 py-4 space-y-5">
            {trainingProgress.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{t.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{t.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${t.progress}%`, backgroundColor: t.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <Link href="/training" className="flex items-center gap-1 text-xs font-semibold text-[#8B1A1A] hover:text-[#7B1414] transition-colors">
              View All Trainings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
