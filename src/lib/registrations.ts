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
