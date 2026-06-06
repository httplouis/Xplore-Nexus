export type NotificationCategory = "event" | "meeting" | "training" | "system";
export type NotificationPriority = "high" | "normal" | "low";

export interface AppNotification {
  id: string;
  userId: string; // Owner of this notification
  category: NotificationCategory;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  timestamp: string; // ISO
  actionLabel?: string;
  actionHref?: string;
}

export let MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    userId: "u-001", // Jose Dela Cruz
    category: "event",
    title: "Event Starting Soon",
    message: "Annual Strategy Summit 2026 starts in 1 hour. Make sure you're prepared!",
    priority: "high",
    read: false,
    timestamp: "2026-05-06T08:00:00.000Z",
    actionLabel: "View Event",
    actionHref: "/events/ev-001",
  },
  {
    id: "notif-002",
    userId: "u-001", // Jose Dela Cruz
    category: "meeting",
    title: "Meeting Invitation",
    message: "Maria Santos has added you to the Q2 Planning Standup scheduled for today at 3:00 PM.",
    priority: "high",
    read: false,
    timestamp: "2026-05-06T07:30:00.000Z",
    actionLabel: "View Meeting",
    actionHref: "/meetings",
  },
  {
    id: "notif-003",
    userId: "u-001", // Jose Dela Cruz
    category: "training",
    title: "New Module Published",
    message: "A new module 'Advanced SEO Tactics' has been added to Digital Marketing Fundamentals.",
    priority: "normal",
    read: false,
    timestamp: "2026-05-05T14:00:00.000Z",
    actionLabel: "Continue Training",
    actionHref: "/training",
  },
  {
    id: "notif-004",
    userId: "u-001", // Jose Dela Cruz
    category: "system",
    title: "Scheduled Maintenance",
    message: "Xplore Nexus will undergo scheduled maintenance on May 8, 2026 from 2:00–4:00 AM PHT.",
    priority: "normal",
    read: true,
    timestamp: "2026-05-04T10:00:00.000Z",
  },
  {
    id: "notif-005",
    userId: "u-001", // Jose Dela Cruz
    category: "event",
    title: "Registration Confirmed",
    message: "Your registration for the HR Policy Town Hall on May 5 has been confirmed. Ticket: TKT-A9B2C1.",
    priority: "normal",
    read: true,
    timestamp: "2026-05-03T09:15:00.000Z",
    actionLabel: "View Event",
    actionHref: "/events/ev-005",
  },
  {
    id: "notif-006",
    userId: "u-007", // Carlos Bautista (Participant)
    category: "training",
    title: "Training Completed 🎉",
    message: "Congratulations! You've completed the Leadership Excellence Program. Your certificate is ready.",
    priority: "high",
    read: false,
    timestamp: "2026-05-02T16:30:00.000Z",
    actionLabel: "View Certificate",
    actionHref: "/training",
  },
  {
    id: "notif-007",
    userId: "u-007", // Carlos Bautista (Participant)
    category: "meeting",
    title: "Meeting Recording Available",
    message: "The recording for last week's Agile Sprint Review is now available to watch.",
    priority: "low",
    read: true,
    timestamp: "2026-04-30T11:00:00.000Z",
    actionLabel: "Watch Recording",
    actionHref: "/meetings",
  },
  {
    id: "notif-008",
    userId: "u-001", // Jose Dela Cruz
    category: "system",
    title: "New Feature: Live Streaming",
    message: "Xplore Nexus now supports live event streaming. Check it out in the Stream section!",
    priority: "low",
    read: true,
    timestamp: "2026-04-28T09:00:00.000Z",
    actionLabel: "Explore",
    actionHref: "/stream",
  },
];

/**
 * Get notifications for a specific user
 */
export function getNotificationsByUser(userId: string): AppNotification[] {
  return MOCK_NOTIFICATIONS.filter((n) => n.userId === userId);
}

export function markAsRead(id: string, userId: string): void {
  const n = MOCK_NOTIFICATIONS.find((n) => n.id === id && n.userId === userId);
  if (n) n.read = true;
}

export function markAllAsRead(userId: string): void {
  MOCK_NOTIFICATIONS.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
}

export function getUnreadCount(userId: string): number {
  return MOCK_NOTIFICATIONS.filter((n) => n.userId === userId && !n.read).length;
}
