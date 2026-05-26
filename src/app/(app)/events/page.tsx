"use client";

import { useState, useCallback } from "react";
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, Calendar, Users, Loader2,
} from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types";
import { showToast } from "@/components/ui/Toast";
import { useEvents } from "@/lib/hooks/useEvents";
import { useRole } from "@/lib/context/RoleContext";
import { CreateEventModal } from "@/components/app/CreateEventModal";

function fmtDate(iso: string) {
  if (!iso) return "Date TBD";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteDialog({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-panel animate-fade-in-up p-6 max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900">Delete Event</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-5">
          Are you sure you want to delete <strong>&ldquo;{name}&rdquo;</strong>?
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60
                       text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const { events, loading, addEvent, deleteEvent } = useEvents();
  const { canManage, isAdmin, user } = useRole();

  const [search, setSearch]           = useState("");
  const [showCreate, setShowCreate]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = events.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.organizerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreated = useCallback((event: Event) => {
    addEvent(event);
  }, [addEvent]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/events/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        deleteEvent(deleteTarget.id);
        showToast("Event deleted.", "success");
      } else {
        showToast(json.error ?? "Delete failed", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  // Can a given event be edited/deleted by current user?
  function canEditEvent(ev: Event): boolean {
    if (isAdmin) return true;
    return ev.organizerId === user?.id || ev.isOwner;
  }

  const typeBadge = (type: Event["type"]) => {
    const map: Record<string, string> = {
      Online: "badge-online",
      Onsite: "badge-onsite",
      Hybrid: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700",
    };
    return map[type] ?? "badge-online";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modals */}
      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {deleteTarget && (
        <DeleteDialog
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {canManage ? "Manage all events and registrations" : "Browse and register for upcoming events"}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-semibold
                       px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-[#8B1A1A]/20"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Search + Filter */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg
                         text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2
                         focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]/30"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Event Name", "Date", "Type", "Organizer", "Participants", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-sm text-gray-400">
                      No events found
                    </td>
                  </tr>
                )}
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/events/${ev.id}`}
                          className={`font-medium hover:underline underline-offset-2 ${canEditEvent(ev) ? "text-[#8B1A1A]" : "text-gray-800"}`}
                        >
                          {ev.name}
                        </Link>
                        {canEditEvent(ev) && (
                          <span className="badge-owner">Owner</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {fmtDate(ev.date)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={typeBadge(ev.type)}>{ev.type}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{ev.organizerName}</td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {ev.participantCount}
                        {ev.maxParticipants && (
                          <span className="text-gray-400">/ {ev.maxParticipants}</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={
                        ev.status === "Upcoming"  ? "badge-upcoming"  :
                        ev.status === "Completed" ? "badge-completed" :
                        ev.status === "Ongoing"   ? "badge-live"      : "badge-upcoming"
                      }>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/events/${ev.id}`}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {canEditEvent(ev) && (
                          <>
                            <button
                              onClick={() => showToast("Edit coming soon!", "info")}
                              className="p-1.5 text-gray-400 hover:text-[#8B1A1A] hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(ev)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {/* Participant: register button */}
                        {!canManage && ev.status === "Upcoming" && (
                          <button
                            onClick={() => showToast(`Registered for "${ev.name}"!`, "success")}
                            className="text-xs font-semibold text-[#8B1A1A] border border-[#8B1A1A]/30 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-600">{events.length}</span> events
          </p>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#8B1A1A] hover:text-[#7B1414] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
