"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart2, Calendar, Users, TrendingUp, Download, ExternalLink } from "lucide-react";
import type { Event } from "@/types";

const EVENTS_KEY = "xplore_events";
const REGS_KEY = "xplore_registrations";

function getEvents(): Event[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getRegCount(eventId: string): number {
  try {
    const raw = localStorage.getItem(REGS_KEY);
    if (!raw) return 0;
    const all = JSON.parse(raw) as Array<{ eventId: string }>;
    return all.filter((r) => r.eventId === eventId).length;
  } catch { return 0; }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function fmtPHP(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

function BarChart({ data }: { data: { label: string; value: number; max: number; color: string }[] }) {
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600 truncate max-w-[180px]">{d.label}</span>
            <span className="text-xs font-bold text-gray-800 ml-2">{d.value}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round((d.value / (d.max || 1)) * 100)}%`, backgroundColor: d.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventReportsPage() {
  const events = useMemo(() => getEvents(), []);

  const totalRegs = events.reduce((s, e) => s + e.registrationCount, 0);
  const totalRevenue = events.reduce((s, e) => s + (e.isPaid ? e.ticketPrice * e.registrationCount : 0), 0);
  const avgFill = events.length ? Math.round(events.reduce((s, e) => s + (e.registrationCount / e.maxParticipants) * 100, 0) / events.length) : 0;
  const upcomingCount = events.filter((e) => e.status === "Upcoming").length;

  const typeBreakdown = ["Online", "Onsite", "Hybrid"].map((t) => ({
    label: t, value: events.filter((e) => e.type === t).length, max: events.length,
    color: t === "Online" ? "#16a34a" : t === "Onsite" ? "#d97706" : "#7c3aed",
  }));

  const statusBreakdown = ["Upcoming", "Ongoing", "Completed", "Cancelled"].map((s) => ({
    label: s, value: events.filter((e) => e.status === s).length, max: events.length,
    color: s === "Upcoming" ? "#16a34a" : s === "Ongoing" ? "#8B1A1A" : s === "Completed" ? "#6b7280" : "#ef4444",
  }));

  const topEvents = [...events].sort((a, b) => b.registrationCount - a.registrationCount).slice(0, 5);
  const maxReg = Math.max(...topEvents.map((e) => e.registrationCount), 1);

  function exportCSV() {
    const rows = [
      ["Event", "Type", "Status", "Date", "Registrations", "Max", "Fill %", "Revenue"],
      ...events.map((e) => [
        e.name, e.type, e.status, fmtDate(e.date),
        e.registrationCount, e.maxParticipants,
        Math.round((e.registrationCount / e.maxParticipants) * 100) + "%",
        e.isPaid ? fmtPHP(e.ticketPrice * e.registrationCount) : "Free",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "event-reports.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Event Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Aggregate data across all events</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: events.length, icon: Calendar, color: "text-[#8B1A1A]", bg: "bg-red-50" },
          { label: "Total Registrations", value: totalRegs, icon: Users, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Avg Fill Rate", value: `${avgFill}%`, icon: TrendingUp, color: "text-green-700", bg: "bg-green-50" },
          { label: "Total Revenue", value: fmtPHP(totalRevenue), icon: BarChart2, color: "text-amber-700", bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-display font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${bg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top events by registration */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h2 className="font-display font-bold text-gray-900 mb-1">Top Events by Registration</h2>
          <p className="text-xs text-gray-400 mb-4">Sorted by total registrations</p>
          <BarChart data={topEvents.map((e, i) => ({
            label: e.name, value: e.registrationCount, max: maxReg,
            color: ["#8B1A1A", "#16a34a", "#d97706", "#7c3aed", "#0284c7"][i],
          }))} />
        </div>

        {/* Breakdown charts */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="font-display font-bold text-gray-900 mb-4">Events by Type</h2>
            <BarChart data={typeBreakdown} />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="font-display font-bold text-gray-900 mb-4">Events by Status</h2>
            <BarChart data={statusBreakdown} />
          </div>
        </div>
      </div>

      {/* All events table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-display font-bold text-gray-900">All Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Event", "Type", "Date", "Registrations", "Fill", "Revenue", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((e) => {
                const fill = Math.round((e.registrationCount / e.maxParticipants) * 100);
                return (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-[200px] truncate">{e.name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        e.type === "Online" ? "bg-green-100 text-green-700" :
                        e.type === "Onsite" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
                      }`}>{e.type}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{fmtDate(e.date)}</td>
                    <td className="px-5 py-3 text-gray-700">{e.registrationCount}/{e.maxParticipants}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#8B1A1A]" style={{ width: `${fill}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{fill}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {e.isPaid ? fmtPHP(e.ticketPrice * e.registrationCount) : <span className="text-gray-400">Free</span>}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/events/${e.id}`} className="text-[#8B1A1A] hover:text-[#7B1414] transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
