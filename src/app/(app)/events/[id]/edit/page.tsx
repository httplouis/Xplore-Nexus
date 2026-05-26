"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Loader2, Calendar, MapPin, Users, Tag, Ticket, X, Plus
} from "lucide-react";
import type { Event, EventType, EventStatus } from "@/types";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";

const EVENTS_KEY = "xplore_events";

function getEvent(id: string): Event | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return null;
    const arr: Event[] = JSON.parse(raw);
    return arr.find((e) => e.id === id) ?? null;
  } catch { return null; }
}

function toInputDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const { user, canManage, isAdmin } = useRole();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    name: "", description: "", type: "Online" as EventType, status: "Upcoming" as EventStatus,
    date: "", endDate: "", location: "", maxParticipants: 50,
    isPaid: false, ticketPrice: 0, tags: [] as string[],
  });

  useEffect(() => {
    const e = getEvent(params.id);
    setEvent(e);
    if (e) {
      setForm({
        name: e.name, description: e.description, type: e.type, status: e.status,
        date: toInputDate(e.date), endDate: toInputDate(e.endDate),
        location: e.location, maxParticipants: e.maxParticipants,
        isPaid: e.isPaid, ticketPrice: e.ticketPrice, tags: [...e.tags],
      });
    }
    setLoading(false);
  }, [params.id]);

  const canEdit = Boolean(isAdmin || (canManage && event?.organizerId === user?.id));

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    // TODO: PATCH /api/events/[id] when Supabase is ready
    const raw = localStorage.getItem(EVENTS_KEY) ?? "[]";
    const arr: Event[] = JSON.parse(raw);
    const next = arr.map((ev) =>
      ev.id === event.id ? {
        ...ev, ...form,
        date: new Date(form.date).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      } : ev
    );
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
    showToast("Event updated successfully!", "success");
    setSaving(false);
    router.push(`/events/${event.id}`);
  }

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>;
  if (!event || !canEdit) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-gray-600 font-semibold">{!event ? "Event not found" : "Access denied"}</p>
      <Link href="/events" className="text-sm text-[#8B1A1A] hover:underline">Back to Events</Link>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/events/${params.id}`} className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors">
          <ArrowLeft className="w-4 h-4" /> {event.name}
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Edit</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-display font-bold text-gray-900 mb-6">Edit Event</h1>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Name *</label>
            <input required type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
              className="input-field" placeholder="Event title" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="input-field resize-none" placeholder="Describe the event…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value as EventType)} className="input-field">
                {(["Online", "Onsite", "Hybrid"] as EventType[]).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as EventStatus)} className="input-field">
                {(["Upcoming", "Ongoing", "Completed", "Cancelled"] as EventStatus[]).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date & Time</label>
              <input type="datetime-local" value={form.date} onChange={(e) => set("date", e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> End Date & Time</label>
              <input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location / URL</label>
            <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} className="input-field" placeholder="Venue or meeting URL" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> Max Participants</label>
            <input type="number" min={1} max={1000} value={form.maxParticipants} onChange={(e) => set("maxParticipants", Number(e.target.value))} className="input-field" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPaid} onChange={(e) => set("isPaid", e.target.checked)} className="w-4 h-4 accent-[#8B1A1A]" />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> Paid Event</span>
            </label>
            {form.isPaid && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">₱</span>
                <input type="number" min={0} value={form.ticketPrice} onChange={(e) => set("ticketPrice", Number(e.target.value))}
                  className="input-field w-28" placeholder="0.00" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 bg-red-50 text-[#8B1A1A] text-xs font-semibold px-2.5 py-1 rounded-full">
                  {t}
                  <button type="button" onClick={() => set("tags", form.tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag…" className="input-field flex-1" />
              <button type="button" onClick={addTag} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <Link href={`/events/${params.id}`} className="text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
