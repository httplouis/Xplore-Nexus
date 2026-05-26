import type { Event } from "@/types";
import { CURRENT_USER_ID } from "./users";

export let MOCK_EVENTS: Event[] = [
  {
    id: "ev-001",
    name: "Annual Strategy Summit 2026",
    description: "A high-level strategic planning session for all department heads and key stakeholders.",
    type: "Online",
    status: "Upcoming",
    date: "2026-04-20T09:00:00.000Z",
    endDate: "2026-04-20T17:00:00.000Z",
    location: "https://meet.xplore.io/strategy-summit",
    organizerId: "u-002",
    organizerName: "Maria Santos",
    participantCount: 45,
    maxParticipants: 100,
    isOwner: false,
    tags: ["Strategy", "Leadership", "All-hands"],
    createdAt: "2026-03-01T00:00:00.000Z",
    isPaid: true,
    ticketPrice: 500,
    joinCode: "XPL-SM26-2026",
    registrationCount: 45,
  },
  {
    id: "ev-002",
    name: "Product Launch Webinar",
    description: "Official launch presentation for Xplore Nexus v2.0 with live demo and Q&A.",
    type: "Online",
    status: "Upcoming",
    date: "2026-04-23T14:00:00.000Z",
    endDate: "2026-04-23T16:00:00.000Z",
    location: "https://meet.xplore.io/product-launch",
    organizerId: "u-003",
    organizerName: "John Reyes",
    participantCount: 67,
    maxParticipants: 100,
    isOwner: false,
    tags: ["Product", "Launch", "Webinar"],
    createdAt: "2026-03-10T00:00:00.000Z",
    isPaid: false,
    ticketPrice: 0,
    joinCode: "XPL-PL26-2026",
    registrationCount: 67,
  },
  {
    id: "ev-003",
    name: "Team Building Activity",
    description: "Full-day team building and bonding activity for all staff at the Laguna Nature Camp.",
    type: "Onsite",
    status: "Upcoming",
    date: "2026-04-27T10:00:00.000Z",
    endDate: "2026-04-27T18:00:00.000Z",
    location: "Laguna Nature Camp, Sta. Rosa Laguna",
    organizerId: CURRENT_USER_ID,
    organizerName: "Jose Dela Cruz",
    participantCount: 35,
    maxParticipants: 50,
    isOwner: true,
    tags: ["Team Building", "Onsite", "Wellness"],
    createdAt: "2026-03-20T00:00:00.000Z",
    isPaid: true,
    ticketPrice: 250,
    joinCode: "XPL-TB27-2026",
    registrationCount: 35,
  },
  {
    id: "ev-004",
    name: "Quarterly Review Meeting",
    description: "End-of-quarter business review covering OKRs, financials, and roadmap adjustments.",
    type: "Hybrid",
    status: "Completed",
    date: "2026-03-28T15:00:00.000Z",
    endDate: "2026-03-28T17:00:00.000Z",
    location: "HQ Board Room + Online",
    organizerId: "u-005",
    organizerName: "Robert Tan",
    participantCount: 28,
    maxParticipants: 40,
    isOwner: false,
    tags: ["Finance", "OKRs", "Quarterly"],
    createdAt: "2026-03-01T00:00:00.000Z",
    isPaid: false,
    ticketPrice: 0,
    joinCode: "XPL-QR28-2026",
    registrationCount: 28,
  },
  {
    id: "ev-005",
    name: "HR Policy Town Hall",
    description: "Open forum to discuss updated HR policies and gather employee feedback.",
    type: "Hybrid",
    status: "Upcoming",
    date: "2026-05-05T09:00:00.000Z",
    endDate: "2026-05-05T11:00:00.000Z",
    location: "Main Hall + Online",
    organizerId: CURRENT_USER_ID,
    organizerName: "Jose Dela Cruz",
    participantCount: 72,
    maxParticipants: 100,
    isOwner: true,
    tags: ["HR", "Policy", "Townhall"],
    createdAt: "2026-04-01T00:00:00.000Z",
    isPaid: false,
    ticketPrice: 0,
    joinCode: "XPL-HR05-2026",
    registrationCount: 72,
  },
];

export function getEventById(id: string): Event | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

export function addEvent(event: Event): void {
  MOCK_EVENTS = [event, ...MOCK_EVENTS];
}

export function updateEvent(id: string, patch: Partial<Event>): Event | undefined {
  const idx = MOCK_EVENTS.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  MOCK_EVENTS[idx] = { ...MOCK_EVENTS[idx], ...patch };
  return MOCK_EVENTS[idx];
}

export function deleteEvent(id: string): boolean {
  const before = MOCK_EVENTS.length;
  MOCK_EVENTS = MOCK_EVENTS.filter((e) => e.id !== id);
  return MOCK_EVENTS.length < before;
}
