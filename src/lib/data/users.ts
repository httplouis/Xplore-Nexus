import type { User, AuthUser } from "@/types";

/** The currently "logged-in" demo user. In a real app this comes from the session. */
export const CURRENT_USER_ID = "u-001";

export const MOCK_USERS: User[] = [
  {
    id: "u-001",
    firstName: "Jose",
    lastName: "Dela Cruz",
    email: "jose.dc@xplore.io",
    role: "Admin",
    status: "Active",
    department: "Information Technology",
    avatarInitials: "JDC",
    lastActive: "2026-04-15T00:00:00.000Z",
    createdAt: "2025-01-10T00:00:00.000Z",
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
    lastActive: "2026-04-13T00:00:00.000Z",
    createdAt: "2025-02-14T00:00:00.000Z",
  },
  {
    id: "u-003",
    firstName: "John",
    lastName: "Reyes",
    email: "john.reyes@xplore.io",
    role: "Organizer",
    status: "Active",
    department: "Product",
    avatarInitials: "JR",
    lastActive: "2026-04-12T00:00:00.000Z",
    createdAt: "2025-03-01T00:00:00.000Z",
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
    lastActive: "2026-04-11T00:00:00.000Z",
    createdAt: "2025-03-15T00:00:00.000Z",
  },
  {
    id: "u-005",
    firstName: "Robert",
    lastName: "Tan",
    email: "robert.tan@xplore.io",
    role: "Organizer",
    status: "Active",
    department: "Operations",
    avatarInitials: "RT",
    lastActive: "2026-04-10T00:00:00.000Z",
    createdAt: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "u-006",
    firstName: "Lisa",
    lastName: "Gomez",
    email: "lisa.gomez@xplore.io",
    role: "Participant",
    status: "Inactive",
    department: "Marketing",
    avatarInitials: "LG",
    lastActive: "2026-03-28T00:00:00.000Z",
    createdAt: "2025-04-20T00:00:00.000Z",
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
    lastActive: "2026-04-09T00:00:00.000Z",
    createdAt: "2025-05-05T00:00:00.000Z",
  },
];

export const MOCK_AUTH_USER: AuthUser = {
  ...MOCK_USERS[0],
  bio: "Platform administrator for Xplore Nexus.",
  phone: "+63 912 345 6789",
};

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}
