import type { Meeting } from "@/types";
import { CURRENT_USER_ID } from "./users";

export let MOCK_MEETINGS: Meeting[] = [
  {
    id: "mt-001",
    title: "Leadership Training Workshop",
    description: "Live session covering advanced leadership frameworks and practical exercises.",
    status: "Live",
    date: "2026-04-15T06:00:00.000Z",
    duration: 60,
    hostId: "u-002",
    hostName: "Maria Santos",
    participantCount: 28,
    maxParticipants: 50,
    meetingUrl: "https://meet.xplore.io/leadership-workshop",
    isHost: false,
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "mt-002",
    title: "Product Review Meeting",
    description: "Weekly product sync to review feature progress and blockers.",
    status: "Upcoming",
    date: "2026-04-16T02:00:00.000Z",
    duration: 45,
    hostId: "u-003",
    hostName: "John Reyes",
    participantCount: 12,
    maxParticipants: 20,
    meetingUrl: "https://meet.xplore.io/product-review",
    isHost: false,
    createdAt: "2026-04-10T00:00:00.000Z",
  },
  {
    id: "mt-003",
    title: "Weekly Team Sync",
    description: "Monday team sync — priorities, blockers, weekend updates.",
    status: "Upcoming",
    date: "2026-04-17T07:00:00.000Z",
    duration: 30,
    hostId: CURRENT_USER_ID,
    hostName: "Jose Dela Cruz",
    participantCount: 8,
    maxParticipants: 15,
    meetingUrl: "https://meet.xplore.io/team-sync",
    isHost: true,
    createdAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "mt-004",
    title: "Client Presentation",
    description: "Final presentation of Phase 1 deliverables to the Lazada account.",
    status: "Completed",
    date: "2026-03-29T03:00:00.000Z",
    duration: 120,
    hostId: "u-005",
    hostName: "Robert Tan",
    participantCount: 15,
    maxParticipants: 25,
    meetingUrl: undefined,
    isHost: false,
    createdAt: "2026-03-20T00:00:00.000Z",
  },
  {
    id: "mt-005",
    title: "IT Infrastructure Review",
    description: "Quarterly review of server performance, security patches, and cloud costs.",
    status: "Upcoming",
    date: "2026-04-22T05:00:00.000Z",
    duration: 60,
    hostId: CURRENT_USER_ID,
    hostName: "Jose Dela Cruz",
    participantCount: 5,
    maxParticipants: 10,
    meetingUrl: "https://meet.xplore.io/it-review",
    isHost: true,
    createdAt: "2026-04-13T00:00:00.000Z",
  },
];

export function getMeetingById(id: string): Meeting | undefined {
  return MOCK_MEETINGS.find((m) => m.id === id);
}

export function addMeeting(meeting: Meeting): void {
  MOCK_MEETINGS = [meeting, ...MOCK_MEETINGS];
}

export function updateMeeting(id: string, patch: Partial<Meeting>): Meeting | undefined {
  const idx = MOCK_MEETINGS.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  MOCK_MEETINGS[idx] = { ...MOCK_MEETINGS[idx], ...patch };
  return MOCK_MEETINGS[idx];
}

export function deleteMeeting(id: string): boolean {
  const before = MOCK_MEETINGS.length;
  MOCK_MEETINGS = MOCK_MEETINGS.filter((m) => m.id !== id);
  return MOCK_MEETINGS.length < before;
}
