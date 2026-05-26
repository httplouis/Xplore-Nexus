"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Ticket, CreditCard, CheckCircle2,
  Loader2, ShieldCheck, AlertTriangle,
} from "lucide-react";
import type { Event, Registration } from "@/types";
import { useRole } from "@/lib/context/RoleContext";
import { showToast } from "@/components/ui/Toast";
import {
  readRegistrations,
  writeRegistrations,
  findRegistration,
} from "@/lib/registrations";

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

function fmtPHP(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "TBD";
  return d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const { user } = useRole();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [event,      setEvent]      = useState<Event | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmed,  setConfirmed]  = useState(false);
  const [myReg,      setMyReg]      = useState<Registration | null>(null);

  // Check for returning payment callback (?payment=success&ref=INF-XXXXX)
  const paymentStatus = searchParams.get("payment");
  const paymentRef    = searchParams.get("ref");

  useEffect(() => {
    const e = getEvent(params.id);
    setEvent(e);

    if (e && user) {
      const existing = findRegistration(e.id, user.id);
      setMyReg(existing);

      // Returning from payment gateway with success
      if (paymentStatus === "success" && paymentRef && existing && existing.status === "Pending") {
        const regs = readRegistrations();
        const updated = regs.map((r) =>
          r.id === existing.id ? { ...r, status: "Confirmed" as const, paymentRef: paymentRef } : r
        );
        writeRegistrations(updated);
        setMyReg({ ...existing, status: "Confirmed", paymentRef });
        setConfirmed(true);
        showToast("Payment confirmed! Your ticket is ready.", "success");
      }
    }
    setLoading(false);
  }, [params.id, user, paymentStatus, paymentRef]);

  async function handlePay() {
    if (!event || !user) return;
    setProcessing(true);

    try {
      // 1. Create pending registration
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:    user.id,
          userName:  `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          eventName: event.name,
          isPaid:    true,
        }),
      });
      const json = await res.json();
      if (!json.success) { showToast("Failed to initiate registration.", "error"); return; }

      const reg: Registration = json.data;
      // Persist pending
      const existing = readRegistrations();
      writeRegistrations([...existing, reg]);
      setMyReg(reg);

      // 2. In a real app: redirect to Informatics gateway
      // window.location.href = `https://pay.informatics.ph/checkout?amount=${event.ticketPrice}&ref=${reg.id}&callback=/events/${event.id}/checkout`;
      //
      // For demo: simulate redirect with a short delay then return with success
      await new Promise((r) => setTimeout(r, 1500));

      // Simulate payment success — update status
      const payRef = `INF-${Date.now().toString(36).toUpperCase()}`;
      const regs   = readRegistrations();
      const updated = regs.map((r) =>
        r.id === reg.id ? { ...r, status: "Confirmed" as const, paymentRef: payRef } : r
      );
      writeRegistrations(updated);
      const confirmedReg = { ...reg, status: "Confirmed" as const, paymentRef: payRef };
      setMyReg(confirmedReg);

      // Bump event registration count
      const rawEvs = localStorage.getItem(EVENTS_KEY) ?? "[]";
      const evs    = JSON.parse(rawEvs) as Event[];
      const nextEvs = evs.map((e) =>
        e.id === event.id ? { ...e, registrationCount: e.registrationCount + 1 } : e
      );
      localStorage.setItem(EVENTS_KEY, JSON.stringify(nextEvs));

      setConfirmed(true);
      showToast("Payment successful! Your ticket is ready.", "success");
    } catch {
      showToast("Payment failed. Try again.", "error");
    } finally {
      setProcessing(false);
    }
  }

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
        <AlertTriangle className="w-8 h-8 text-gray-400" />
        <p className="text-gray-600 font-semibold">Event not found</p>
        <Link href="/events" className="text-sm text-[#8B1A1A] font-medium">← Back to Events</Link>
      </div>
    );
  }

  // Already registered
  if (myReg && !confirmed) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/events/${event.id}`} className="flex items-center gap-1.5 hover:text-[#8B1A1A]">
            <ArrowLeft className="w-4 h-4" />Back to Event
          </Link>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <Ticket className="w-8 h-8 text-amber-600 mx-auto" />
          <p className="font-semibold text-amber-800">You already have a ticket for this event.</p>
          <code className="block text-2xl font-mono font-black text-amber-700 tracking-widest">
            {myReg.ticketCode}
          </code>
          <Link href={`/events/${event.id}`}
            className="inline-block mt-2 text-sm font-bold text-amber-700 underline underline-offset-2">
            View Event Details
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (confirmed && myReg) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden text-center">
          <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
          <div className="p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900">Payment Confirmed!</h1>
              <p className="text-gray-500 text-sm mt-1">{event.name}</p>
            </div>
            <div className="border-2 border-dashed border-green-200 rounded-xl p-5 bg-green-50/50">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Ticket Code</p>
              <p className="font-mono text-3xl font-black text-[#8B1A1A] tracking-widest">{myReg.ticketCode}</p>
              <p className="text-xs text-gray-400 mt-2">Keep this code to validate your access on event day</p>
              {myReg.paymentRef && (
                <p className="text-[10px] text-gray-400 mt-1">Payment Ref: {myReg.paymentRef}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Link href={`/events/${event.id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#8B1A1A] hover:bg-[#7B1414] text-white text-sm font-bold py-2.5 rounded-xl transition-all">
                View My Ticket
              </Link>
              <Link href={`/join/${event.joinCode}`}
                className="flex items-center justify-center gap-2 px-4 border border-[#8B1A1A]/30 text-[#8B1A1A] text-sm font-bold rounded-xl hover:bg-red-50 transition-all">
                Validate
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Order summary + Pay Now ──────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/events/${event.id}`} className="flex items-center gap-1.5 hover:text-[#8B1A1A] transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Event
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Checkout</span>
      </div>

      {/* Order card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#8B1A1A] to-red-400" />
        <div className="p-6 space-y-5">
          <div>
            <h1 className="font-display font-bold text-gray-900 text-lg">Order Summary</h1>
            <p className="text-xs text-gray-400 mt-0.5">Review your order before payment</p>
          </div>

          {/* Event summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-[#8B1A1A]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Event Ticket</span>
            </div>
            <p className="font-display font-bold text-gray-900">{event.name}</p>
            <p className="text-xs text-gray-500">{fmtDate(event.date)} · {event.organizerName}</p>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">1× General Admission</span>
              <span className="text-sm font-bold text-gray-900">{fmtPHP(event.ticketPrice)}</span>
            </div>
          </div>

          {/* Buyer info */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-1">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Registrant</p>
            <p className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#8B1A1A]/5 rounded-xl border border-[#8B1A1A]/10">
            <span className="text-sm font-bold text-gray-700">Total Due</span>
            <span className="text-xl font-black text-[#8B1A1A]">{fmtPHP(event.ticketPrice)}</span>
          </div>

          {/* Demo notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700">Demo Mode</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Clicking &quot;Pay Now&quot; simulates payment via the Informatics gateway and immediately confirms your ticket.
              </p>
            </div>
          </div>

          {/* Pay button */}
          <button onClick={handlePay} disabled={processing}
            className="w-full flex items-center justify-center gap-2.5 bg-[#8B1A1A] hover:bg-[#7B1414] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-[#8B1A1A]/25 text-sm">
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Processing Payment…</>
            ) : (
              <><CreditCard className="w-4 h-4" />Pay {fmtPHP(event.ticketPrice)} — Confirm Ticket</>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secured by Informatics Payment Gateway
          </div>
        </div>
      </div>
    </div>
  );
}
