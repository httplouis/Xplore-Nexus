"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser, UserRole } from "@/types";

// Re-export so other client components can import from here
export { DEMO_ACCOUNTS } from "@/lib/data/demo-accounts";
import { DEMO_ACCOUNTS } from "@/lib/data/demo-accounts";

const SESSION_KEY = "xplore_session";

// ─── Context types ────────────────────────────────────────────────────────────
interface RoleContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  /** Switch role (demo only — updates localStorage + re-renders) */
  setRole: (role: UserRole) => void;
  /** Set the entire user session (called after login) */
  setSession: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isOrganizer: boolean;
  isInstructor: boolean;
  isParticipant: boolean;
  /** True if role can create/manage events & meetings */
  canManage: boolean;
  /** True if role has org-wide analytics & user management */
  isAdminOnly: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

// ─── Helper ───────────────────────────────────────────────────────────────────
function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount (client only)
  useEffect(() => {
    setUser(readSession());
    setHydrated(true);
  }, []);

  const setSession = useCallback((u: AuthUser) => {
    writeSession(u);
    setUser(u);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    // Find the matching demo account for this role, or just patch current user's role
    const demoUser = DEMO_ACCOUNTS.find((a) => a.role === role);
    const next = demoUser ?? { ...(user ?? DEMO_ACCOUNTS[0]), role };
    writeSession(next);
    setUser(next);
  }, [user]);

  const logout = useCallback(() => {
    writeSession(null);
    setUser(null);
  }, []);

  const role = user?.role ?? null;

  const value: RoleContextValue = {
    user,
    role,
    setRole,
    setSession,
    logout,
    isAdmin: role === "Admin",
    isOrganizer: role === "Organizer",
    isInstructor: role === "Instructor",
    isParticipant: role === "Participant",
    canManage: role === "Admin" || role === "Organizer",
    isAdminOnly: role === "Admin",
  };

  // Don't render children until we've hydrated from localStorage
  if (!hydrated) return null;

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside <RoleProvider>");
  return ctx;
}
