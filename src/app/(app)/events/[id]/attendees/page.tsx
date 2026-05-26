"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Download, UserCheck, UserX, Mail, Loader2, Users } from "lucide-react";
import type { Registration } from "@/types";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";

const EVENTS_KEY = "xplore_events";
const REGS_KEY = "xplore_registrations";

function getEventName(id: string): string {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return "Event";
    const arr = JSON.parse(raw);
    return arr.find((e: { id: string; name: string }) => e.id === id)?.name ?? "Event";
  } catch { return "Event"; }
}

function getRegistrations(eventId: string): Registration[] {
  try {
    const raw = localStorage.getItem(REGS_KEY);
    if (!raw) return [];
    const all: Registration[] = JSON.parse(raw);
    return all.filter((r) => r.eventId === eventId);
  } catch { return []; }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function AttendeesPage({ params }: { params: { id: string } }) {
  const { canManage } = useRole();
  const [regs, setRegs] = useState<Registration[]>([]);
  const [attended, setAttended] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("Event");

  useEffect(() => {
    setEventName(getEventName(params.id));
    setRegs(getRegistrations(params.id));
    // Load attended set from localStorage
    try {
      const raw = localStorage.getItem(`xplore_attended_${params.id}`);
      if (raw) setAttended(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
    setLoading(false);
  }, [params.id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return regs.filter((r) =>
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.ticketCode.toLowerCase().includes(q)
    );
  }, [regs, search]);

  function toggleAttended(regId: string) {
    setAttended((prev) => {
      const next = new Set(prev);
      if (next.has(regId)) next.delete(regId); else next.add(regId);
      localStorage.setItem(`xplore_attended_${params.id}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  function exportCSV() {
    const rows = [
      ["Name", "Email", "Ticket Code", "Status", "Attended", "Registered At"],
      ...regs.map((r) => [
        r.userName, r.userEmail, r.ticketCode, r.status,
        attended.has(r.id) ? "Yes" : "No", fmtDate(r.registeredAt),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `attendees-${params.id}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast("Exported to CSV!", "success");
  }

  if (!canManage) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-gray-600 font-semibold">Access denied</p>
      <Link href="/events" className="text-sm text-[#8B1A1A] hover:underline">Back to Events</Link>
    </div>
  );

  const attendedCount = regs.filter((r) => attended.has(r.id)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/events/${params.id}`} className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors">
          <ArrowLeft className="w-4 h-4" /> {eventName}
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Attendees</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Attendees</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {regs.length} registered · <span className="text-green-600 font-medium">{attendedCount} attended</span>
          </p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Registered", value: regs.length, color: "text-gray-900", bg: "bg-gray-50 border-gray-200" },
          { label: "Attended", value: attendedCount, color: "text-green-700", bg: "bg-green-50 border-green-100" },
          { label: "Absent", value: regs.length - attendedCount, color: "text-red-700", bg: "bg-red-50 border-red-100" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl px-4 py-3 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ticket…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]/30" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-gray-300 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-8 h-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-400">
              {regs.length === 0 ? "No registrations yet" : "No results found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Participant", "Email", "Ticket Code", "Status", "Registered", "Attended"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => {
                  const isAttended = attended.has(r.id);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center text-[#8B1A1A] text-xs font-bold">
                            {r.userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{r.userName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Mail className="w-3.5 h-3.5" />
                          {r.userEmail}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{r.ticketCode}</code>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          r.status === "Confirmed" ? "bg-green-100 text-green-700" :
                          r.status === "Pending" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{fmtDate(r.registeredAt)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleAttended(r.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            isAttended
                              ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600"
                              : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700"
                          }`}>
                          {isAttended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          {isAttended ? "Present" : "Mark"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {regs.length} registrations
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
