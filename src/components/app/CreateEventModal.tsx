"use client";

import { useState } from "react";
import { Plus, X, Loader2, Ticket, Lock, Unlock } from "lucide-react";
import type { Event, EventType, CreateEventPayload } from "@/types";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";
import { generateJoinCode } from "@/lib/registrations";

interface Props {
  onClose: () => void;
  onCreated: (event: Event) => void;
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CreateEventModal({ onClose, onCreated }: Props) {
  const { user } = useRole();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(17, 0, 0, 0);

  const [form, setForm] = useState<CreateEventPayload>({
    name:            "",
    description:     "",
    type:            "Online",
    date:            toDatetimeLocal(tomorrow),
    endDate:         toDatetimeLocal(tomorrowEnd),
    location:        "",
    maxParticipants: 50,
    tags:            [],
    isPaid:          false,
    ticketPrice:     0,
  });
  const [tagInput, setTagInput] = useState("");
  const [loading,  setLoading]  = useState(false);

  function set<K extends keyof CreateEventPayload>(key: K, value: CreateEventPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags?.includes(tag)) set("tags", [...(form.tags ?? []), tag]);
    setTagInput("");
  }
  function removeTag(tag: string) {
    set("tags", (form.tags ?? []).filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.date) return;
    if (form.isPaid && (!form.ticketPrice || form.ticketPrice <= 0)) {
      showToast("Please enter a valid ticket price.", "error");
      return;
    }
    setLoading(true);

    try {
      const joinCode = generateJoinCode();
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          organizerId:   user?.id,
          organizerName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          joinCode,
        }),
      });
      const json = await res.json();
      if (json.success) {
        onCreated(json.data as Event);
        showToast("Event created! Join code generated.", "success");
        onClose();
      } else {
        showToast(json.error ?? "Failed to create event", "error");
      }
    } catch {
      showToast("Network error. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel animate-fade-in-up max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">Create New Event</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the details to schedule and publish a new event</p>
          </div>
          <button onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Event Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input required type="text" value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Annual Strategy Summit 2026"
              className="input-field" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={3} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Briefly describe the event…"
              className="input-field resize-none" />
          </div>

          {/* Type + Max Participants */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select value={form.type}
                onChange={(e) => set("type", e.target.value as EventType)}
                className="input-field">
                <option>Online</option>
                <option>Onsite</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Max Participants <span className="text-xs text-gray-400 font-normal">(max 100)</span>
              </label>
              <input type="number" min={2} max={100} value={form.maxParticipants}
                onChange={(e) => set("maxParticipants", Math.min(100, Math.max(2, Number(e.target.value))))}
                className="input-field" />
            </div>
          </div>

          {/* Start + End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input required type="datetime-local" value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date & Time</label>
              <input type="datetime-local" value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="input-field" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {form.type === "Online" ? "Meeting URL" : form.type === "Onsite" ? "Venue / Address" : "Location (Venue + URL)"}
            </label>
            <input type="text" value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder={
                form.type === "Online" ? "https://meet.xplore.io/…" :
                form.type === "Onsite" ? "Building address or venue name" :
                "Main Hall + https://meet.xplore.io/…"
              }
              className="input-field" />
          </div>

          {/* ── Ticketing Section ─────────────────────────────────────────── */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#8B1A1A]" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Ticketing</span>
              </div>
              {/* Free / Paid toggle */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-0.5">
                <button type="button"
                  onClick={() => { set("isPaid", false); set("ticketPrice", 0); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    !form.isPaid ? "bg-[#8B1A1A] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  <Unlock className="w-3 h-3" />Free
                </button>
                <button type="button"
                  onClick={() => set("isPaid", true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    form.isPaid ? "bg-[#8B1A1A] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  <Lock className="w-3 h-3" />Paid
                </button>
              </div>
            </div>

            <div className="px-4 py-4 space-y-3">
              {form.isPaid ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Ticket Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₱</span>
                    <input
                      type="number" min={1} step={0.01}
                      value={form.ticketPrice || ""}
                      onChange={(e) => set("ticketPrice", Number(e.target.value))}
                      placeholder="0.00"
                      className="input-field pl-7" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Participants will be directed to the payment page before receiving their ticket.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <Unlock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Free to Register</p>
                    <p className="text-xs text-gray-400">All registrants receive a Ticket Code (TKT-XXXXXX) for access validation.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2.5">
                <span className="text-blue-600 text-xs font-bold">🔑</span>
                <p className="text-xs text-blue-700">
                  A <span className="font-bold">Join Code</span> (e.g. <code className="font-mono bg-blue-100 px-1 rounded">XPL-XXXX-2026</code>) will be auto-generated.
                  Participants use this + their Ticket Code to validate access.
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter"
                className="input-field flex-1" />
              <button type="button" onClick={addTag}
                className="px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                Add
              </button>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.tags ?? []).map((tag) => (
                  <span key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-[#8B1A1A] text-xs font-semibold rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Organizer info */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
              {user?.avatarInitials ?? "?"}
            </div>
            <span>
              Creating as <span className="font-semibold text-gray-700">{user ? `${user.firstName} ${user.lastName}` : "Unknown"}</span>
              {" "}· <span className="font-semibold text-gray-700">{user?.role}</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? "Creating…" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
