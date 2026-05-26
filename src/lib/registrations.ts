import type { Registration } from "@/types";

const STORE = "xplore_registrations";

// ─── Code generators ──────────────────────────────────────────────────────────
const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

export function generateJoinCode(): string {
  const part = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `XPL-${part}-${new Date().getFullYear()}`;
}

export function generateTicketCode(): string {
  const part = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `TKT-${part}`;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
export function readRegistrations(): Registration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeRegistrations(regs: Registration[]): void {
  if (typeof window !== "undefined")
    localStorage.setItem(STORE, JSON.stringify(regs));
}

/** Returns the registration for a specific user + event, or null */
export function findRegistration(
  eventId: string,
  userId: string
): Registration | null {
  return (
    readRegistrations().find(
      (r) => r.eventId === eventId && r.userId === userId
    ) ?? null
  );
}

/** Returns ALL registrations for an event */
export function getEventRegistrations(eventId: string): Registration[] {
  return readRegistrations().filter((r) => r.eventId === eventId);
}

/** Validate a ticket code against a join code's event */
export function validateTicket(
  joinCode: string,
  ticketCode: string,
  eventId: string
): Registration | null {
  const regs = readRegistrations();
  return (
    regs.find(
      (r) =>
        r.eventId === eventId &&
        r.ticketCode === ticketCode.toUpperCase().trim() &&
        r.status !== "Cancelled"
    ) ?? null
  );
}

/** Create and persist a new registration */
export function createRegistration(payload: {
  eventId: string;
  eventName: string;
  userId: string;
  userName: string;
  userEmail: string;
  isPaid: boolean;
  paymentRef?: string;
}): Registration {
  const reg: Registration = {
    id: `reg-${Date.now()}`,
    eventId: payload.eventId,
    eventName: payload.eventName,
    userId: payload.userId,
    userName: payload.userName,
    userEmail: payload.userEmail,
    ticketCode: generateTicketCode(),
    status: payload.isPaid ? "Pending" : "Confirmed", // paid = pending until payment
    paymentRef: payload.paymentRef,
    registeredAt: new Date().toISOString(),
  };

  const existing = readRegistrations();
  writeRegistrations([...existing, reg]);
  return reg;
}

/** Update a registration (e.g. after payment confirmed) */
export function confirmRegistration(
  regId: string,
  paymentRef: string
): Registration | null {
  const regs = readRegistrations();
  const idx = regs.findIndex((r) => r.id === regId);
  if (idx === -1) return null;
  regs[idx] = { ...regs[idx], status: "Confirmed", paymentRef };
  writeRegistrations(regs);
  return regs[idx];
}
