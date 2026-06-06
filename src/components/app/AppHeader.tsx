"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell, Search, ChevronDown, RefreshCw, LogOut,
  UserCircle2, X, CheckCheck, Info, AlertTriangle, Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";
import { useRole } from "@/lib/context/RoleContext";
import { DEMO_ACCOUNTS } from "@/lib/data/demo-accounts";

import type { UserRole } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
const ROLES: UserRole[] = ["Admin", "Organizer", "Instructor", "Participant"];

const ROLE_COLORS: Record<UserRole, string> = {
  Admin:       "bg-[#8B1A1A] text-white",
  Organizer:   "bg-blue-600 text-white",
  Instructor:  "bg-amber-600 text-white",
  Participant: "bg-emerald-600 text-white",
};

interface Notification {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "info",
    title: "Leadership Training Workshop",
    message: "Session is currently LIVE — 28 participants joined.",
    time: "Just now", read: false,
  },
  {
    id: "n2", type: "warning",
    title: "Team Building Activity",
    message: "Registration closes in 2 days. 15 spots remaining.",
    time: "1h ago", read: false,
  },
  {
    id: "n3", type: "success",
    title: "Digital Marketing Training",
    message: "You completed Module 3. Progress: 75%.",
    time: "3h ago", read: false,
  },
  {
    id: "n4", type: "info",
    title: "Product Review Meeting",
    message: "Scheduled for tomorrow at 10:00 AM. 12 attendees.",
    time: "5h ago", read: true,
  },
  {
    id: "n5", type: "warning",
    title: "Annual Strategy Summit",
    message: "Reminder: Event is in 5 days. Confirm attendance.",
    time: "Yesterday", read: true,
  },
];

const notifIcon: Record<Notification["type"], React.ReactNode> = {
  info:    <Info          className="w-4 h-4 text-blue-500"  />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  success: <Calendar      className="w-4 h-4 text-green-500" />,
};

// ─── Click-outside hook ───────────────────────────────────────────────────────
function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AppHeader() {
  const router = useRouter();
  const { user, role, logout } = useRole();

  // ── User dropdown ──
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  useClickOutside(userRef, useCallback(() => setUserOpen(false), []));

  // ── Notifications ──
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  useClickOutside(notifRef, useCallback(() => setNotifOpen(false), []));

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Actions ──
  function handleLogout() {
    logout();
    showToast("Logged out successfully.", "success");
    setTimeout(() => router.push("/login"), 600);
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismissNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const displayName = user ? `${user.firstName} ${user.lastName}` : "User";
  const initials = user?.avatarInitials ?? "?";
  const currentRole = role ?? "Participant";

  return (
    <>
      {/* ── Top header ──────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-[140px] right-0 h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 z-30">
        {/* Search */}
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events, trainings, users..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                       text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2
                       focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]/40 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* ── Notification bell ── */}
          <div ref={notifRef} className="relative">
            <button
              id="notif-bell-btn"
              onClick={() => { setNotifOpen((p) => !p); setUserOpen(false); }}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full
                                 border border-white flex items-center justify-center
                                 text-[9px] font-bold text-white px-0.5">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl
                              border border-gray-100 z-50 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-[#8B1A1A] hover:text-[#7B1414] font-medium transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-400">No notifications</div>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.read ? "bg-white" : "bg-blue-50/40"}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">{notifIcon[n.type]}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${n.read ? "text-gray-700" : "text-gray-900"}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                      <button
                        onClick={() => dismissNotif(n.id)}
                        className="flex-shrink-0 p-0.5 text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                  <button
                    onClick={() => { setNotifOpen(false); router.push("/notifications"); }}
                    className="text-xs text-[#8B1A1A] hover:text-[#7B1414] font-medium transition-colors"
                  >
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── User avatar + dropdown ── */}
          <div ref={userRef} className="relative">
            <button
              id="user-menu-btn"
              onClick={() => { setUserOpen((p) => !p); setNotifOpen(false); }}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
                <p className="text-[10px] text-gray-400 leading-none">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${ROLE_COLORS[currentRole as UserRole]}`}>
                    {currentRole}
                  </span>
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userOpen ? "rotate-180" : ""}`} />
            </button>

            {userOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl
                              border border-gray-100 z-50 animate-fade-in overflow-hidden py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{user?.email}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[currentRole as UserRole]}`}>
                    {currentRole}
                  </span>
                </div>

                <button
                  onClick={() => { showToast("Profile settings coming soon!", "info"); setUserOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserCircle2 className="w-4 h-4 text-gray-400" />
                  My Profile
                </button>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    id="logout-btn"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
