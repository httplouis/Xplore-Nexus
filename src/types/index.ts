// ─── Shared primitives ──────────────────────────────────────────────────────

export type UserRole = "Admin" | "Organizer" | "Instructor" | "Participant";
export type UserStatus = "Active" | "Inactive";

export type EventType = "Online" | "Onsite" | "Hybrid";
export type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
export type RegistrationStatus = "Confirmed" | "Pending" | "Cancelled";

export type MeetingStatus = "Live" | "Upcoming" | "Completed" | "Cancelled";

export type TrainingStatus = "Not Started" | "In Progress" | "Completed";
export type TrainingCategory =
  | "Marketing"
  | "Management"
  | "Analytics"
  | "Leadership"
  | "Technology"
  | "Finance"
  | "HR";

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  avatarInitials: string;
  lastActive: string; // ISO date string
  createdAt: string;
}

export interface AuthUser extends User {
  bio?: string;
  phone?: string;
}

// ─── Event ───────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  name: string;
  description: string;
  type: EventType;
  status: EventStatus;
  date: string;            // ISO datetime string
  endDate: string;
  location: string;        // URL for online, address for onsite
  organizerId: string;
  organizerName: string;
  participantCount: number;
  maxParticipants: number; // 1–100, default 50
  isOwner: boolean;        // relative to the current session user
  tags: string[];
  createdAt: string;
  // ── Ticket fields ───────────────────────────────────────────────────────
  isPaid: boolean;         // false = free, true = paid
  ticketPrice: number;     // PHP amount (0 if free)
  joinCode: string;        // event-level code e.g. "XPL-K7M2-2026"
  registrationCount: number; // how many have registered so far
}

// ─── Registration ─────────────────────────────────────────────────────────────

export interface Registration {
  id: string;
  eventId: string;
  eventName: string;
  userId: string;
  userName: string;
  userEmail: string;
  ticketCode: string;      // personal code e.g. "TKT-A3B7C9"
  status: RegistrationStatus;
  paymentRef?: string;     // Informatics / gateway reference number
  registeredAt: string;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  type: EventType;
  date: string;
  endDate: string;
  location: string;
  maxParticipants: number; // max 100
  tags?: string[];
  isPaid: boolean;
  ticketPrice: number;
}

// ─── Meeting ─────────────────────────────────────────────────────────────────

export interface Meeting {
  id: string;
  title: string;
  description: string;
  status: MeetingStatus;
  date: string; // ISO datetime string
  duration: number; // minutes
  hostId: string;
  hostName: string;
  participantCount: number;
  maxParticipants?: number;
  meetingUrl?: string;
  /** Zoom numeric meeting ID — present when created via the Zoom API */
  zoomMeetingId?: number;
  isHost: boolean;
  createdAt: string;
}

export interface CreateMeetingPayload {
  title: string;
  description: string;
  date: string;
  duration: number;
  maxParticipants?: number;
}

// ─── Training ────────────────────────────────────────────────────────────────

export interface Training {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  status: TrainingStatus;
  instructorId: string;
  instructorName: string;
  isInstructor: boolean;
  totalHours: number;
  moduleCount: number;
  enrollmentCount: number;
  progress: number; // 0-100, relative to the current session user
  completed: boolean;
  progressColor: string;
  tags: string[];
  createdAt: string;
}

export interface CreateTrainingPayload {
  title: string;
  description: string;
  category: TrainingCategory;
  totalHours: number;
  moduleCount: number;
  tags?: string[];
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsKPI {
  totalParticipants: number;
  eventsHosted: number;
  avgAttendance: number; // percentage
  certifications: number;
  participantGrowth: number; // percentage
  eventsGrowth: number;
  attendanceGrowth: number;
  certificationsGrowth: number;
}

export interface AttendanceTrendPoint {
  month: string;
  value: number; // percentage
}

export interface EngagementSegment {
  label: string;
  pct: number;
  color: string;
}

export interface CompletionRate {
  category: TrainingCategory;
  pct: number;
  color: string;
}

export interface AnalyticsDashboard {
  kpi: AnalyticsKPI;
  attendanceTrend: AttendanceTrendPoint[];
  engagement: EngagementSegment[];
  completionRates: CompletionRate[];
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardKPI {
  totalEvents: number;
  activeTrainings: number;
  attendanceRate: number;
  engagementScore: number;
  eventsGrowth: number;
  trainingsGrowth: number;
  attendanceGrowth: number;
  engagementGrowth: number;
}

export interface LiveSession {
  id: string;
  title: string;
  type: "Training" | "Meeting" | "Event";
  presenterId: string;
  presenterName: string;
  participantCount: number;
  minutesRemaining: number;
}

export interface DashboardData {
  kpi: DashboardKPI;
  upcomingEvents: Event[];
  trainingProgress: Pick<Training, "id" | "title" | "progress" | "progressColor">[];
  liveSession: LiveSession | null;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
