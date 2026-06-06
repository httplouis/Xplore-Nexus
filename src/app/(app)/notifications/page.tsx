"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Video, BookOpen, Settings2, CheckCheck, Dot } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { useRole } from "@/lib/context/RoleContext";
import {
  getNotificationsByUser,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  type AppNotification,
  type NotificationCategory,
} from "@/lib/data/notifications";

// metadata must be in a server component; we export it here for reference only
// export const metadata: Metadata = { title: "Notifications | Xplore Nexus" };

const CATEGORY_TABS: { id: NotificationCategory | "all"; label: string; Icon: React.ElementType }[] = [
  { id: "all",      label: "All",      Icon: Bell },
  { id: "event",    label: "Events",   Icon: Calendar },
  { id: "meeting",  label: "Meetings", Icon: Video },
  { id: "training", label: "Training", Icon: BookOpen },
  { id: "system",   label: "System",   Icon: Settings2 },
];

const CATEGORY_ICON: Record<NotificationCategory, React.ElementType> = {
  event:    Calendar,
  meeting:  Video,
  training: BookOpen,
  system:   Settings2,
};

const CATEGORY_COLOR: Record<NotificationCategory, string> = {
  event:    "bg-red-50 text-[#8B1A1A]",
  meeting:  "bg-blue-50 text-blue-600",
  training: "bg-amber-50 text-amber-600",
  system:   "bg-gray-100 text-gray-600",
};

const PRIORITY_DOT: Record<string, string> = {
  high:   "text-red-500",
  normal: "text-blue-400",
  low:    "text-gray-300",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { user } = useRole(); // Get current user
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<NotificationCategory | "all">("all");

  // Load user-specific notifications on mount
  useEffect(() => {
    if (user) {
      const userNotifications = getNotificationsByUser(user.id);
      setNotifications(userNotifications);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.category === activeTab);

  function handleMarkRead(id: string) {
    if (!user) return;
    markAsRead(id, user.id);
    setNotifications(getNotificationsByUser(user.id));
  }

  function handleMarkAllRead() {
    if (!user) return;
    markAllAsRead(user.id);
    setNotifications(getNotificationsByUser(user.id));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your alerts and system updates
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#8B1A1A] text-white">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {CATEGORY_TABS.map(({ id, label, Icon }) => {
          const tabCount = id === "all"
            ? notifications.filter((n) => !n.read).length
            : notifications.filter((n) => n.category === id && !n.read).length;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {tabCount > 0 && (
                <span className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-[#8B1A1A] text-white text-[10px] font-bold">
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">No notifications here</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((notif, i) => {
              const Icon = CATEGORY_ICON[notif.category];
              const colorCls = CATEGORY_COLOR[notif.category];
              return (
                <li
                  key={notif.id}
                  className={`flex gap-4 px-5 py-4 transition-colors ${
                    !notif.read ? "bg-red-50/30" : "hover:bg-gray-50/50"
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Category icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${colorCls}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!notif.read && (
                          <Dot className={`w-4 h-4 -ml-1 flex-shrink-0 ${PRIORITY_DOT[notif.priority]}`} />
                        )}
                        <p className={`text-sm font-semibold ${notif.read ? "text-gray-700" : "text-gray-900"}`}>
                          {notif.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notif.timestamp)}</span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>

                    <div className="flex items-center gap-3 mt-2">
                      {notif.actionLabel && notif.actionHref && (
                        <Link
                          href={notif.actionHref}
                          className="text-xs font-semibold text-[#8B1A1A] hover:text-[#7B1414] transition-colors"
                        >
                          {notif.actionLabel} →
                        </Link>
                      )}
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
