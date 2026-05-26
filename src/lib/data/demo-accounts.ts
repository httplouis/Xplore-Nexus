import type { AuthUser } from "@/types";

/**
 * Demo accounts — one per role.
 * Shared between the API route (server) and the login page / RoleContext (client).
 * Must NOT have "use client" — it's plain data.
 */
export const DEMO_ACCOUNTS: AuthUser[] = [
  {
    id: "u-001",
    firstName: "Jose",
    lastName: "Dela Cruz",
    email: "jose.dc@xplore.io",
    role: "Admin",
    status: "Active",
    department: "Information Technology",
    avatarInitials: "JDC",
    lastActive: new Date().toISOString(),
    createdAt: "2025-01-10T00:00:00.000Z",
    bio: "Platform administrator for Xplore Nexus.",
    phone: "+63 912 345 6789",
  },
  {
    id: "u-002",
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@xplore.io",
    role: "Organizer",
    status: "Active",
    department: "Events & Communications",
    avatarInitials: "MS",
    lastActive: new Date().toISOString(),
    createdAt: "2025-02-14T00:00:00.000Z",
  },
  {
    id: "u-004",
    firstName: "Anna",
    lastName: "Cruz",
    email: "anna.cruz@xplore.io",
    role: "Instructor",
    status: "Active",
    department: "Learning & Development",
    avatarInitials: "AC",
    lastActive: new Date().toISOString(),
    createdAt: "2025-03-15T00:00:00.000Z",
  },
  {
    id: "u-007",
    firstName: "Carlos",
    lastName: "Bautista",
    email: "carlos.bautista@xplore.io",
    role: "Participant",
    status: "Active",
    department: "Finance",
    avatarInitials: "CB",
    lastActive: new Date().toISOString(),
    createdAt: "2025-05-05T00:00:00.000Z",
  },
];
